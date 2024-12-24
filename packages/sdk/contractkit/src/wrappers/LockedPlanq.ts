import {
  AddressListItem as ALI,
  Comparator,
  linkedListChanges as baseLinkedListChanges,
  zip,
} from '@planq-network/base/lib/collections'
import { Address, PlanqTransactionObject, EventLog } from '@planq-network/connect'
import BigNumber from 'bignumber.js'
import { LockedPlanq } from '../generated/LockedPlanq'
import {
  proxyCall,
  proxySend,
  secondsToDurationString,
  tupleParser,
  valueToBigNumber,
  valueToString,
} from '../wrappers/BaseWrapper'
import { BaseWrapperForGoverning } from './BaseWrapperForGoverning'

type AddressListItem = ALI<BigNumber>
const bigNumberComparator: Comparator<BigNumber> = (a: BigNumber, b: BigNumber) => a.lt(b)
function linkedListChanges(
  groups: AddressListItem[],
  changed: AddressListItem[]
): { lessers: string[]; greaters: string[]; list: AddressListItem[] } {
  return baseLinkedListChanges(groups, changed, bigNumberComparator)
}

export interface VotingDetails {
  accountAddress: Address
  voterAddress: Address
  /** vote's weight */
  weight: BigNumber
}

interface AccountSummary {
  lockedPlanq: {
    total: BigNumber
    nonvoting: BigNumber
    requirement: BigNumber
  }
  pendingWithdrawals: PendingWithdrawal[]
}

export interface AccountSlashed {
  slashed: Address
  penalty: BigNumber
  reporter: Address
  reward: BigNumber
  epochNumber: number
}

export interface PendingWithdrawal {
  time: BigNumber
  value: BigNumber
}

export interface LockedPlanqConfig {
  unlockingPeriod: BigNumber
  totalLockedPlanq: BigNumber
}

/**
 * Contract for handling deposits needed for voting.
 */

export class LockedPlanqWrapper extends BaseWrapperForGoverning<LockedPlanq> {
  /**
   * Withdraws a planq that has been unlocked after the unlocking period has passed.
   * @param index The index of the pending withdrawal to withdraw.
   */
  withdraw: (index: number) => PlanqTransactionObject<void> = proxySend(
    this.connection,
    this.contract.methods.withdraw
  )

  /**
   * Locks planq to be used for voting.
   * The planq to be locked, must be specified as the `tx.value`
   */
  lock = proxySend(this.connection, this.contract.methods.lock)

  /**
   * Unlocks planq that becomes withdrawable after the unlocking period.
   * @param value The amount of planq to unlock.
   */
  unlock: (value: BigNumber.Value) => PlanqTransactionObject<void> = proxySend(
    this.connection,
    this.contract.methods.unlock,
    tupleParser(valueToString)
  )

  async getPendingWithdrawalsTotalValue(account: Address) {
    const pendingWithdrawals = await this.getPendingWithdrawals(account)
    // Ensure there are enough pending withdrawals to relock.
    const values = pendingWithdrawals.map((pw: PendingWithdrawal) => pw.value)
    const reducer = (total: BigNumber, pw: BigNumber) => pw.plus(total)
    return values.reduce(reducer, new BigNumber(0))
  }

  /**
   * Relocks planq that has been unlocked but not withdrawn.
   * @param value The value to relock from pending withdrawals.
   */
  async relock(
    account: Address,
    value: BigNumber.Value
  ): Promise<Array<PlanqTransactionObject<void>>> {
    const pendingWithdrawals = await this.getPendingWithdrawals(account)
    // Ensure there are enough pending withdrawals to relock.
    const totalValue = await this.getPendingWithdrawalsTotalValue(account)
    if (totalValue.isLessThan(value)) {
      throw new Error(`Not enough pending withdrawals to relock ${value}`)
    }
    // Assert pending withdrawals are sorted by time (increasing), so that we can re-lock starting
    // with those furthest away from being available (at the end).
    const throwIfNotSorted = (pw: PendingWithdrawal, i: number) => {
      if (i > 0 && !pw.time.isGreaterThanOrEqualTo(pendingWithdrawals[i - 1].time)) {
        throw new Error('Pending withdrawals not sorted by timestamp')
      }
    }
    pendingWithdrawals.forEach(throwIfNotSorted)

    let remainingToRelock = new BigNumber(value)
    const relockPw = (
      acc: Array<PlanqTransactionObject<void>>,
      pw: PendingWithdrawal,
      i: number
    ) => {
      const valueToRelock = BigNumber.minimum(pw.value, remainingToRelock)
      if (!valueToRelock.isZero()) {
        remainingToRelock = remainingToRelock.minus(valueToRelock)
        acc.push(this._relock(i, valueToRelock))
      }
      return acc
    }
    return pendingWithdrawals.reduceRight(relockPw, []) as Array<PlanqTransactionObject<void>>
  }

  /**
   * Relocks planq that has been unlocked but not withdrawn.
   * @param index The index of the pending withdrawal to relock from.
   * @param value The value to relock from the specified pending withdrawal.
   */
  _relock: (index: number, value: BigNumber.Value) => PlanqTransactionObject<void> = proxySend(
    this.connection,
    this.contract.methods.relock,
    tupleParser(valueToString, valueToString)
  )

  /**
   * Returns the total amount of locked planq for an account.
   * @param account The account.
   * @return The total amount of locked planq for an account.
   */
  getAccountTotalLockedPlanq = proxyCall(
    this.contract.methods.getAccountTotalLockedPlanq,
    undefined,
    valueToBigNumber
  )

  /**
   * Returns the total amount of locked planq in the system. Note that this does not include
   *   planq that has been unlocked but not yet withdrawn.
   * @returns The total amount of locked planq in the system.
   */
  getTotalLockedPlanq = proxyCall(
    this.contract.methods.getTotalLockedPlanq,
    undefined,
    valueToBigNumber
  )

  /**
   * Returns the total amount of non-voting locked planq for an account.
   * @param account The account.
   * @return The total amount of non-voting locked planq for an account.
   */
  getAccountNonvotingLockedPlanq = proxyCall(
    this.contract.methods.getAccountNonvotingLockedPlanq,
    undefined,
    valueToBigNumber
  )

  /**
   * Returns current configuration parameters.
   */
  async getConfig(): Promise<LockedPlanqConfig> {
    return {
      unlockingPeriod: valueToBigNumber(await this.contract.methods.unlockingPeriod().call()),
      totalLockedPlanq: await this.getTotalLockedPlanq(),
    }
  }

  /**
   * @dev Returns human readable configuration of the lockedplanq contract
   * @return LockedPlanqConfig object
   */
  async getHumanReadableConfig() {
    const config = await this.getConfig()
    return {
      ...config,
      unlockingPeriod: secondsToDurationString(config.unlockingPeriod),
    }
  }

  async getAccountSummary(account: string): Promise<AccountSummary> {
    const nonvoting = await this.getAccountNonvotingLockedPlanq(account)
    const total = await this.getAccountTotalLockedPlanq(account)
    const validators = await this.contracts.getValidators()
    const requirement = await validators.getAccountLockedPlanqRequirement(account)
    const pendingWithdrawals = await this.getPendingWithdrawals(account)
    return {
      lockedPlanq: {
        total,
        nonvoting,
        requirement,
      },
      pendingWithdrawals,
    }
  }

  /**
   * Returns the pending withdrawals from unlocked planq for an account.
   * @param account The address of the account.
   * @return The value and timestamp for each pending withdrawal.
   */
  async getPendingWithdrawals(account: string) {
    const withdrawals = await this.contract.methods.getPendingWithdrawals(account).call()
    return zip(
      (time, value): PendingWithdrawal => ({
        time: valueToBigNumber(time),
        value: valueToBigNumber(value),
      }),
      withdrawals[1],
      withdrawals[0]
    )
  }

  /**
   * Returns the pending withdrawal at a given index for a given account.
   * @param account The address of the account.
   * @param index The index of the pending withdrawal.
   * @return The value of the pending withdrawal.
   * @return The timestamp of the pending withdrawal.
   */
  async getPendingWithdrawal(account: string, index: number) {
    const response = await this.contract.methods.getPendingWithdrawal(account, index).call()
    return {
      value: valueToBigNumber(response[0]),
      time: valueToBigNumber(response[1]),
    }
  }

  /**
   * Retrieves AccountSlashed for epochNumber.
   * @param epochNumber The epoch to retrieve AccountSlashed at.
   */
  async getAccountsSlashed(epochNumber: number): Promise<AccountSlashed[]> {
    const blockchainParamsWrapper = await this.contracts.getBlockchainParameters()
    const events = await this.getPastEvents('AccountSlashed', {
      fromBlock: await blockchainParamsWrapper.getFirstBlockNumberForEpoch(epochNumber),
      toBlock: await blockchainParamsWrapper.getLastBlockNumberForEpoch(epochNumber),
    })
    return events.map(
      (e: EventLog): AccountSlashed => ({
        epochNumber,
        slashed: e.returnValues.slashed,
        penalty: valueToBigNumber(e.returnValues.penalty),
        reporter: e.returnValues.reporter,
        reward: valueToBigNumber(e.returnValues.reward),
      })
    )
  }

  /**
   * Computes parameters for slashing `penalty` from `account`.
   * @param account The account to slash.
   * @param penalty The amount to slash as penalty.
   * @return List of (group, voting planq) to decrement from `account`.
   */
  async computeInitialParametersForSlashing(account: string, penalty: BigNumber) {
    const election = await this.contracts.getElection()
    const eligible = await election.getEligibleValidatorGroupsVotes()
    const groups: AddressListItem[] = eligible.map((x) => ({ address: x.address, value: x.votes }))
    return this.computeParametersForSlashing(account, penalty, groups)
  }

  async computeParametersForSlashing(
    account: string,
    penalty: BigNumber,
    groups: AddressListItem[]
  ) {
    const changed = await this.computeDecrementsForSlashing(account, penalty, groups)
    const changes = linkedListChanges(groups, changed)
    return { ...changes, indices: changed.map((a) => a.index) }
  }

  // Returns how much voting planq will be decremented from the groups voted by an account
  // Implementation follows protocol/test/common/integration slashingOfGroups()
  private async computeDecrementsForSlashing(
    account: Address,
    penalty: BigNumber,
    allGroups: AddressListItem[]
  ) {
    // first check how much voting planq has to be slashed
    const nonVoting = await this.getAccountNonvotingLockedPlanq(account)
    if (penalty.isLessThan(nonVoting)) {
      return []
    }
    let difference = penalty.minus(nonVoting)
    // find voted groups
    const election = await this.contracts.getElection()
    const groups = await election.getGroupsVotedForByAccount(account)
    const res = []
    //
    for (let i = groups.length - 1; i >= 0; i--) {
      const group = groups[i]
      const totalVotes = allGroups.find((a) => a.address === group)?.value
      if (!totalVotes) {
        throw new Error(`Cannot find group ${group}`)
      }
      const votes = await election.getTotalVotesForGroupByAccount(group, account)
      const slashedVotes = votes.lt(difference) ? votes : difference
      res.push({ address: group, value: totalVotes.minus(slashedVotes), index: i })
      difference = difference.minus(slashedVotes)
      if (difference.eq(new BigNumber(0))) {
        break
      }
    }
    return res
  }

  /**
   * Returns the number of pending withdrawals for the specified account.
   * @param account The account.
   * @returns The count of pending withdrawals.
   */
  getTotalPendingWithdrawalsCount = proxyCall(
    this.contract.methods.getTotalPendingWithdrawalsCount,
    undefined,
    valueToBigNumber
  )
}

export type LockedPlanqWrapperType = LockedPlanqWrapper
