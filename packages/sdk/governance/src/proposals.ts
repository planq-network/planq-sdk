import { Address, isHexString, trimLeading0x } from '@planq-network/base/lib/address'
import {
  AbiCoder,
  ABIDefinition,
  AbiItem,
  PlanqTransactionObject,
  PlanqTxObject,
  PlanqTxPending,
  Contract,
  getAbiByName,
  parseDecodedParams,
  signatureToAbiDefinition,
} from '@planq-network/connect'
import {
  PlanqContract,
  ContractKit,
  RegisteredContracts,
  REGISTRY_CONTRACT_ADDRESS,
} from '@planq-network/contractkit'
import { stripProxy, suffixProxy } from '@planq-network/contractkit/lib/base'
import { ABI as GovernanceABI } from '@planq-network/contractkit/lib/generated/Governance'
import { ABI as RegistryABI } from '@planq-network/contractkit/lib/generated/Registry'
// tslint:disable: ordered-imports
import {
  getInitializeAbiOfImplementation,
  SET_AND_INITIALIZE_IMPLEMENTATION_ABI,
  SET_IMPLEMENTATION_ABI,
  setImplementationOnProxy,
} from '@planq-network/contractkit/lib/proxy'
// tslint:enable: ordered-imports
import { valueToString } from '@planq-network/contractkit/lib/wrappers/BaseWrapper'
import {
  hotfixToParams,
  Proposal,
  ProposalTransaction,
} from '@planq-network/contractkit/lib/wrappers/Governance'
import { newBlockExplorer } from '@planq-network/explorer'
import { fetchMetadata, tryGetProxyImplementation } from '@planq-network/explorer/lib/sourcify'
import { isValidAddress } from '@planq-network/utils/lib/address'
import { fromFixed } from '@planq-network/utils/lib/fixidity'
import { BigNumber } from 'bignumber.js'
import debugFactory from 'debug'
import { keccak256 } from 'ethereum-cryptography/keccak'
import { utf8ToBytes } from 'ethereum-cryptography/utils'
import * as inquirer from 'inquirer'

const debug = debugFactory('governance:proposals')

export const hotfixExecuteAbi = getAbiByName(GovernanceABI, 'executeHotfix')

export const hotfixToEncodedParams = (kit: ContractKit, proposal: Proposal, salt: Buffer) =>
  kit.connection.getAbiCoder().encodeParameters(
    hotfixExecuteAbi.inputs!.map((input) => input.type),
    hotfixToParams(proposal, salt)
  )

export const hotfixToHash = (kit: ContractKit, proposal: Proposal, salt: Buffer) =>
  keccak256(utf8ToBytes(hotfixToEncodedParams(kit, proposal, salt))) as Buffer

/**
 * JSON encoding of a proposal transaction.
 *
 * Example:
 * ```json
 * {
 *   "contract": "Election",
 *   "function": "setElectableValidators",
 *   "args": [ "1", "120" ],
 *   "value": "0"
 * }
 * ```
 */
export interface ProposalTransactionJSON {
  contract: PlanqContract
  address?: Address
  function: string
  args: any[]
  params?: Record<string, any>
  value: string
}

const isRegistryRepoint = (tx: ProposalTransactionJSON) =>
  tx.contract === 'Registry' && tx.function === 'setAddressFor'

const isGovernanceConstitutionSetter = (tx: ProposalTransactionJSON) =>
  tx.contract === 'Governance' && tx.function === 'setConstitution'

const registryRepointArgs = (tx: ProposalTransactionJSON) => {
  if (!isRegistryRepoint(tx)) {
    throw new Error(`Proposal transaction not a registry repoint:\n${JSON.stringify(tx, null, 2)}`)
  }
  return {
    name: tx.args[0] as PlanqContract,
    address: tx.args[1] as string,
  }
}

const setAddressAbi = getAbiByName(RegistryABI, 'setAddressFor')

const isRegistryRepointRaw = (abiCoder: AbiCoder, tx: ProposalTransaction) =>
  tx.to === REGISTRY_CONTRACT_ADDRESS &&
  tx.input.startsWith(abiCoder.encodeFunctionSignature(setAddressAbi))

const registryRepointRawArgs = (abiCoder: AbiCoder, tx: ProposalTransaction) => {
  if (!isRegistryRepointRaw(abiCoder, tx)) {
    throw new Error(`Proposal transaction not a registry repoint:\n${JSON.stringify(tx, null, 2)}`)
  }
  const params = abiCoder.decodeParameters(setAddressAbi.inputs!, trimLeading0x(tx.input).slice(8))
  return {
    name: params.identifier as PlanqContract,
    address: params.addr,
  }
}

const isProxySetAndInitFunction = (tx: ProposalTransactionJSON) =>
  tx.function === SET_AND_INITIALIZE_IMPLEMENTATION_ABI.name!

const isProxySetFunction = (tx: ProposalTransactionJSON) =>
  tx.function === SET_IMPLEMENTATION_ABI.name!

/**
 * Convert a compiled proposal to a human-readable JSON form using network information.
 * @param kit Contract kit instance used to resolve addresses to contract names.
 * @param proposal A constructed proposal object.
 * @param registryAdditions Registry remappings prior to parsing the proposal as a map of name to corresponding contract address.
 * @returns The JSON encoding of the proposal.
 */
export const proposalToJSON = async (
  kit: ContractKit,
  proposal: Proposal,
  registryAdditions?: RegistryAdditions
) => {
  const blockExplorer = await newBlockExplorer(kit)

  const updateRegistryMapping = async (name: PlanqContract, address: Address) => {
    debug(`updating registry to reflect ${name} => ${address}`)
    await blockExplorer.updateContractDetailsMapping(stripProxy(name), address)
  }

  if (registryAdditions) {
    // Update the registry mapping with registry additions prior to processing the proposal.
    for (const nameStr of Object.keys(registryAdditions)) {
      const name = nameStr as PlanqContract
      if (PlanqContract[name]) {
        await updateRegistryMapping(name, registryAdditions[name])
      } else {
        debug(`Name ${nameStr} in registry additions not a PlanqContract`)
      }
    }
  }

  const abiCoder = kit.connection.getAbiCoder()
  const proposalJson: ProposalTransactionJSON[] = []

  for (const tx of proposal) {
    debug(`decoding tx ${JSON.stringify(tx)}`)
    const parsedTx = await blockExplorer.tryParseTx(tx as PlanqTxPending)
    if (parsedTx == null) {
      throw new Error(`Unable to parse ${JSON.stringify(tx)} with block explorer`)
    }

    if (isRegistryRepointRaw(abiCoder, tx) && parsedTx.callDetails.isCoreContract) {
      const args = registryRepointRawArgs(abiCoder, tx)
      await updateRegistryMapping(args.name, args.address)
    }

    const jsonTx: ProposalTransactionJSON = {
      contract: parsedTx.callDetails.contract as PlanqContract,
      address: parsedTx.callDetails.contractAddress,
      function: parsedTx.callDetails.function,
      args: parsedTx.callDetails.argList,
      params: parsedTx.callDetails.paramMap,
      value: parsedTx.tx.value,
    }

    if (isProxySetFunction(jsonTx)) {
      jsonTx.contract = suffixProxy(jsonTx.contract)
      await blockExplorer.setProxyOverride(tx.to!, jsonTx.args[0])
    } else if (isProxySetAndInitFunction(jsonTx)) {
      await blockExplorer.setProxyOverride(tx.to!, jsonTx.args[0])
      let initAbi
      if (parsedTx.callDetails.isCoreContract) {
        jsonTx.contract = suffixProxy(jsonTx.contract)
        initAbi = getInitializeAbiOfImplementation(jsonTx.contract as any)
      } else {
        const implAddress = jsonTx.args[0]
        const metadata = await fetchMetadata(kit.connection, implAddress)
        if (metadata && metadata.abi) {
          initAbi = metadata?.abiForMethod('initialize')[0]
        }
      }

      if (initAbi !== undefined) {
        // Transform delegate call initialize args into a readable params map
        // 8 bytes for function sig
        const initSig = trimLeading0x(jsonTx.args[1]).slice(0, 8)
        const initArgs = trimLeading0x(jsonTx.args[1]).slice(8)

        const { params: initParams } = parseDecodedParams(
          kit.connection.getAbiCoder().decodeParameters(initAbi.inputs!, initArgs)
        )
        jsonTx.params![`initialize@${initSig}`] = initParams
      }
    } else if (isGovernanceConstitutionSetter(jsonTx)) {
      const [address, functionId, threshold] = jsonTx.args
      const contractMapping = await blockExplorer.getContractMappingWithSelector(
        address,
        functionId
      )
      if (contractMapping === undefined) {
        throw new Error(
          `Governance.setConstitution targets unknown address ${address} and function id ${functionId}`
        )
      }
      jsonTx.params![`setConstitution[${address}][${functionId}]`] = {
        contract: contractMapping.details.name,
        method: contractMapping.fnMapping.get(functionId)?.name,
        threshold: fromFixed(new BigNumber(threshold)),
      }
    }

    proposalJson.push(jsonTx)
  }
  return proposalJson
}

type ProposalTxParams = Pick<ProposalTransaction, 'to' | 'value'>
interface RegistryAdditions {
  [contractName: string]: Address
}

/**
 * Builder class to construct proposals from JSON or transaction objects.
 */
export class ProposalBuilder {
  externalCallProxyRepoint: Map<string, string> = new Map()

  constructor(
    private readonly kit: ContractKit,
    private readonly builders: Array<() => Promise<ProposalTransaction>> = [],
    public readonly registryAdditions: RegistryAdditions = {}
  ) {}

  /**
   * Build calls all of the added build steps and returns the final proposal.
   * @returns A constructed Proposal object (i.e. a list of ProposalTransaction)
   */
  build = async () => {
    const ret = []
    for (const builder of this.builders) {
      ret.push(await builder())
    }
    return ret
  }

  /**
   * Converts a Web3 transaction into a proposal transaction object.
   * @param tx A Web3 transaction object to convert.
   * @param params Parameters for how the transaction should be executed.
   */
  fromWeb3tx = (tx: PlanqTxObject<any>, params: ProposalTxParams): ProposalTransaction => ({
    value: params.value,
    to: params.to,
    input: tx.encodeABI(),
  })

  /**
   * Adds a transaction to set the implementation on a proxy to the given address.
   * @param contract Planq contract name of the proxy which should have its implementation set.
   * @param newImplementationAddress Address of the new contract implementation.
   */
  addProxyRepointingTx = (contract: PlanqContract, newImplementationAddress: string) => {
    this.builders.push(async () => {
      const proxy = await this.kit._web3Contracts.getContract(contract)
      return this.fromWeb3tx(
        setImplementationOnProxy(newImplementationAddress, this.kit.connection.web3),
        {
          to: proxy.options.address,
          value: '0',
        }
      )
    })
  }

  /**
   * Adds a Web3 transaction to the list for proposal construction.
   * @param tx A Web3 transaction object to add to the proposal.
   * @param params Parameters for how the transaction should be executed.
   */
  addWeb3Tx = (tx: PlanqTxObject<any>, params: ProposalTxParams) =>
    this.builders.push(async () => this.fromWeb3tx(tx, params))

  /**
   * Adds a Planq transaction to the list for proposal construction.
   * @param tx A Planq transaction object to add to the proposal.
   * @param params Optional parameters for how the transaction should be executed.
   */
  addTx(tx: PlanqTransactionObject<any>, params: Partial<ProposalTxParams> = {}) {
    const to = params.to ?? tx.defaultParams?.to
    const value = params.value ?? tx.defaultParams?.value
    if (!to || !value) {
      throw new Error("Transaction parameters 'to' and/or 'value' not provided")
    }
    // TODO fix type of value
    this.addWeb3Tx(tx.txo, { to, value: valueToString(value.toString()) })
  }

  setRegistryAddition = (contract: PlanqContract, address: string) =>
    (this.registryAdditions[stripProxy(contract)] = address)

  getRegistryAddition = (contract: PlanqContract): string | undefined =>
    this.registryAdditions[stripProxy(contract)]

  isRegistryContract = (contract: PlanqContract) =>
    RegisteredContracts.includes(stripProxy(contract)) ||
    this.getRegistryAddition(contract) !== undefined

  /*
   * @deprecated - use isRegistryContract
   */
  isRegistered = this.isRegistryContract

  lookupExternalMethodABI = async (
    address: string,
    tx: ProposalTransactionJSON
  ): Promise<AbiItem | null> => {
    const abiCoder = this.kit.connection.getAbiCoder()
    const metadata = await fetchMetadata(this.kit.connection, address)
    const potentialABIs = metadata?.abiForMethod(tx.function) ?? []
    return (
      potentialABIs.find((abi) => {
        try {
          abiCoder.encodeFunctionCall(abi, tx.args)
          return true
        } catch {
          return false
        }
      }) || null
    )
  }

  buildCallToExternalContract = async (
    tx: ProposalTransactionJSON
  ): Promise<ProposalTransaction> => {
    if (!tx.address || !isValidAddress(tx.address)) {
      throw new Error(`${tx.contract} is not a core planq contract so address must be specified`)
    }

    if (tx.function === '') {
      return { input: '', to: tx.address, value: tx.value }
    }

    let methodABI: AbiItem | null = await this.lookupExternalMethodABI(tx.address, tx)
    if (methodABI === null) {
      const proxyImpl = this.externalCallProxyRepoint.has(tx.address)
        ? this.externalCallProxyRepoint.get(tx.address)
        : await tryGetProxyImplementation(this.kit.connection, tx.address)

      if (proxyImpl) {
        methodABI = await this.lookupExternalMethodABI(proxyImpl, tx)
      }
    }

    if (methodABI === null) {
      methodABI = signatureToAbiDefinition(tx.function)
    }

    const input = this.kit.connection.getAbiCoder().encodeFunctionCall(methodABI, tx.args)
    return { input, to: tx.address, value: tx.value }
  }

  /*
   *  @deprecated use buildCallToExternalContract
   *
   */
  buildFunctionCallToExternalContract = this.buildCallToExternalContract

  buildCallToCoreContract = async (tx: ProposalTransactionJSON): Promise<ProposalTransaction> => {
    // Account for canonical registry addresses from current proposal
    const address =
      this.getRegistryAddition(tx.contract) ?? (await this.kit.registry.addressFor(tx.contract))

    if (tx.address && address !== tx.address) {
      throw new Error(`Address mismatch for ${tx.contract}: ${address} !== ${tx.address}`)
    }

    if (tx.function === SET_AND_INITIALIZE_IMPLEMENTATION_ABI.name && Array.isArray(tx.args[1])) {
      // Transform array of initialize arguments (if provided) into delegate call data
      tx.args[1] = this.kit.connection
        .getAbiCoder()
        .encodeFunctionCall(getInitializeAbiOfImplementation(tx.contract as any), tx.args[1])
    }

    const contract = await this.kit._web3Contracts.getContract(tx.contract, address)
    const methodName = tx.function
    const method = (contract.methods as Contract['methods'])[methodName]
    if (!method) {
      throw new Error(`Method ${methodName} not found on ${tx.contract}`)
    }
    const txo = method(...tx.args)
    if (!txo) {
      throw new Error(`Arguments ${tx.args} did not match ${methodName} signature`)
    }

    return this.fromWeb3tx(txo, { to: address, value: tx.value })
  }

  fromJsonTx = async (tx: ProposalTransactionJSON): Promise<ProposalTransaction> => {
    if (isRegistryRepoint(tx)) {
      // Update canonical registry addresses
      const args = registryRepointArgs(tx)
      this.setRegistryAddition(args.name, args.address)
    }

    if (isProxySetAndInitFunction(tx) || isProxySetFunction(tx)) {
      console.log(tx.address + ' is a proxy, repointing to ' + tx.args[0])
      this.externalCallProxyRepoint.set(tx.address || tx.contract, tx.args[0] as string)
    }

    const strategies = [this.buildCallToCoreContract, this.buildCallToExternalContract]

    for (const strategy of strategies) {
      try {
        return await strategy(tx)
      } catch (e) {
        debug("Couldn't build transaction with strategy %s: %O", strategy.name, e)
      }
    }

    throw new Error(`Couldn't build call for transaction: ${JSON.stringify(tx)}`)
  }

  addJsonTx = (tx: ProposalTransactionJSON) => this.builders.push(async () => this.fromJsonTx(tx))
}

const DONE_CHOICE = '✔ done'

export class InteractiveProposalBuilder {
  constructor(private readonly builder: ProposalBuilder) {}

  async outputTransactions() {
    const transactionList = this.builder.build()
    console.log(JSON.stringify(transactionList, null, 2))
  }

  async promptTransactions() {
    const transactions: ProposalTransactionJSON[] = []
    while (true) {
      console.log(`Transaction #${transactions.length + 1}:`)

      // prompt for contract
      const contractPromptName = 'Planq Contract'
      const contractAnswer = await inquirer.prompt({
        name: contractPromptName,
        type: 'list',
        choices: [DONE_CHOICE, ...RegisteredContracts],
      })

      const choice = contractAnswer[contractPromptName]
      if (choice === DONE_CHOICE) {
        break
      }

      const contractName = choice as PlanqContract
      const contractABI = require('@planq-network/contractkit/lib/generated/' + contractName)
        .ABI as ABIDefinition[]

      const txMethods = contractABI.filter(
        (def) => def.type === 'function' && def.stateMutability !== 'view'
      )
      const txMethodNames = txMethods.map((def) => def.name!)

      // prompt for function
      const functionPromptName = contractName + ' Function'
      const functionAnswer = await inquirer.prompt({
        name: functionPromptName,
        type: 'list',
        choices: txMethodNames,
      })
      const functionName = functionAnswer[functionPromptName] as string
      const idx = txMethodNames.findIndex((m) => m === functionName)
      const txDefinition = txMethods[idx]

      // prompt individually for each argument
      const args = []
      for (const functionInput of txDefinition.inputs!) {
        const inputAnswer = await inquirer.prompt({
          name: functionInput.name,
          type: 'input',
          validate: async (input: string) => {
            switch (functionInput.type) {
              case 'uint256':
                try {
                  // tslint:disable-next-line: no-unused-expression
                  new BigNumber(input)
                  return true
                } catch (e) {
                  return false
                }
              case 'boolean':
                return input === 'true' || input === 'false'
              case 'address':
                return isValidAddress(input)
              case 'bytes':
                return isHexString(input)
              default:
                return true
            }
          },
        })

        // @ts-ignore
        const answer: string = inputAnswer[functionInput.name]
        // transformedValue may not be in scientific notation
        const transformedValue =
          functionInput.type === 'uint256' ? new BigNumber(answer).toString(10) : answer
        args.push(transformedValue)
      }

      // prompt for value only when tx is payable
      let value: string
      if (txDefinition.payable) {
        const valuePromptName = 'Value'
        const valueAnswer = await inquirer.prompt({
          name: valuePromptName,
          type: 'input',
        })
        value = valueAnswer[valuePromptName]
      } else {
        value = '0'
      }

      const tx: ProposalTransactionJSON = {
        contract: contractName,
        function: functionName,
        args,
        value,
      }

      try {
        // use fromJsonTx as well-formed tx validation
        await this.builder.fromJsonTx(tx)
        transactions.push(tx)
      } catch (error) {
        console.error(error)
        console.error('Please retry forming this transaction')
      }
    }

    return transactions
  }
}
