import {
  Address,
  PlanqTx,
  PlanqTxObject,
  Connection,
  ReadOnlyWallet,
  TransactionResult,
} from '@planq-network/connect'
import { EIP712TypedData } from '@planq-network/utils/lib/sign-typed-data-utils'
import { Signature } from '@planq-network/utils/lib/signatureUtils'
import { LocalWallet } from '@planq-network/wallet-local'
import { BigNumber } from 'bignumber.js'
import Web3 from 'web3'
import { AddressRegistry } from './address-registry'
import { PlanqContract, PlanqTokenContract } from './base'
import { PlanqTokens, EachPlanqToken } from './planq-tokens'
import { ValidWrappers, WrapperCache } from './contract-cache'
import {
  ensureCurrentProvider,
  getWeb3ForKit,
  HttpProviderOptions,
  setupAPIKey,
} from './setupForKits'
import { Web3ContractCache } from './web3-contract-cache'
import { AttestationsConfig } from './wrappers/Attestations'
import { BlockchainParametersConfig } from './wrappers/BlockchainParameters'
import { DowntimeSlasherConfig } from './wrappers/DowntimeSlasher'
import { ElectionConfig } from './wrappers/Election'
import { ExchangeConfig } from './wrappers/Exchange'
import { GasPriceMinimumConfig } from './wrappers/GasPriceMinimum'
import { GovernanceConfig } from './wrappers/Governance'
import { GrandaMentoConfig } from './wrappers/GrandaMento'
import { LockedPlanqConfig } from './wrappers/LockedPlanq'
import { ReserveConfig } from './wrappers/Reserve'
import { SortedOraclesConfig } from './wrappers/SortedOracles'
import { StableTokenConfig } from './wrappers/StableTokenWrapper'
import { ValidatorsConfig } from './wrappers/Validators'
export { API_KEY_HEADER_KEY, HttpProviderOptions } from './setupForKits'

/**
 * Creates a new instance of `ContractKit` given a nodeUrl
 * @param url PlanqBlockchain node url
 * @optional wallet to reuse or add a wallet different than the default (example ledger-wallet)
 * @optional options to pass to the Web3 HttpProvider constructor
 */
export function newKit(url: string, wallet?: ReadOnlyWallet, options?: HttpProviderOptions) {
  const web3: Web3 = getWeb3ForKit(url, options)
  return newKitFromWeb3(web3, wallet)
}

/**
 * Creates a new instance of `ContractKit` given a nodeUrl and apiKey
 * @param url PlanqBlockchain node url
 * @param apiKey to include in the http request header
 * @optional wallet to reuse or add a wallet different than the default (example ledger-wallet)
 */
export function newKitWithApiKey(url: string, apiKey: string, wallet?: ReadOnlyWallet) {
  const options: HttpProviderOptions = setupAPIKey(apiKey)
  return newKit(url, wallet, options)
}

/**
 * Creates a new instance of the `ContractKit` with a web3 instance
 * @param web3 Web3 instance
 */
export function newKitFromWeb3(web3: Web3, wallet: ReadOnlyWallet = new LocalWallet()) {
  ensureCurrentProvider(web3)
  return new ContractKit(new Connection(web3, wallet))
}
export interface NetworkConfig {
  exchanges: EachPlanqToken<ExchangeConfig>
  stableTokens: EachPlanqToken<StableTokenConfig>
  election: ElectionConfig
  attestations: AttestationsConfig
  governance: GovernanceConfig
  lockedPlanq: LockedPlanqConfig
  sortedOracles: SortedOraclesConfig
  gasPriceMinimum: GasPriceMinimumConfig
  reserve: ReserveConfig
  validators: ValidatorsConfig
  downtimeSlasher: DowntimeSlasherConfig
  blockchainParameters: BlockchainParametersConfig
  grandaMento: GrandaMentoConfig
}

interface AccountBalance extends EachPlanqToken<BigNumber> {
  lockedPLQ: BigNumber
  pending: BigNumber
}
/*
 * ContractKit provides a convenient interface for All Planq Contracts
 *
 * @remarks
 *
 * For most use cases this ContractKit class might be more than you need.
 * Consider {@link MiniContractKit} for a scaled down subset of contract Wrappers,
 * or {@link Connection} for a lighter package without contract Wrappers
 *
 * @param connection – an instance of @planq-network/connect {@link Connection}
 */

export class ContractKit {
  /** core contract's address registry */
  readonly registry: AddressRegistry
  /** factory for core contract's native web3 wrappers  */
  readonly _web3Contracts: Web3ContractCache
  /** factory for core contract's kit wrappers  */
  readonly contracts: WrapperCache
  /** helper for interacting with PLQ & stable tokens */
  readonly planqTokens: PlanqTokens

  /** @deprecated no longer needed since gasPrice is available on node rpc */
  gasPriceSuggestionMultiplier = 5

  constructor(readonly connection: Connection) {
    this.registry = new AddressRegistry(connection)
    this._web3Contracts = new Web3ContractCache(this.registry)
    this.contracts = new WrapperCache(connection, this._web3Contracts, this.registry)
    this.planqTokens = new PlanqTokens(this.contracts, this.registry)
  }

  getWallet() {
    return this.connection.wallet
  }

  async getTotalBalance(address: string): Promise<AccountBalance> {
    const lockedPlanq = await this.contracts.getLockedPlanq()
    const lockedBalance = await lockedPlanq.getAccountTotalLockedPlanq(address)
    let pending = new BigNumber(0)
    try {
      pending = await lockedPlanq.getPendingWithdrawalsTotalValue(address)
    } catch (err) {
      // Just means that it's not an account
    }

    return {
      lockedPLQ: lockedBalance,
      pending,
      ...(await this.planqTokens.balancesOf(address)),
    }
  }

  async getNetworkConfig(
    humanReadable = false
  ): Promise<NetworkConfig | Record<PlanqContract & 'exchanges' & 'stableTokens', unknown>> {
    const configContracts: ValidWrappers[] = [
      PlanqContract.Election,
      PlanqContract.Attestations,
      PlanqContract.Governance,
      PlanqContract.LockedPlanq,
      PlanqContract.SortedOracles,
      PlanqContract.GasPriceMinimum,
      PlanqContract.Reserve,
      PlanqContract.Validators,
      PlanqContract.DowntimeSlasher,
      PlanqContract.BlockchainParameters,
      PlanqContract.EpochRewards,
      PlanqContract.GrandaMento,
    ]

    const configMethod = async (contract: ValidWrappers) => {
      try {
        const eachTokenAddress = await this.planqTokens.getAddresses()
        const addresses = Object.values(eachTokenAddress)
        const configContractWrapper = await this.contracts.getContract(contract)
        if (humanReadable && 'getHumanReadableConfig' in configContractWrapper) {
          return configContractWrapper.getHumanReadableConfig(addresses)
        } else if ('getConfig' in configContractWrapper) {
          return configContractWrapper.getConfig(addresses)
        } else {
          throw new Error('No config endpoint found')
        }
      } catch (e) {
        return new Error(`Failed to fetch config for contract ${contract}: \n${e}`)
      }
    }

    const configArray = await Promise.all(configContracts.map(configMethod))

    const configMap: {
      [C in PlanqContract]?: ReturnType<typeof configMethod> extends Promise<infer U> ? U : never
    } = {}
    configArray.forEach((config, index) => (configMap[configContracts[index]] = config))

    return {
      exchanges: await this.planqTokens.getExchangesConfigs(humanReadable),
      stableTokens: await this.planqTokens.getStablesConfigs(humanReadable),
      ...configMap,
    }
  }

  getHumanReadableNetworkConfig = () => this.getNetworkConfig(true)

  /**
   * Set PlanqToken to use to pay for gas fees
   * @param tokenContract PLQ (PlanqToken) or a supported StableToken contract
   */
  async setFeeCurrency(tokenContract: PlanqTokenContract): Promise<void> {
    const address =
      tokenContract === PlanqContract.PlanqToken
        ? undefined
        : await this.registry.addressFor(tokenContract)
    if (address) {
      await this.updateGasPriceInConnectionLayer(address)
    }
    this.connection.defaultFeeCurrency = address
  }

  /** @deprecated no longer needed since gasPrice is available on node rpc */
  async updateGasPriceInConnectionLayer(currency: Address) {
    const gasPriceMinimum = await this.contracts.getGasPriceMinimum()
    const rawGasPrice = await gasPriceMinimum.getGasPriceMinimum(currency)
    const gasPrice = rawGasPrice.multipliedBy(this.gasPriceSuggestionMultiplier).toFixed()
    await this.connection.setGasPriceForCurrency(currency, gasPrice)
  }

  async getEpochSize(): Promise<number> {
    const blockchainParamsWrapper = await this.contracts.getBlockchainParameters()
    return blockchainParamsWrapper.getEpochSizeNumber()
  }

  async getFirstBlockNumberForEpoch(epochNumber: number): Promise<number> {
    const blockchainParamsWrapper = await this.contracts.getBlockchainParameters()
    return blockchainParamsWrapper.getFirstBlockNumberForEpoch(epochNumber)
  }

  async getLastBlockNumberForEpoch(epochNumber: number): Promise<number> {
    const blockchainParamsWrapper = await this.contracts.getBlockchainParameters()
    return blockchainParamsWrapper.getLastBlockNumberForEpoch(epochNumber)
  }

  async getEpochNumberOfBlock(blockNumber: number): Promise<number> {
    const blockchainParamsWrapper = await this.contracts.getBlockchainParameters()
    return blockchainParamsWrapper.getEpochNumberOfBlock(blockNumber)
  }

  // *** NOTICE ***
  // Next functions exists for backwards compatibility
  // These should be consumed via connection to avoid future deprecation issues

  addAccount(privateKey: string) {
    this.connection.addAccount(privateKey)
  }

  set defaultAccount(address: Address | undefined) {
    this.connection.defaultAccount = address
  }

  get defaultAccount(): Address | undefined {
    return this.connection.defaultAccount
  }

  set gasInflationFactor(factor: number) {
    this.connection.defaultGasInflationFactor = factor
  }

  get gasInflationFactor() {
    return this.connection.defaultGasInflationFactor
  }

  set gasPrice(price: number) {
    this.connection.defaultGasPrice = price
  }

  get gasPrice() {
    return this.connection.defaultGasPrice
  }

  set defaultFeeCurrency(address: Address | undefined) {
    this.connection.defaultFeeCurrency = address
  }

  get defaultFeeCurrency() {
    return this.connection.defaultFeeCurrency
  }

  isListening(): Promise<boolean> {
    return this.connection.isListening()
  }

  isSyncing(): Promise<boolean> {
    return this.connection.isSyncing()
  }
  /** @deprecated no longer needed since gasPrice is available on node rpc */
  async fillGasPrice(tx: PlanqTx): Promise<PlanqTx> {
    if (tx.feeCurrency && tx.gasPrice === '0') {
      await this.updateGasPriceInConnectionLayer(tx.feeCurrency)
    }
    return this.connection.fillGasPrice(tx)
  }

  async sendTransaction(tx: PlanqTx): Promise<TransactionResult> {
    return this.connection.sendTransaction(tx)
  }

  async sendTransactionObject(
    txObj: PlanqTxObject<any>,
    tx?: Omit<PlanqTx, 'data'>
  ): Promise<TransactionResult> {
    return this.connection.sendTransactionObject(txObj, tx)
  }

  async signTypedData(signer: string, typedData: EIP712TypedData): Promise<Signature> {
    return this.connection.signTypedData(signer, typedData)
  }

  stop() {
    this.connection.stop()
  }

  get web3() {
    return this.connection.web3
  }
}
