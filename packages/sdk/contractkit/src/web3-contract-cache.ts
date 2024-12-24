// tslint:disable: ordered-imports
import debugFactory from 'debug'
import { AddressRegistry } from './address-registry'
import { PlanqContract, ProxyContracts } from './base'
import { StableToken } from './planq-tokens'
import { newAccounts } from './generated/Accounts'
import { newAttestations } from './generated/Attestations'
import { newBlockchainParameters } from './generated/BlockchainParameters'
import { newDoubleSigningSlasher } from './generated/DoubleSigningSlasher'
import { newDowntimeSlasher } from './generated/DowntimeSlasher'
import { newElection } from './generated/Election'
import { newEpochRewards } from './generated/EpochRewards'
import { newEscrow } from './generated/Escrow'
import { newFederatedAttestations } from './generated/FederatedAttestations'
import { newFeeCurrencyWhitelist } from './generated/FeeCurrencyWhitelist'
import { newFreezer } from './generated/Freezer'
import { newGasPriceMinimum } from './generated/GasPriceMinimum'
import { newPlanqToken } from './generated/PlanqToken'
import { newGovernance } from './generated/Governance'
import { newIERC20 } from './generated/IERC20'
import { newLockedPlanq } from './generated/LockedPlanq'
import { newMetaTransactionWallet } from './generated/MetaTransactionWallet'
import { newMetaTransactionWalletDeployer } from './generated/MetaTransactionWalletDeployer'
import { newMultiSig } from './generated/MultiSig'
import { newOdisPayments } from './generated/OdisPayments'
import { newProxy } from './generated/Proxy'
import { newRandom } from './generated/Random'
import { newRegistry } from './generated/Registry'
import { newSortedOracles } from './generated/SortedOracles'
import { newValidators } from './generated/Validators'
import { newExchange } from './generated/mento/Exchange'
import { newExchangeBRL } from './generated/mento/ExchangeBRL'
import { newExchangeEUR } from './generated/mento/ExchangeEUR'
import { newGrandaMento } from './generated/mento/GrandaMento'
import { newReserve } from './generated/mento/Reserve'
import { newStableToken } from './generated/mento/StableToken'

const debug = debugFactory('kit:web3-contract-cache')

export const ContractFactories = {
  [PlanqContract.Accounts]: newAccounts,
  [PlanqContract.Attestations]: newAttestations,
  [PlanqContract.BlockchainParameters]: newBlockchainParameters,
  [PlanqContract.DoubleSigningSlasher]: newDoubleSigningSlasher,
  [PlanqContract.DowntimeSlasher]: newDowntimeSlasher,
  [PlanqContract.Election]: newElection,
  [PlanqContract.EpochRewards]: newEpochRewards,
  [PlanqContract.ERC20]: newIERC20,
  [PlanqContract.Escrow]: newEscrow,
  [PlanqContract.Exchange]: newExchange,
  [PlanqContract.ExchangeEUR]: newExchangeEUR,
  [PlanqContract.ExchangeBRL]: newExchangeBRL,
  [PlanqContract.FederatedAttestations]: newFederatedAttestations,
  [PlanqContract.FeeCurrencyWhitelist]: newFeeCurrencyWhitelist,
  [PlanqContract.Freezer]: newFreezer,
  [PlanqContract.GasPriceMinimum]: newGasPriceMinimum,
  [PlanqContract.PlanqToken]: newPlanqToken,
  [PlanqContract.Governance]: newGovernance,
  [PlanqContract.GrandaMento]: newGrandaMento,
  [PlanqContract.LockedPlanq]: newLockedPlanq,
  [PlanqContract.MetaTransactionWallet]: newMetaTransactionWallet,
  [PlanqContract.MetaTransactionWalletDeployer]: newMetaTransactionWalletDeployer,
  [PlanqContract.MultiSig]: newMultiSig,
  [PlanqContract.OdisPayments]: newOdisPayments,
  [PlanqContract.Random]: newRandom,
  [PlanqContract.Registry]: newRegistry,
  [PlanqContract.Reserve]: newReserve,
  [PlanqContract.SortedOracles]: newSortedOracles,
  [PlanqContract.StableToken]: newStableToken,
  [PlanqContract.StableTokenEUR]: newStableToken,
  [PlanqContract.StableTokenBRL]: newStableToken,
  [PlanqContract.Validators]: newValidators,
}

const StableToContract = {
  [StableToken.pEUR]: PlanqContract.StableTokenEUR,
  [StableToken.pUSD]: PlanqContract.StableToken,
  [StableToken.pREAL]: PlanqContract.StableTokenBRL,
}

const StableToExchange = {
  [StableToken.pEUR]: PlanqContract.ExchangeEUR,
  [StableToken.pUSD]: PlanqContract.Exchange,
  [StableToken.pREAL]: PlanqContract.ExchangeBRL,
}

export type CFType = typeof ContractFactories
type ContractCacheMap = { [K in keyof CFType]?: ReturnType<CFType[K]> }

/**
 * Native Web3 contracts factory and cache.
 *
 * Exposes accessors to all `PlanqContract` web3 contracts.
 *
 * Mostly a private cache, kit users would normally use
 * a contract wrapper
 */
export class Web3ContractCache {
  private cacheMap: ContractCacheMap = {}
  /** core contract's address registry */
  constructor(readonly registry: AddressRegistry) {}
  getAccounts() {
    return this.getContract(PlanqContract.Accounts)
  }
  getAttestations() {
    return this.getContract(PlanqContract.Attestations)
  }
  getBlockchainParameters() {
    return this.getContract(PlanqContract.BlockchainParameters)
  }
  getDoubleSigningSlasher() {
    return this.getContract(PlanqContract.DoubleSigningSlasher)
  }
  getDowntimeSlasher() {
    return this.getContract(PlanqContract.DowntimeSlasher)
  }
  getElection() {
    return this.getContract(PlanqContract.Election)
  }
  getEpochRewards() {
    return this.getContract(PlanqContract.EpochRewards)
  }
  getErc20(address: string) {
    return this.getContract(PlanqContract.ERC20, address)
  }
  getEscrow() {
    return this.getContract(PlanqContract.Escrow)
  }
  getExchange(stableToken: StableToken = StableToken.pUSD) {
    return this.getContract(StableToExchange[stableToken])
  }
  getFederatedAttestations() {
    return this.getContract(PlanqContract.FederatedAttestations)
  }
  getFeeCurrencyWhitelist() {
    return this.getContract(PlanqContract.FeeCurrencyWhitelist)
  }
  getFreezer() {
    return this.getContract(PlanqContract.Freezer)
  }
  getGasPriceMinimum() {
    return this.getContract(PlanqContract.GasPriceMinimum)
  }
  getPlanqToken() {
    return this.getContract(PlanqContract.PlanqToken)
  }
  getGovernance() {
    return this.getContract(PlanqContract.Governance)
  }
  getGrandaMento() {
    return this.getContract(PlanqContract.GrandaMento)
  }
  getLockedPlanq() {
    return this.getContract(PlanqContract.LockedPlanq)
  }
  getMetaTransactionWallet(address: string) {
    return this.getContract(PlanqContract.MetaTransactionWallet, address)
  }
  getMetaTransactionWalletDeployer(address: string) {
    return this.getContract(PlanqContract.MetaTransactionWalletDeployer, address)
  }
  getMultiSig(address: string) {
    return this.getContract(PlanqContract.MultiSig, address)
  }
  getOdisPayments() {
    return this.getContract(PlanqContract.OdisPayments)
  }
  getRandom() {
    return this.getContract(PlanqContract.Random)
  }
  getRegistry() {
    return this.getContract(PlanqContract.Registry)
  }
  getReserve() {
    return this.getContract(PlanqContract.Reserve)
  }
  getSortedOracles() {
    return this.getContract(PlanqContract.SortedOracles)
  }
  getStableToken(stableToken: StableToken = StableToken.pUSD) {
    return this.getContract(StableToContract[stableToken])
  }
  getValidators() {
    return this.getContract(PlanqContract.Validators)
  }

  /**
   * Get native web3 contract wrapper
   */
  async getContract<C extends keyof typeof ContractFactories>(contract: C, address?: string) {
    if (this.cacheMap[contract] == null || address !== undefined) {
      // core contract in the registry
      if (!address) {
        address = await this.registry.addressFor(contract)
      }
      debug('Initiating contract %s', contract)
      const createFn = ProxyContracts.includes(contract) ? newProxy : ContractFactories[contract]
      this.cacheMap[contract] = createFn(
        this.registry.connection.web3,
        address
      ) as ContractCacheMap[C]
    }
    // we know it's defined (thus the !)
    return this.cacheMap[contract]!
  }

  public invalidateContract<C extends keyof typeof ContractFactories>(contract: C) {
    this.cacheMap[contract] = undefined
  }
}
