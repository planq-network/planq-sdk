import { PlanqTxReceipt } from '@planq-network/connect/lib/types'
import { testWithGanache } from '@planq-network/dev-utils/lib/ganache-test'
import { addressToPublicKey } from '@planq-network/utils/lib/signatureUtils'
import BigNumber from 'bignumber.js'
import Web3 from 'web3'
import { mineToNextEpoch } from '../test-utils/utils'

import { zeroAddress } from '@ethereumjs/util'
import { newKitFromWeb3 } from '../kit'
import { AccountsWrapper } from './Accounts'
import { ElectionWrapper } from './Election'
import { LockedPlanqWrapper } from './LockedPlanq'
import { ValidatorsWrapper } from './Validators'

const minLockedPlanqValue = Web3.utils.toWei('10000', 'ether') // 10k planq

const blsPublicKey =
  '0x4fa3f67fc913878b068d1fa1cdddc54913d3bf988dbe5a36a20fa888f20d4894c408a6773f3d7bde11154f2a3076b700d345a42fd25a0e5e83f4db5586ac7979ac2053cd95d8f2efd3e959571ceccaa743e02cf4be3f5d7aaddb0b06fc9aff00'
const blsPoP =
  '0xcdb77255037eb68897cd487fdd85388cbda448f617f874449d4b11588b0b7ad8ddc20d9bb450b513bb35664ea3923900'

jest.setTimeout(20000)

testWithGanache('Election Wrapper', (web3) => {
  const ZERO_PLANQ = new BigNumber(web3.utils.toWei('0', 'ether'))
  const ONE_HUNDRED_PLANQ = new BigNumber(web3.utils.toWei('100', 'ether'))
  const ONE_HUNDRED_ONE_PLANQ = new BigNumber(web3.utils.toWei('101', 'ether'))
  const TWO_HUNDRED_PLANQ = new BigNumber(web3.utils.toWei('200', 'ether'))
  const TWO_HUNDRED_ONE_PLANQ = new BigNumber(web3.utils.toWei('201', 'ether'))
  const THREE_HUNDRED_PLANQ = new BigNumber(web3.utils.toWei('300', 'ether'))
  const GROUP_COMMISSION = new BigNumber(0.1)
  const kit = newKitFromWeb3(web3)
  let accounts: string[] = []
  let election: ElectionWrapper
  let accountsInstance: AccountsWrapper
  let validators: ValidatorsWrapper
  let lockedPlanq: LockedPlanqWrapper

  beforeAll(async () => {
    accounts = await kit.connection.getAccounts()

    election = await kit.contracts.getElection()

    validators = await kit.contracts.getValidators()

    lockedPlanq = await kit.contracts.getLockedPlanq()

    accountsInstance = await kit.contracts.getAccounts()
  })

  afterAll(async () => {
    kit.connection.stop()
  })

  const registerAccountWithLockedPlanq = async (
    account: string,
    value: string = minLockedPlanqValue
  ) => {
    if (!(await accountsInstance.isAccount(account))) {
      await accountsInstance.createAccount().sendAndWaitForReceipt({ from: account })
    }
    await lockedPlanq.lock().sendAndWaitForReceipt({ from: account, value })
  }

  const setupGroup = async (groupAccount: string) => {
    await registerAccountWithLockedPlanq(groupAccount, new BigNumber(minLockedPlanqValue).toFixed())
    await (
      await validators.registerValidatorGroup(GROUP_COMMISSION)
    ).sendAndWaitForReceipt({
      from: groupAccount,
    })
  }

  const setupValidator = async (validatorAccount: string) => {
    await registerAccountWithLockedPlanq(validatorAccount)
    const ecdsaPublicKey = await addressToPublicKey(validatorAccount, kit.connection.sign)
    await validators
      // @ts-ignore
      .registerValidator(ecdsaPublicKey, blsPublicKey, blsPoP)
      .sendAndWaitForReceipt({
        from: validatorAccount,
      })
  }

  const setupGroupAndAffiliateValidator = async (
    groupAccount: string,
    validatorAccount: string
  ) => {
    await setupGroup(groupAccount)
    await setupValidator(validatorAccount)
    await validators.affiliate(groupAccount).sendAndWaitForReceipt({ from: validatorAccount })
    await (
      await validators.addMember(groupAccount, validatorAccount)
    ).sendAndWaitForReceipt({
      from: groupAccount,
    })
  }

  const activateAndVote = async (groupAccount: string, userAccount: string, amount: BigNumber) => {
    await (await election.vote(groupAccount, amount)).sendAndWaitForReceipt({ from: userAccount })
    await mineToNextEpoch(web3)

    const txList = await election.activate(userAccount)

    let promises: Promise<PlanqTxReceipt>[] = []

    for (let tx of txList) {
      const promise = tx.sendAndWaitForReceipt({ from: userAccount })
      promises.push(promise)
    }

    await Promise.all(promises)
  }

  describe('', () => {
    let groupAccount: string
    let validatorAccount: string
    let userAccount: string

    beforeEach(async () => {
      groupAccount = accounts[0]
      validatorAccount = accounts[1]
      userAccount = accounts[2]

      await setupGroupAndAffiliateValidator(groupAccount, validatorAccount)
      await registerAccountWithLockedPlanq(userAccount)
    })

    describe('#getValidatorGroupVotes', () => {
      // Confirm base assumptions once to avoid duplicating test code later
      test('shows non-empty group as eligible', async () => {
        const groupVotesBefore = await election.getValidatorGroupVotes(groupAccount)
        expect(groupVotesBefore.eligible).toBe(true)
      })

      test('shows empty group as ineligible', async () => {
        await validators.deaffiliate().sendAndWaitForReceipt({ from: validatorAccount })
        const groupVotesAfter = await election.getValidatorGroupVotes(groupAccount)
        expect(groupVotesAfter.eligible).toBe(false)
      })
    })

    describe('#vote', () => {
      beforeEach(async () => {
        await (
          await election.vote(groupAccount, ONE_HUNDRED_PLANQ)
        ).sendAndWaitForReceipt({
          from: userAccount,
        })
      })
      test('SBAT vote', async () => {
        const totalGroupVotes = await election.getTotalVotesForGroup(groupAccount)
        expect(totalGroupVotes).toEqual(ONE_HUNDRED_PLANQ)
      })

      test('total votes remain unchanged when group becomes ineligible', async () => {
        await validators.deaffiliate().sendAndWaitForReceipt({ from: validatorAccount })
        const totalGroupVotes = await election.getTotalVotesForGroup(groupAccount)
        expect(totalGroupVotes).toEqual(ONE_HUNDRED_PLANQ)
      })
    })

    describe('#activate', () => {
      beforeEach(async () => {
        await (
          await election.vote(groupAccount, ONE_HUNDRED_PLANQ)
        ).sendAndWaitForReceipt({
          from: userAccount,
        })
        await mineToNextEpoch(web3)

        const txList = await election.activate(userAccount)
        let promises: Promise<PlanqTxReceipt>[] = []
        for (let tx of txList) {
          const promise = tx.sendAndWaitForReceipt({ from: userAccount })
          promises.push(promise)
        }
        await Promise.all(promises)
      })

      test('SBAT activate vote', async () => {
        const activeVotes = await election.getActiveVotesForGroup(groupAccount)
        expect(activeVotes).toEqual(ONE_HUNDRED_PLANQ)
      })

      test('active votes remain unchanged when group becomes ineligible', async () => {
        await validators.deaffiliate().sendAndWaitForReceipt({ from: validatorAccount })
        const activeVotes = await election.getActiveVotesForGroup(groupAccount)
        expect(activeVotes).toEqual(ONE_HUNDRED_PLANQ)
      })
    })

    describe('#revokeActive', () => {
      beforeEach(async () => {
        await activateAndVote(groupAccount, userAccount, ONE_HUNDRED_PLANQ)
      })

      test('SBAT revoke active', async () => {
        await (
          await election.revokeActive(userAccount, groupAccount, ONE_HUNDRED_PLANQ)
        ).sendAndWaitForReceipt({
          from: userAccount,
        })

        const remainingVotes = await election.getTotalVotesForGroup(groupAccount)
        expect(remainingVotes).toEqual(ZERO_PLANQ)
      })

      test('SBAT revoke active when group is ineligible', async () => {
        await validators.deaffiliate().sendAndWaitForReceipt({ from: validatorAccount })
        await (
          await election.revokeActive(userAccount, groupAccount, ONE_HUNDRED_PLANQ)
        ).sendAndWaitForReceipt({ from: userAccount })

        const remainingVotes = await election.getTotalVotesForGroup(groupAccount)
        expect(remainingVotes).toEqual(ZERO_PLANQ)
      })
    })

    describe('#revokePending', () => {
      beforeEach(async () => {
        await (
          await election.vote(groupAccount, ONE_HUNDRED_PLANQ)
        ).sendAndWaitForReceipt({
          from: userAccount,
        })
      })

      test('SBAT revoke pending', async () => {
        await (
          await election.revokePending(userAccount, groupAccount, ONE_HUNDRED_PLANQ)
        ).sendAndWaitForReceipt({
          from: userAccount,
        })
        const remainingVotes = await election.getTotalVotesForGroup(groupAccount)
        expect(remainingVotes).toEqual(ZERO_PLANQ)
      })

      test('SBAT revoke pending when group is ineligible', async () => {
        await validators.deaffiliate().sendAndWaitForReceipt({ from: validatorAccount })
        await (
          await election.revokePending(userAccount, groupAccount, ONE_HUNDRED_PLANQ)
        ).sendAndWaitForReceipt({
          from: userAccount,
        })
        const remainingVotes = await election.getTotalVotesForGroup(groupAccount)
        expect(remainingVotes).toEqual(ZERO_PLANQ)
      })
    })

    describe('#revoke', () => {
      beforeEach(async () => {
        await activateAndVote(groupAccount, userAccount, TWO_HUNDRED_PLANQ)
        await (
          await election.vote(groupAccount, ONE_HUNDRED_PLANQ)
        ).sendAndWaitForReceipt({
          from: userAccount,
        })
      })

      test('SBAT revoke active and pending votes', async () => {
        const revokeTransactionsList = await election.revoke(
          userAccount,
          groupAccount,
          THREE_HUNDRED_PLANQ
        )
        for (let tx of revokeTransactionsList) {
          await tx.sendAndWaitForReceipt({ from: userAccount })
        }
        const remainingVotes = await election.getTotalVotesForGroup(groupAccount)
        expect(remainingVotes).toEqual(ZERO_PLANQ)
      })

      test('SBAT revoke active and pending votes when group is ineligible', async () => {
        await validators.deaffiliate().sendAndWaitForReceipt({ from: validatorAccount })
        const revokeTransactionsList = await election.revoke(
          userAccount,
          groupAccount,
          THREE_HUNDRED_PLANQ
        )
        for (let tx of revokeTransactionsList) {
          await tx.sendAndWaitForReceipt({ from: userAccount })
        }
        const remainingVotes = await election.getTotalVotesForGroup(groupAccount)
        expect(remainingVotes).toEqual(ZERO_PLANQ)
      })
    })
  })

  describe('#findLesserAndGreaterAfterVote', () => {
    let groupAccountA: string
    let groupAccountB: string
    let groupAccountC: string
    let validatorAccountA: string
    let validatorAccountB: string
    let validatorAccountC: string
    let userAccount: string

    beforeEach(async () => {
      ;[
        groupAccountA,
        groupAccountB,
        groupAccountC,
        validatorAccountA,
        validatorAccountB,
        validatorAccountC,
        userAccount,
      ] = accounts

      await registerAccountWithLockedPlanq(userAccount)

      // Cant `await Promise.all()` because of race condition when finding
      // lesser and greater addresses for voting and adding a member to a group.
      await setupGroupAndAffiliateValidator(groupAccountA, validatorAccountA)
      await setupGroupAndAffiliateValidator(groupAccountB, validatorAccountB)
      await setupGroupAndAffiliateValidator(groupAccountC, validatorAccountC)

      await activateAndVote(groupAccountA, userAccount, TWO_HUNDRED_PLANQ)
      await activateAndVote(groupAccountB, userAccount, TWO_HUNDRED_ONE_PLANQ)
      await activateAndVote(groupAccountC, userAccount, ONE_HUNDRED_ONE_PLANQ)
    })

    test('Validator groups should be in the correct order', async () => {
      await (
        await election.vote(groupAccountA, ONE_HUNDRED_PLANQ)
      ).sendAndWaitForReceipt({
        from: userAccount,
      })
      const revokeTransactionsList = await election.revoke(
        userAccount,
        groupAccountA,
        TWO_HUNDRED_PLANQ
      )
      for (let tx of revokeTransactionsList) {
        await tx.sendAndWaitForReceipt({ from: userAccount })
      }
      const groupOrder = await election.findLesserAndGreaterAfterVote(groupAccountA, ZERO_PLANQ)
      expect(groupOrder).toEqual({ lesser: zeroAddress(), greater: groupAccountC })
    })
  })
})
