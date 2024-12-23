import { Connection, Contract } from '@planq-network/connect'
import { AccountsWrapper } from './Accounts'
import { BaseWrapper } from './BaseWrapper'
import { BlockchainParametersWrapper } from './BlockchainParameters'
import { ElectionWrapper } from './Election'
import { LockedPlanqWrapper } from './LockedPlanq'
import { MultiSigWrapper } from './MultiSig'
import { ValidatorsWrapper } from './Validators'

interface ContractWrappersForVotingAndRules {
  getAccounts: () => Promise<AccountsWrapper>
  getValidators: () => Promise<ValidatorsWrapper>
  getElection: () => Promise<ElectionWrapper>
  getLockedPlanq: () => Promise<LockedPlanqWrapper>
  getMultiSig: (address: string) => Promise<MultiSigWrapper>
  getBlockchainParameters: () => Promise<BlockchainParametersWrapper>
}

/** @internal */
export class BaseWrapperForGoverning<T extends Contract> extends BaseWrapper<T> {
  constructor(
    protected readonly connection: Connection,
    protected readonly contract: T,
    protected readonly contracts: ContractWrappersForVotingAndRules
  ) {
    super(connection, contract)
  }
}
