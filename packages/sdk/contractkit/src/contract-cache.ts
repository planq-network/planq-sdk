import { Connection } from '@planq-network/connect'
import { AddressRegistry } from './address-registry'
import { PlanqContract } from './base'
import { ContractCacheType } from './basic-contract-cache-type'
import { StableToken, stableTokenInfos } from './planq-tokens'
import { IERC20 } from './generated/IERC20'
import { Web3ContractCache } from './web3-contract-cache'
import { AccountsWrapper } from './wrappers/Accounts'
import { AttestationsWrapper } from './wrappers/Attestations'
import { BlockchainParametersWrapper } from './wrappers/BlockchainParameters'
import { DoubleSigningSlasherWrapper } from './wrappers/DoubleSigningSlasher'
import { DowntimeSlasherWrapper } from './wrappers/DowntimeSlasher'
import { ElectionWrapper } from './wrappers/Election'
import { EpochRewardsWrapper } from './wrappers/EpochRewards'
import { Erc20Wrapper } from './wrappers/Erc20Wrapper'
import { EscrowWrapper } from './wrappers/Escrow'
import { ExchangeWrapper } from './wrappers/Exchange'
import { FederatedAttestationsWrapper } from './wrappers/FederatedAttestations'
import { FreezerWrapper } from './wrappers/Freezer'
import { GasPriceMinimumWrapper } from './wrappers/GasPriceMinimum'
import { PlanqTokenWrapper } from './wrappers/PlanqTokenWrapper'
import { GovernanceWrapper } from './wrappers/Governance'
import { GrandaMentoWrapper } from './wrappers/GrandaMento'
import { LockedPlanqWrapper } from './wrappers/LockedPlanq'
import { MetaTransactionWalletWrapper } from './wrappers/MetaTransactionWallet'
import { MetaTransactionWalletDeployerWrapper } from './wrappers/MetaTransactionWalletDeployer'
import { MultiSigWrapper } from './wrappers/MultiSig'
import { OdisPaymentsWrapper } from './wrappers/OdisPayments'
import { ReserveWrapper } from './wrappers/Reserve'
import { SortedOraclesWrapper } from './wrappers/SortedOracles'
import { StableTokenWrapper } from './wrappers/StableTokenWrapper'
import { ValidatorsWrapper } from './wrappers/Validators'

const WrapperFactories = {
  [PlanqContract.Accounts]: AccountsWrapper,
  [PlanqContract.BlockchainParameters]: BlockchainParametersWrapper,
  [PlanqContract.EpochRewards]: EpochRewardsWrapper,
  [PlanqContract.ERC20]: Erc20Wrapper,
  [PlanqContract.Escrow]: EscrowWrapper,
  [PlanqContract.Exchange]: ExchangeWrapper,
  [PlanqContract.ExchangeEUR]: ExchangeWrapper,
  [PlanqContract.ExchangeBRL]: ExchangeWrapper,
  [PlanqContract.FederatedAttestations]: FederatedAttestationsWrapper,
  // [PlanqContract.FeeCurrencyWhitelist]: FeeCurrencyWhitelistWrapper,
  [PlanqContract.Freezer]: FreezerWrapper,
  [PlanqContract.GasPriceMinimum]: GasPriceMinimumWrapper,
  [PlanqContract.PlanqToken]: PlanqTokenWrapper,
  [PlanqContract.GrandaMento]: GrandaMentoWrapper,
  // [PlanqContract.Random]: RandomWrapper,
  // [PlanqContract.Registry]: RegistryWrapper,
  [PlanqContract.MetaTransactionWallet]: MetaTransactionWalletWrapper,
  [PlanqContract.MetaTransactionWalletDeployer]: MetaTransactionWalletDeployerWrapper,
  [PlanqContract.MultiSig]: MultiSigWrapper,
  [PlanqContract.OdisPayments]: OdisPaymentsWrapper,
  [PlanqContract.Reserve]: ReserveWrapper,
  [PlanqContract.StableToken]: StableTokenWrapper,
  [PlanqContract.StableTokenEUR]: StableTokenWrapper,
  [PlanqContract.StableTokenBRL]: StableTokenWrapper,
} as const

const WithRegistry = {
  [PlanqContract.SortedOracles]: SortedOraclesWrapper,
} as const

const WrapperFactoriesWhichNeedCache = {
  [PlanqContract.Attestations]: AttestationsWrapper,
  [PlanqContract.DoubleSigningSlasher]: DoubleSigningSlasherWrapper,
  [PlanqContract.DowntimeSlasher]: DowntimeSlasherWrapper,
  [PlanqContract.Election]: ElectionWrapper,
  [PlanqContract.Governance]: GovernanceWrapper,
  [PlanqContract.LockedPlanq]: LockedPlanqWrapper,
  [PlanqContract.Validators]: ValidatorsWrapper,
}

type CFType = typeof WrapperFactories
type RegistryType = typeof WithRegistry
type WrapperFactoriesWhichNeedCacheType = typeof WrapperFactoriesWhichNeedCache
export type ValidWrappers =
  | keyof CFType
  | keyof RegistryType
  | keyof WrapperFactoriesWhichNeedCacheType

const contractsWhichRequireCache = new Set(Object.keys(WrapperFactoriesWhichNeedCache))

interface WrapperCacheMap {
  [PlanqContract.Accounts]?: AccountsWrapper
  [PlanqContract.Attestations]?: AttestationsWrapper
  [PlanqContract.BlockchainParameters]?: BlockchainParametersWrapper
  [PlanqContract.DoubleSigningSlasher]?: DoubleSigningSlasherWrapper
  [PlanqContract.DowntimeSlasher]?: DowntimeSlasherWrapper
  [PlanqContract.Election]?: ElectionWrapper
  [PlanqContract.EpochRewards]?: EpochRewardsWrapper
  [PlanqContract.ERC20]?: Erc20Wrapper<IERC20>
  [PlanqContract.Escrow]?: EscrowWrapper
  [PlanqContract.Exchange]?: ExchangeWrapper
  [PlanqContract.ExchangeEUR]?: ExchangeWrapper
  [PlanqContract.ExchangeBRL]?: ExchangeWrapper
  [PlanqContract.FederatedAttestations]?: FederatedAttestationsWrapper
  // [PlanqContract.FeeCurrencyWhitelist]?: FeeCurrencyWhitelistWrapper,
  [PlanqContract.Freezer]?: FreezerWrapper
  [PlanqContract.GasPriceMinimum]?: GasPriceMinimumWrapper
  [PlanqContract.PlanqToken]?: PlanqTokenWrapper<any>
  [PlanqContract.Governance]?: GovernanceWrapper
  [PlanqContract.GrandaMento]?: GrandaMentoWrapper
  [PlanqContract.LockedPlanq]?: LockedPlanqWrapper
  [PlanqContract.MetaTransactionWallet]?: MetaTransactionWalletWrapper
  [PlanqContract.MetaTransactionWalletDeployer]?: MetaTransactionWalletDeployerWrapper
  [PlanqContract.MultiSig]?: MultiSigWrapper
  [PlanqContract.OdisPayments]?: OdisPaymentsWrapper
  // [PlanqContract.Random]?: RandomWrapper,
  // [PlanqContract.Registry]?: RegistryWrapper,
  [PlanqContract.Reserve]?: ReserveWrapper
  [PlanqContract.SortedOracles]?: SortedOraclesWrapper
  [PlanqContract.StableToken]?: StableTokenWrapper
  [PlanqContract.StableTokenEUR]?: StableTokenWrapper
  [PlanqContract.StableTokenBRL]?: StableTokenWrapper
  [PlanqContract.Validators]?: ValidatorsWrapper
}

/**
 * Kit ContractWrappers factory & cache.
 *
 * Provides access to all contract wrappers for planq core contracts
 *
 * @remarks
 *
 * Because it provides access to all contract wrappers it must load all wrappers and the contract ABIs for them
 * Consider Using {@link MiniWrapperCache}, building your own, or if you only need one Wrapper using it directly
 */

export class WrapperCache implements ContractCacheType {
  private wrapperCache: WrapperCacheMap = {}
  constructor(
    readonly connection: Connection,
    readonly _web3Contracts: Web3ContractCache,
    readonly registry: AddressRegistry
  ) {}

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
    return this.getContract<PlanqContract.DoubleSigningSlasher>(PlanqContract.DoubleSigningSlasher)
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
  getEscrow(): Promise<EscrowWrapper> {
    return this.getContract(PlanqContract.Escrow)
  }
  getExchange(stableToken: StableToken = StableToken.pUSD) {
    return this.getContract(stableTokenInfos[stableToken].exchangeContract)
  }
  getFreezer() {
    return this.getContract(PlanqContract.Freezer)
  }
  getFederatedAttestations() {
    return this.getContract(PlanqContract.FederatedAttestations)
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
  getReserve() {
    return this.getContract(PlanqContract.Reserve)
  }
  getSortedOracles() {
    return this.getContract(PlanqContract.SortedOracles)
  }
  getStableToken(stableToken: StableToken = StableToken.pUSD) {
    return this.getContract(stableTokenInfos[stableToken].contract)
  }
  getValidators() {
    return this.getContract(PlanqContract.Validators)
  }

  /**
   * Get Contract wrapper
   */
  public async getContract<C extends ValidWrappers>(contract: C, address?: string) {
    if (this.wrapperCache[contract] == null || address !== undefined) {
      const instance = await this._web3Contracts.getContract<C>(contract, address)
      if (contract === PlanqContract.SortedOracles) {
        const Klass = WithRegistry[PlanqContract.SortedOracles]
        this.wrapperCache[PlanqContract.SortedOracles] = new Klass(
          this.connection,
          instance as any,
          this.registry
        )
      } else if (contractsWhichRequireCache.has(contract)) {
        const contractName = contract as keyof WrapperFactoriesWhichNeedCacheType
        const Klass = WrapperFactoriesWhichNeedCache[contractName]
        const wrapper = new Klass(this.connection, instance as any, this)
        this.wrapperCache[contractName] = wrapper as any
      } else {
        const simpleContractName = contract as keyof typeof WrapperFactories
        const Klass = WrapperFactories[simpleContractName]
        // @ts-ignore
        this.wrapperCache[simpleContractName] = new Klass(this.connection, instance as any) as any
      }
    }
    return this.wrapperCache[contract]!
  }

  public invalidateContract<C extends ValidWrappers>(contract: C) {
    this._web3Contracts.invalidateContract(contract)
    this.wrapperCache[contract] = undefined
  }
}
