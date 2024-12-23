import { NULL_ADDRESS } from '@planq-network/base/lib/address'
import { PlanqContractName } from '@planq-network/protocol/lib/registry-utils'
import {
  assertEqualBN,
  assertLogMatches,
  assertLogMatches2,
  assertRevert,
  assertTransactionRevertWithReason,
  timeTravel,
} from '@planq-network/protocol/lib/test-utils'
import { toFixed } from '@planq-network/utils/lib/fixidity'
import BigNumber from 'bignumber.js'
import {
  AccountsContract,
  AccountsInstance,
  ElectionContract,
  ElectionTestInstance,
  LockedPlanqContract,
  LockedPlanqInstance,
  MockElectionContract,
  MockElectionInstance,
  MockPlanqTokenContract,
  MockPlanqTokenInstance,
  MockGovernanceContract,
  MockGovernanceInstance,
  MockValidatorsContract,
  MockValidatorsInstance,
  RegistryContract,
  RegistryInstance,
} from 'types'

const Accounts: AccountsContract = artifacts.require('Accounts')
const LockedPlanq: LockedPlanqContract = artifacts.require('LockedPlanq')
const Election: ElectionContract = artifacts.require('Election')
const MockElection: MockElectionContract = artifacts.require('MockElection')
const MockPlanqToken: MockPlanqTokenContract = artifacts.require('MockPlanqToken')
const MockGovernance: MockGovernanceContract = artifacts.require('MockGovernance')
const MockValidators: MockValidatorsContract = artifacts.require('MockValidators')
const Registry: RegistryContract = artifacts.require('Registry')

// @ts-ignore
// TODO(mcortesi): Use BN
LockedPlanq.numberFormat = 'BigNumber'
// @ts-ignore
// TODO(mcortesi): Use BN
Election.numberFormat = 'BigNumber'

const HOUR = 60 * 60
const DAY = 24 * HOUR

contract('LockedPlanq', (accounts: string[]) => {
  const account = accounts[0]
  const nonOwner = accounts[1]
  const unlockingPeriod = 3 * DAY
  let accountsInstance: AccountsInstance
  let lockedPlanq: LockedPlanqInstance
  let election: ElectionTestInstance
  let mockElection: MockElectionInstance
  let mockGovernance: MockGovernanceInstance
  let mockValidators: MockValidatorsInstance
  let registry: RegistryInstance
  let mockPlanqToken: MockPlanqTokenInstance

  beforeEach(async () => {
    mockPlanqToken = await MockPlanqToken.new()
    accountsInstance = await Accounts.new(true)
    lockedPlanq = await LockedPlanq.new(true)
    mockElection = await MockElection.new()
    mockValidators = await MockValidators.new()
    mockGovernance = await MockGovernance.new()
    registry = await Registry.new(true)
    await registry.setAddressFor(PlanqContractName.Accounts, accountsInstance.address)
    await registry.setAddressFor(PlanqContractName.Election, mockElection.address)
    await registry.setAddressFor(PlanqContractName.PlanqToken, mockPlanqToken.address)
    await registry.setAddressFor(PlanqContractName.Governance, mockGovernance.address)
    await registry.setAddressFor(PlanqContractName.Validators, mockValidators.address)
    await registry.setAddressFor(PlanqContractName.LockedPlanq, lockedPlanq.address)
    await lockedPlanq.initialize(registry.address, unlockingPeriod)
    await accountsInstance.createAccount()
  })

  describe('#initialize()', () => {
    it('should set the owner', async () => {
      const owner: string = await lockedPlanq.owner()
      assert.equal(owner, account)
    })

    it('should set the registry address', async () => {
      const registryAddress: string = await lockedPlanq.registry()
      assert.equal(registryAddress, registry.address)
    })

    it('should set the unlocking period', async () => {
      const period = await lockedPlanq.unlockingPeriod()
      assertEqualBN(unlockingPeriod, period)
    })

    it('should revert if already initialized', async () => {
      await assertTransactionRevertWithReason(
        lockedPlanq.initialize(registry.address, unlockingPeriod),
        'contract already initialized'
      )
    })
  })

  describe('#setRegistry()', () => {
    const anAddress: string = accounts[2]

    it('should set the registry when called by the owner', async () => {
      await lockedPlanq.setRegistry(anAddress)
      assert.equal(await lockedPlanq.registry(), anAddress)
    })

    it('should revert when not called by the owner', async () => {
      await assertTransactionRevertWithReason(
        lockedPlanq.setRegistry(anAddress, { from: nonOwner }),
        'Ownable: caller is not the owner'
      )
    })
  })

  describe('#setUnlockingPeriod', () => {
    const newUnlockingPeriod = unlockingPeriod + 1
    it('should set the unlockingPeriod', async () => {
      await lockedPlanq.setUnlockingPeriod(newUnlockingPeriod)
      assertEqualBN(await lockedPlanq.unlockingPeriod(), newUnlockingPeriod)
    })

    it('should emit the UnlockingPeriodSet event', async () => {
      const resp = await lockedPlanq.setUnlockingPeriod(newUnlockingPeriod)
      assert.equal(resp.logs.length, 1)
      const log = resp.logs[0]
      assertLogMatches2(log, {
        event: 'UnlockingPeriodSet',
        args: {
          period: newUnlockingPeriod,
        },
      })
    })

    it('should revert when the unlockingPeriod is unchanged', async () => {
      await assertTransactionRevertWithReason(
        lockedPlanq.setUnlockingPeriod(unlockingPeriod),
        'Unlocking period not changed'
      )
    })

    it('should revert when called by anyone other than the owner', async () => {
      await assertTransactionRevertWithReason(
        lockedPlanq.setUnlockingPeriod(newUnlockingPeriod, { from: nonOwner }),
        'Ownable: caller is not the owner'
      )
    })
  })

  describe('#lock()', () => {
    const value = 1000

    it("should increase the account's nonvoting locked planq balance", async () => {
      // @ts-ignore: TODO(mcortesi) fix typings for TransactionDetails
      await lockedPlanq.lock({ value })
      assertEqualBN(await lockedPlanq.getAccountNonvotingLockedPlanq(account), value)
    })

    it("should increase the account's total locked planq balance", async () => {
      // @ts-ignore: TODO(mcortesi) fix typings for TransactionDetails
      await lockedPlanq.lock({ value })
      assertEqualBN(await lockedPlanq.getAccountTotalLockedPlanq(account), value)
    })

    it('should increase the nonvoting locked planq balance', async () => {
      // @ts-ignore: TODO(mcortesi) fix typings for TransactionDetails
      await lockedPlanq.lock({ value })
      assertEqualBN(await lockedPlanq.getNonvotingLockedPlanq(), value)
    })

    it('should increase the total locked planq balance', async () => {
      // @ts-ignore: TODO(mcortesi) fix typings for TransactionDetails
      await lockedPlanq.lock({ value })
      assertEqualBN(await lockedPlanq.getTotalLockedPlanq(), value)
    })

    it('should emit a PlanqLocked event', async () => {
      // @ts-ignore: TODO(mcortesi) fix typings for TransactionDetails
      const resp = await lockedPlanq.lock({ value })
      assert.equal(resp.logs.length, 1)
      const log = resp.logs[0]
      assertLogMatches(log, 'PlanqLocked', {
        account,
        value: new BigNumber(value),
      })
    })

    it('should revert when the account does not exist', async () => {
      await assertTransactionRevertWithReason(
        // @ts-ignore: TODO(mcortesi) fix typings for TransactionDetails
        lockedPlanq.lock({ value, from: accounts[1] }),
        'Must first register address with Account.createAccount'
      )
    })
  })

  describe('#unlock()', () => {
    const value = 1000
    let availabilityTime: BigNumber
    let resp: any
    describe('when there are no balance requirements', () => {
      beforeEach(async () => {
        // @ts-ignore: TODO(mcortesi) fix typings for TransactionDetails
        await lockedPlanq.lock({ value })
      })
      describe('when the account is not voting in governance', () => {
        beforeEach(async () => {
          resp = await lockedPlanq.unlock(value)
          availabilityTime = new BigNumber(unlockingPeriod).plus(
            (await web3.eth.getBlock('latest')).timestamp
          )
        })

        it('should add a pending withdrawal #getPendingWithdrawal()', async () => {
          const [val, timestamp] = await lockedPlanq.getPendingWithdrawal(account, 0)
          assertEqualBN(val, value)
          assertEqualBN(timestamp, availabilityTime)
          await assertRevert(lockedPlanq.getPendingWithdrawal(account, 1))
        })

        it('should add a pending withdrawal #getPendingWithdrawals()', async () => {
          const [values, timestamps] = await lockedPlanq.getPendingWithdrawals(account)
          assert.equal(values.length, 1)
          assert.equal(timestamps.length, 1)
          assertEqualBN(values[0], value)
          assertEqualBN(timestamps[0], availabilityTime)
        })

        it("should decrease the account's nonvoting locked planq balance", async () => {
          assertEqualBN(await lockedPlanq.getAccountNonvotingLockedPlanq(account), 0)
        })

        it("should decrease the account's total locked planq balance", async () => {
          assertEqualBN(await lockedPlanq.getAccountTotalLockedPlanq(account), 0)
        })

        it('should decrease the nonvoting locked planq balance', async () => {
          assertEqualBN(await lockedPlanq.getNonvotingLockedPlanq(), 0)
        })

        it('should decrease the total locked planq balance', async () => {
          assertEqualBN(await lockedPlanq.getTotalLockedPlanq(), 0)
        })

        it('should emit a PlanqUnlocked event', async () => {
          assert.equal(resp.logs.length, 1)
          const log = resp.logs[0]
          assertLogMatches(log, 'PlanqUnlocked', {
            account,
            value: new BigNumber(value),
            available: availabilityTime,
          })
        })
      })

      describe('when the account is voting in governance', () => {
        const votingPlanq = 1
        const valueWithoutVotingPlanq = value - votingPlanq
        beforeEach(async () => {
          await mockGovernance.setVoting(account)
          await mockGovernance.setTotalVotes(account, votingPlanq)
        })

        it('should revert when requesting planq that is voted with', async () => {
          await assertTransactionRevertWithReason(
            lockedPlanq.unlock(value),
            'Not enough unlockable planq. Planq is locked in voting.'
          )
        })

        describe('when the account is requesting only non voting planq', () => {
          beforeEach(async () => {
            resp = await lockedPlanq.unlock(valueWithoutVotingPlanq)
            availabilityTime = new BigNumber(unlockingPeriod).plus(
              (await web3.eth.getBlock('latest')).timestamp
            )
          })

          it('should add a pending withdrawal #getPendingWithdrawal()', async () => {
            const [val, timestamp] = await lockedPlanq.getPendingWithdrawal(account, 0)
            assertEqualBN(val, valueWithoutVotingPlanq)
            assertEqualBN(timestamp, availabilityTime)
            await assertRevert(lockedPlanq.getPendingWithdrawal(account, 1))
          })

          it('should add a pending withdrawal #getPendingWithdrawals()', async () => {
            const [values, timestamps] = await lockedPlanq.getPendingWithdrawals(account)
            assert.equal(values.length, 1)
            assert.equal(timestamps.length, 1)
            assertEqualBN(values[0], valueWithoutVotingPlanq)
            assertEqualBN(timestamps[0], availabilityTime)
          })

          it("should decrease the account's nonvoting locked planq balance", async () => {
            assertEqualBN(await lockedPlanq.getAccountNonvotingLockedPlanq(account), votingPlanq)
          })

          it("should decrease the account's total locked planq balance", async () => {
            assertEqualBN(await lockedPlanq.getAccountTotalLockedPlanq(account), votingPlanq)
          })

          it('should decrease the nonvoting locked planq balance', async () => {
            assertEqualBN(await lockedPlanq.getNonvotingLockedPlanq(), votingPlanq)
          })

          it('should decrease the total locked planq balance', async () => {
            assertEqualBN(await lockedPlanq.getTotalLockedPlanq(), votingPlanq)
          })

          it('should emit a PlanqUnlocked event', async () => {
            assert.equal(resp.logs.length, 1)
            const log = resp.logs[0]
            assertLogMatches(log, 'PlanqUnlocked', {
              account,
              value: new BigNumber(valueWithoutVotingPlanq),
              available: availabilityTime,
            })
          })
        })
      })
    })

    describe('when there are balance requirements', () => {
      const balanceRequirement = 10
      beforeEach(async () => {
        // @ts-ignore: TODO(mcortesi) fix typings for TransactionDetails
        await lockedPlanq.lock({ value })
        await mockValidators.setAccountLockedPlanqRequirement(account, balanceRequirement)
      })

      describe('when unlocking would yield a locked planq balance less than the required value', () => {
        describe('when the the current time is earlier than the requirement time', () => {
          it('should revert', async () => {
            await assertTransactionRevertWithReason(
              lockedPlanq.unlock(value),
              "Either account doesn't have enough locked Planq or locked Planq is being used for voting."
            )
          })
        })
      })

      describe('when unlocking would yield a locked planq balance equal to the required value', () => {
        it('should succeed', async () => {
          await lockedPlanq.unlock(value - balanceRequirement)
        })
      })
    })
  })

  describe('#relock()', () => {
    const pendingWithdrawalValue = 1000
    const index = 0
    let resp: any
    describe('when a pending withdrawal exists', () => {
      beforeEach(async () => {
        // @ts-ignore: TODO(mcortesi) fix typings for TransactionDetails
        await lockedPlanq.lock({ value: pendingWithdrawalValue })
        await lockedPlanq.unlock(pendingWithdrawalValue)
      })

      describe('when relocking value equal to the value of the pending withdrawal', () => {
        const value = pendingWithdrawalValue
        beforeEach(async () => {
          resp = await lockedPlanq.relock(index, value)
        })

        it("should increase the account's nonvoting locked planq balance", async () => {
          assertEqualBN(await lockedPlanq.getAccountNonvotingLockedPlanq(account), value)
        })

        it("should increase the account's total locked planq balance", async () => {
          assertEqualBN(await lockedPlanq.getAccountTotalLockedPlanq(account), value)
        })

        it('should increase the nonvoting locked planq balance', async () => {
          assertEqualBN(await lockedPlanq.getNonvotingLockedPlanq(), value)
        })

        it('should increase the total locked planq balance', async () => {
          assertEqualBN(await lockedPlanq.getTotalLockedPlanq(), value)
        })

        it('should emit a PlanqRelocked event', async () => {
          assert.equal(resp.logs.length, 1)
          const log = resp.logs[0]
          assertLogMatches(log, 'PlanqRelocked', {
            account,
            value: new BigNumber(value),
          })
        })

        it('should remove the pending withdrawal', async () => {
          const [values, timestamps] = await lockedPlanq.getPendingWithdrawals(account)
          assert.equal(values.length, 0)
          assert.equal(timestamps.length, 0)
        })
      })

      describe('when relocking value less than the value of the pending withdrawal', () => {
        const value = pendingWithdrawalValue - 1
        beforeEach(async () => {
          resp = await lockedPlanq.relock(index, value)
        })

        it("should increase the account's nonvoting locked planq balance", async () => {
          assertEqualBN(await lockedPlanq.getAccountNonvotingLockedPlanq(account), value)
        })

        it("should increase the account's total locked planq balance", async () => {
          assertEqualBN(await lockedPlanq.getAccountTotalLockedPlanq(account), value)
        })

        it('should increase the nonvoting locked planq balance', async () => {
          assertEqualBN(await lockedPlanq.getNonvotingLockedPlanq(), value)
        })

        it('should increase the total locked planq balance', async () => {
          assertEqualBN(await lockedPlanq.getTotalLockedPlanq(), value)
        })

        it('should emit a PlanqRelocked event', async () => {
          assert.equal(resp.logs.length, 1)
          const log = resp.logs[0]
          assertLogMatches(log, 'PlanqRelocked', {
            account,
            value: new BigNumber(value),
          })
        })

        it('should decrement the value of the pending withdrawal', async () => {
          const [values, timestamps] = await lockedPlanq.getPendingWithdrawals(account)
          assert.equal(values.length, 1)
          assert.equal(timestamps.length, 1)
          assertEqualBN(values[0], 1)
        })
      })
      describe('when relocking value greater than the value of the pending withdrawal', () => {
        const value = pendingWithdrawalValue + 1
        it('should revert', async () => {
          await assertTransactionRevertWithReason(
            lockedPlanq.relock(index, value),
            'Requested value larger than pending value'
          )
        })
      })
    })

    describe('when a pending withdrawal does not exist', () => {
      it('should revert', async () => {
        await assertTransactionRevertWithReason(
          lockedPlanq.relock(index, pendingWithdrawalValue),
          'Bad pending withdrawal index'
        )
      })
    })
  })

  describe('#withdraw()', () => {
    const value = 1000
    const index = 0
    let resp: any
    describe('when a pending withdrawal exists', () => {
      beforeEach(async () => {
        // @ts-ignore: TODO(mcortesi) fix typings for TransactionDetails
        await lockedPlanq.lock({ value })
        resp = await lockedPlanq.unlock(value)
      })

      describe('when it is after the availablity time', () => {
        beforeEach(async () => {
          await timeTravel(unlockingPeriod, web3)
          resp = await lockedPlanq.withdraw(index)
        })

        it('should remove the pending withdrawal', async () => {
          const [values, timestamps] = await lockedPlanq.getPendingWithdrawals(account)
          assert.equal(values.length, 0)
          assert.equal(timestamps.length, 0)
        })

        it('should emit a PlanqWithdrawn event', async () => {
          assert.equal(resp.logs.length, 1)
          const log = resp.logs[0]
          assertLogMatches(log, 'PlanqWithdrawn', {
            account,
            value: new BigNumber(value),
          })
        })
      })

      describe('when it is before the availablity time', () => {
        it('should revert', async () => {
          await assertTransactionRevertWithReason(
            lockedPlanq.withdraw(index),
            'Pending withdrawal not available'
          )
        })
      })
    })

    describe('when a pending withdrawal does not exist', () => {
      it('should revert', async () => {
        await assertTransactionRevertWithReason(
          lockedPlanq.withdraw(index),
          'Bad pending withdrawal index'
        )
      })
    })
  })

  describe('#addSlasher', () => {
    beforeEach(async () => {
      await registry.setAddressFor(PlanqContractName.DowntimeSlasher, accounts[2])
    })
    it('can add slasher to whitelist', async () => {
      await lockedPlanq.addSlasher(PlanqContractName.DowntimeSlasher)
      const bytes = web3.utils.soliditySha3({
        type: 'string',
        value: PlanqContractName.DowntimeSlasher,
      })
      assert.equal(bytes, (await lockedPlanq.getSlashingWhitelist())[0])
    })
    it('can only be called by owner', async () => {
      await assertTransactionRevertWithReason(
        lockedPlanq.addSlasher(PlanqContractName.DowntimeSlasher, { from: accounts[1] }),
        'Ownable: caller is not the owner'
      )
    })
    it('cannot add a slasher twice', async () => {
      await lockedPlanq.addSlasher(PlanqContractName.DowntimeSlasher)
      await assertTransactionRevertWithReason(
        lockedPlanq.addSlasher(PlanqContractName.DowntimeSlasher),
        'Cannot add slasher ID twice.'
      )
    })
  })

  describe('#removeSlasher', () => {
    beforeEach(async () => {
      await registry.setAddressFor(PlanqContractName.DowntimeSlasher, accounts[2])
      await registry.setAddressFor(PlanqContractName.GovernanceSlasher, accounts[3])
      await lockedPlanq.addSlasher(PlanqContractName.DowntimeSlasher)
    })
    it('removes item for whitelist', async () => {
      await lockedPlanq.removeSlasher(PlanqContractName.DowntimeSlasher, 0)
      assert.equal(0, (await lockedPlanq.getSlashingWhitelist()).length)
    })
    it('can only be called by owner', async () => {
      await assertTransactionRevertWithReason(
        lockedPlanq.removeSlasher(PlanqContractName.DowntimeSlasher, 0, { from: accounts[1] }),
        'Ownable: caller is not the owner'
      )
    })
    it('reverts when index too large', async () => {
      await assertTransactionRevertWithReason(
        lockedPlanq.removeSlasher(PlanqContractName.DowntimeSlasher, 100),
        'Provided index exceeds whitelist bounds.'
      )
    })
    it('reverts when key does not exists', async () => {
      await assertTransactionRevertWithReason(
        lockedPlanq.removeSlasher(PlanqContractName.GovernanceSlasher, 100),
        'Cannot remove slasher ID not yet added.'
      )
    })
    it('reverts when index and key have mismatch', async () => {
      await lockedPlanq.addSlasher(PlanqContractName.GovernanceSlasher)
      await assertTransactionRevertWithReason(
        lockedPlanq.removeSlasher(PlanqContractName.DowntimeSlasher, 1),
        "Index doesn't match identifier"
      )
    })
  })

  describe('#slash', () => {
    const value = 1000
    const group = accounts[1]
    const reporter = accounts[3]

    beforeEach(async () => {
      election = await Election.new(true)
      await registry.setAddressFor(PlanqContractName.LockedPlanq, lockedPlanq.address)
      await election.initialize(
        registry.address,
        new BigNumber(4),
        new BigNumber(6),
        new BigNumber(3),
        toFixed(1 / 100)
      )
      await mockValidators.setMembers(group, [accounts[9]])
      await registry.setAddressFor(PlanqContractName.Validators, accounts[0])
      await registry.setAddressFor(PlanqContractName.Election, election.address)
      await election.markGroupEligible(group, NULL_ADDRESS, NULL_ADDRESS)
      await registry.setAddressFor(PlanqContractName.Validators, mockValidators.address)
      await mockValidators.setNumRegisteredValidators(1)
      // @ts-ignore: TODO(mcortesi) fix typings for TransactionDetails
      await lockedPlanq.lock({ value })
      await registry.setAddressFor(PlanqContractName.DowntimeSlasher, accounts[2])
      await lockedPlanq.addSlasher(PlanqContractName.DowntimeSlasher)
      await accountsInstance.createAccount({ from: reporter })
    })

    describe('when the account is slashed for all of its locked planq', () => {
      const penalty = value
      const reward = value / 2

      beforeEach(async () => {
        await lockedPlanq.slash(
          account,
          penalty,
          reporter,
          reward,
          [NULL_ADDRESS],
          [NULL_ADDRESS],
          [0],
          { from: accounts[2] }
        )
      })

      it("should reduce account's locked planq balance", async () => {
        assertEqualBN(await lockedPlanq.getAccountNonvotingLockedPlanq(account), value - penalty)
        assertEqualBN(await lockedPlanq.getAccountTotalLockedPlanq(account), value - penalty)
      })

      it("should increase the reporter's locked planq", async () => {
        assertEqualBN(await lockedPlanq.getAccountNonvotingLockedPlanq(reporter), reward)
        assertEqualBN(await lockedPlanq.getAccountTotalLockedPlanq(reporter), reward)
      })

      it("should increase the community fund's planq", async () => {
        assert.equal(await web3.eth.getBalance(mockGovernance.address), penalty - reward)
      })
    })

    describe('when the slashing contract is removed from `isSlasher`', () => {
      const penalty = value
      const reward = value / 2
      beforeEach(async () => {
        await lockedPlanq.removeSlasher(PlanqContractName.DowntimeSlasher, 0)
      })

      it('should revert', async () => {
        await assertTransactionRevertWithReason(
          lockedPlanq.slash(
            account,
            penalty,
            reporter,
            reward,
            [NULL_ADDRESS],
            [NULL_ADDRESS],
            [0],
            { from: accounts[2] }
          ),
          'Caller is not a whitelisted slasher.'
        )
      })
    })

    describe('when the account has half voting and half nonvoting planq', () => {
      const voting = value / 2
      const nonVoting = value - voting
      beforeEach(async () => {
        await election.vote(group, voting, NULL_ADDRESS, NULL_ADDRESS)
      })

      describe('when the account is slashed for only its nonvoting balance', () => {
        const penalty = nonVoting
        const reward = penalty / 2
        beforeEach(async () => {
          await lockedPlanq.slash(
            account,
            penalty,
            reporter,
            reward,
            [NULL_ADDRESS],
            [NULL_ADDRESS],
            [0],
            { from: accounts[2] }
          )
        })

        it("should reduce account's nonvoting locked planq balance", async () => {
          assertEqualBN(
            await lockedPlanq.getAccountNonvotingLockedPlanq(account),
            nonVoting - penalty
          )
        })

        it('should leave the voting locked planq', async () => {
          assertEqualBN(await lockedPlanq.getAccountTotalLockedPlanq(account), value - penalty)
          assertEqualBN(await election.getTotalVotesByAccount(account), voting)
        })

        it("should increase the reporter's locked planq", async () => {
          assertEqualBN(await lockedPlanq.getAccountNonvotingLockedPlanq(reporter), reward)
          assertEqualBN(await lockedPlanq.getAccountTotalLockedPlanq(reporter), reward)
        })

        it("should increase the community fund's planq", async () => {
          assert.equal(await web3.eth.getBalance(mockGovernance.address), penalty - reward)
        })
      })

      describe('when the account is slashed for its whole balance', () => {
        const penalty = value
        const reward = penalty / 2

        beforeEach(async () => {
          await lockedPlanq.slash(
            account,
            penalty,
            reporter,
            reward,
            [NULL_ADDRESS],
            [NULL_ADDRESS],
            [0],
            { from: accounts[2] }
          )
        })

        it("should reduce account's nonvoting locked planq balance", async () => {
          assertEqualBN(await lockedPlanq.getAccountNonvotingLockedPlanq(account), value - penalty)
        })

        it("should reduce account's locked planq and voting planq", async () => {
          assertEqualBN(await lockedPlanq.getAccountTotalLockedPlanq(account), value - penalty)
          assertEqualBN(await election.getTotalVotesByAccount(account), value - penalty)
        })

        it("should increase the reporter's locked planq", async () => {
          assertEqualBN(await lockedPlanq.getAccountNonvotingLockedPlanq(reporter), reward)
          assertEqualBN(await lockedPlanq.getAccountTotalLockedPlanq(reporter), reward)
        })

        it("should increase the community fund's planq", async () => {
          assert.equal(await web3.eth.getBalance(mockGovernance.address), penalty - reward)
        })
      })

      describe('when the account is slashed for more than its whole balance', () => {
        const penalty = value * 2
        const reward = value / 2

        beforeEach(async () => {
          await lockedPlanq.slash(
            account,
            penalty,
            reporter,
            reward,
            [NULL_ADDRESS],
            [NULL_ADDRESS],
            [0],
            { from: accounts[2] }
          )
        })

        it('should slash the whole accounts balance', async () => {
          assertEqualBN(await lockedPlanq.getAccountNonvotingLockedPlanq(account), 0)
          assertEqualBN(await lockedPlanq.getAccountTotalLockedPlanq(account), 0)
          assertEqualBN(await election.getTotalVotesByAccount(account), 0)
        })

        it('should still send the `reporter` `reward` planq', async () => {
          assertEqualBN(await lockedPlanq.getAccountNonvotingLockedPlanq(reporter), reward)
          assertEqualBN(await lockedPlanq.getAccountTotalLockedPlanq(reporter), reward)
        })

        it("should only send the community fund value based on `account`'s total balance", async () => {
          assert.equal(await web3.eth.getBalance(mockGovernance.address), value - reward)
        })
      })
    })

    it('cannot be invoked by non-account reporters', async () => {
      const penalty = value
      const reward = value / 2

      await assertTransactionRevertWithReason(
        lockedPlanq.slash(
          account,
          penalty,
          accounts[4],
          reward,
          [NULL_ADDRESS],
          [NULL_ADDRESS],
          [0],
          { from: accounts[2] }
        ),
        'Must first register address with Account.createAccount'
      )
    })

    it('can be invoked by an account signer on behalf of the account', async () => {
      const signerReporter = accounts[4]
      const role = '0x0000000000000000000000000000000000000000000000000000000000001337'
      await accountsInstance.authorizeSigner(signerReporter, role, { from: reporter })
      await accountsInstance.completeSignerAuthorization(reporter, role, { from: signerReporter })
      const penalty = value
      const reward = value / 2

      await lockedPlanq.slash(
        account,
        penalty,
        signerReporter,
        reward,
        [NULL_ADDRESS],
        [NULL_ADDRESS],
        [0],
        { from: accounts[2] }
      )

      assertEqualBN(await lockedPlanq.getAccountNonvotingLockedPlanq(reporter), reward)
      assertEqualBN(await lockedPlanq.getAccountTotalLockedPlanq(reporter), reward)
    })
  })

  describe('#getTotalPendingWithdrawalsCount()', () => {
    it('should return 0 if account has no pending withdrawals', async () => {
      const count = await lockedPlanq.getTotalPendingWithdrawalsCount(account)
      assert.equal(count.toNumber(), 0)
    })

    it('should return the count of pending withdrawals', async () => {
      const value = 10000
      // @ts-ignore
      await lockedPlanq.lock({ value })
      await lockedPlanq.unlock(value / 2)
      await lockedPlanq.unlock(value / 2)

      const count = await lockedPlanq.getTotalPendingWithdrawalsCount(account)
      assert.equal(count.toNumber(), 2)
    })

    it('should return 0 for a non-existent account', async () => {
      const nonExistentAccount = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef'
      const count = await lockedPlanq.getTotalPendingWithdrawalsCount(nonExistentAccount)
      assert.equal(count.toNumber(), 0)
    })
  })
})
