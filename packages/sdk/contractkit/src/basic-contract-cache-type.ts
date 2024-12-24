import { StableToken } from '@planq-network/base'
import { PlanqContract, PlanqTokenContract } from './base'
import { AccountsWrapper } from './wrappers/Accounts'
import { ExchangeWrapper } from './wrappers/Exchange'
import { PlanqTokenWrapper, PlanqTokenWrapperType } from './wrappers/PlanqTokenWrapper'
import { StableTokenWrapper } from './wrappers/StableTokenWrapper'
import {PlanqToken} from "./generated/PlanqToken";

/**
 * Interface for a class with the minimum required wrappers
 * to make a {@link MiniContractKit} or {@link PlanqTokens} Class
 */
export interface ContractCacheType {
  getAccounts(): Promise<AccountsWrapper>
  getExchange(stableToken: StableToken): Promise<ExchangeWrapper>

  getPlanqToken(): Promise<PlanqTokenWrapper<PlanqToken>>

  getStableToken(stableToken: StableToken): Promise<StableTokenWrapper>

  getContract(
    contract: PlanqContract.Exchange | PlanqContract.ExchangeEUR | PlanqContract.ExchangeBRL
  ): Promise<ExchangeWrapper>
  getContract(contract: PlanqTokenContract): Promise<StableTokenWrapper>
  getContract(contract: PlanqContract.PlanqToken): Promise<PlanqTokenWrapperType>
}
