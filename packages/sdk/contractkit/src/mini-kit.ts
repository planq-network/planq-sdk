import { Connection, ReadOnlyWallet } from '@planq-network/connect'
import { LocalWallet } from '@planq-network/wallet-local'
import { BigNumber } from 'bignumber.js'
import Web3 from 'web3'
import { AddressRegistry } from './address-registry'
import { PlanqTokens, EachPlanqToken } from './planq-tokens'
import { MiniContractCache } from './mini-contract-cache'
import {
  ensureCurrentProvider,
  getWeb3ForKit,
  HttpProviderOptions,
  setupAPIKey,
} from './setupForKits'

/**
 * Creates a new instance of `MiniMiniContractKit` given a nodeUrl
 * @param url PlanqBlockchain node url
 * @optional wallet to reuse or add a wallet different than the default (example ledger-wallet)
 * @optional options to pass to the Web3 HttpProvider constructor
 */
export function newKit(url: string, wallet?: ReadOnlyWallet, options?: HttpProviderOptions) {
  const web3: Web3 = getWeb3ForKit(url, options)
  return newKitFromWeb3(web3, wallet)
}

/**
 * Creates a new instance of `MiniContractKit` given a nodeUrl and apiKey
 * @param url PlanqBlockchain node url
 * @param apiKey to include in the http request header
 * @optional wallet to reuse or add a wallet different than the default (example ledger-wallet)
 */
export function newKitWithApiKey(url: string, apiKey: string, wallet?: ReadOnlyWallet) {
  const options: HttpProviderOptions = setupAPIKey(apiKey)
  return newKit(url, wallet, options)
}

/**
 * Creates a new instance of the `MiniContractKit` with a web3 instance
 * @param web3 Web3 instance
 */
export function newKitFromWeb3(web3: Web3, wallet: ReadOnlyWallet = new LocalWallet()) {
  ensureCurrentProvider(web3)
  return new MiniContractKit(new Connection(web3, wallet))
}

/**
 * MiniContractKit provides a core subset of {@link ContractKit}'s functionality
 *
 * @remarks
 *
 * It is recommended to use this over ContractKit for dApps as it is lighter
 *
 * @param connection – an instance of @planq-network/connect {@link Connection}
 */
export class MiniContractKit {
  /** core contract's address registry */
  readonly registry: AddressRegistry
  /** factory for subset of core contract's kit wrappers  */
  readonly contracts: MiniContractCache
  /** helper for interacting with PLQ & stable tokens */
  readonly planqTokens: PlanqTokens

  constructor(readonly connection: Connection) {
    this.registry = new AddressRegistry(connection)
    this.contracts = new MiniContractCache(connection, this.registry)
    this.planqTokens = new PlanqTokens(this.contracts, this.registry)
  }

  getWallet() {
    return this.connection.wallet
  }

  // Like get Total Balance on MiniContractKit but does not include locked planq or pending
  async getTotalBalance(address: string): Promise<EachPlanqToken<BigNumber>> {
    return {
      ...(await this.planqTokens.balancesOf(address)),
    }
  }
}

// For easy switching from full contractKit to Mini
export const ContractKit = MiniContractKit
