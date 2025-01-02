import { StableToken } from '@planq-network/base'
import { Connection } from '@planq-network/connect'
import { AddressRegistry } from './address-registry'
import { PlanqContract } from './base'
import { ContractCacheType } from './basic-contract-cache-type'
import { stableTokenInfos } from './planq-tokens'
import { newAccounts } from './generated/Accounts'
import { newGasPriceMinimum } from './generated/GasPriceMinimum'
import { newPlanqToken } from './generated/PlanqToken'
import { newExchange } from './generated/astonic/Exchange'
import { newExchangeBRL } from './generated/astonic/ExchangeBRL'
import { newExchangeEUR } from './generated/astonic/ExchangeEUR'
import { newStableToken } from './generated/astonic/StableToken'
import { newStableTokenBRL } from './generated/astonic/StableTokenBRL'
import { newStableTokenEUR } from './generated/astonic/StableTokenEUR'
import { AccountsWrapper } from './wrappers/Accounts'
import { ExchangeWrapper } from './wrappers/Exchange'
import { GasPriceMinimumWrapper } from './wrappers/GasPriceMinimum'
import { PlanqTokenWrapper } from './wrappers/PlanqTokenWrapper'
import { StableTokenWrapper } from './wrappers/StableTokenWrapper'

const MINIMUM_CONTRACTS = {
  [PlanqContract.Accounts]: {
    newInstance: newAccounts,
    wrapper: AccountsWrapper,
  },
  [PlanqContract.GasPriceMinimum]: {
    newInstance: newGasPriceMinimum,
    wrapper: GasPriceMinimumWrapper,
  },
  [PlanqContract.PlanqToken]: {
    newInstance: newPlanqToken,
    wrapper: PlanqTokenWrapper,
  },
  [PlanqContract.Exchange]: {
    newInstance: newExchange,
    wrapper: ExchangeWrapper,
  },
  [PlanqContract.ExchangeEUR]: {
    newInstance: newExchangeEUR,
    wrapper: ExchangeWrapper,
  },
  [PlanqContract.ExchangeBRL]: {
    newInstance: newExchangeBRL,
    wrapper: ExchangeWrapper,
  },
  [PlanqContract.StableToken]: {
    newInstance: newStableToken,
    wrapper: StableTokenWrapper,
  },
  [PlanqContract.StableTokenBRL]: {
    newInstance: newStableTokenBRL,
    wrapper: StableTokenWrapper,
  },
  [PlanqContract.StableTokenEUR]: {
    newInstance: newStableTokenEUR,
    wrapper: StableTokenWrapper,
  },
}

export type ContractsBroughtBase = typeof MINIMUM_CONTRACTS

type Keys = keyof ContractsBroughtBase

type Wrappers<T extends Keys> = InstanceType<ContractsBroughtBase[T]['wrapper']>

const contractsWhichRequireCache = new Set([
  PlanqContract.Attestations,
  PlanqContract.DoubleSigningSlasher,
  PlanqContract.DowntimeSlasher,
  PlanqContract.Election,
  PlanqContract.Governance,
  PlanqContract.LockedPlanq,
  PlanqContract.Validators,
])

/**
 * Alternative Contract Cache with Minimal Contracts
 *
 * Provides access to a subset of wrappers: {@link AccountsWrapper},  {@link ExchangeWrapper}, {@link GasPriceMinimumWrapper} and Planq Token contracts
 * Used internally by {@link MiniContractKit}
 *
 * @param connection – {@link Connection}
 * @param registry – {@link AddressRegistry}
 */

export class MiniContractCache implements ContractCacheType {
  private cache: Map<keyof ContractsBroughtBase, any> = new Map()

  constructor(
    readonly connection: Connection,
    readonly registry: AddressRegistry,
    private readonly contractClasses: ContractsBroughtBase = MINIMUM_CONTRACTS
  ) {}

  getAccounts(): Promise<AccountsWrapper> {
    return this.getContract(PlanqContract.Accounts)
  }
  getExchange(stableToken: StableToken = StableToken.pUSD): Promise<ExchangeWrapper> {
    return this.getContract(stableTokenInfos[stableToken].exchangeContract)
  }

  getPlanqToken(): Promise<PlanqTokenWrapper<any>> {
    return this.getContract(PlanqContract.PlanqToken)
  }

  getStableToken(stableToken: StableToken = StableToken.pUSD): Promise<StableTokenWrapper> {
    return this.getContract(stableTokenInfos[stableToken].contract)
  }

  /**
   * Get Contract wrapper
   */
  public async getContract<ContractKey extends keyof ContractsBroughtBase>(
    contract: ContractKey,
    address?: string
  ): Promise<Wrappers<ContractKey>> {
    if (!this.isContractAvailable(contract)) {
      throw new Error(
        `This instance of MiniContracts was not given a mapping for ${contract}. Either add it or use WrapperCache for full set of contracts`
      )
    }

    if (contractsWhichRequireCache.has(contract)) {
      throw new Error(
        `${contract} cannot be used with MiniContracts as it requires an instance of WrapperCache to be passed in as an argument`
      )
    }

    if (this.cache.get(contract) == null || address !== undefined) {
      await this.setContract<ContractKey>(contract, address)
    }
    return this.cache.get(contract)! as Wrappers<ContractKey>
  }

  private async setContract<ContractKey extends keyof ContractsBroughtBase>(
    contract: ContractKey,
    address: string | undefined
  ) {
    if (!address) {
      address = await this.registry.addressFor(contract)
    }

    const classes = this.contractClasses[contract]

    const instance = classes.newInstance(this.connection.web3, address)

    const Klass = classes.wrapper as ContractsBroughtBase[ContractKey]['wrapper']
    const wrapper = new Klass(this.connection, instance as any)

    this.cache.set(contract, wrapper)
  }

  public invalidateContract<C extends keyof ContractsBroughtBase>(contract: C) {
    this.cache.delete(contract)
  }

  private isContractAvailable(contract: keyof ContractsBroughtBase) {
    return !!this.contractClasses[contract]
  }
}
