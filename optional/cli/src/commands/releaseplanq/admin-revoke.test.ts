import { serializeSignature } from '@planq-network/base/lib/signatureUtils'
import { ContractKit, newKitFromWeb3 } from '@planq-network/contractkit'
import { newReleasePlanq } from '@planq-network/contractkit/lib/generated/ReleasePlanq'
import { AccountsWrapper } from '@planq-network/contractkit/lib/wrappers/Accounts'
import { GovernanceWrapper } from '@planq-network/contractkit/lib/wrappers/Governance'
import { ReleasePlanqWrapper } from '@planq-network/contractkit/lib/wrappers/ReleasePlanq'
import {
  getContractFromEvent,
  NetworkConfig,
  testWithGanache,
  timeTravel,
} from '@planq-network/dev-utils/lib/ganache-test'
import Web3 from 'web3'
import { testLocally } from '../../test-utils/cliUtils'
import Approve from '../governance/approve'
import GovernanceUpvote from '../governance/upvote'
import GovernanceVote from '../governance/vote'
import AdminRevoke from './admin-revoke'
import Authorize from './authorize'
import CreateAccount from './create-account'
import LockedPlanq from './locked-planq'

process.env.NO_SYNCCHECK = 'true'

testWithGanache('releaseplanq:admin-revoke cmd', (web3: Web3) => {
  let kit: ContractKit
  let contractAddress: string
  let releasePlanqWrapper: ReleasePlanqWrapper
  let accounts: string[]

  beforeEach(async () => {
    contractAddress = await getContractFromEvent(
      'ReleasePlanqInstanceCreated(address,address)',
      web3,
      { index: 1 } // revocable: true
    )
    kit = newKitFromWeb3(web3)
    releasePlanqWrapper = new ReleasePlanqWrapper(
      kit.connection,
      newReleasePlanq(web3, contractAddress),
      kit.contracts
    )
    accounts = await web3.eth.getAccounts()
  })

  test('will revoke', async () => {
    await testLocally(AdminRevoke, ['--contract', contractAddress, '--yesreally'])
    const revokedContract = await getContractFromEvent(
      'ReleaseScheduleRevoked(uint256,uint256)',
      web3
    )
    expect(revokedContract).toBe(contractAddress)
  })

  test('will rescue all pUSD balance', async () => {
    const stableToken = await kit.contracts.getStableToken()
    await stableToken.transfer(contractAddress, 100).send({
      from: accounts[0],
    })
    await testLocally(AdminRevoke, ['--contract', contractAddress, '--yesreally'])
    const balance = await stableToken.balanceOf(contractAddress)
    expect(balance.isZero()).toBeTruthy()
  })

  test('will refund and finalize', async () => {
    await testLocally(AdminRevoke, ['--contract', contractAddress, '--yesreally'])
    const destroyedContract = await getContractFromEvent(
      'ReleasePlanqInstanceDestroyed(address,address)',
      web3
    )
    expect(destroyedContract).toBe(contractAddress)
  })

  describe('#when account exists with locked planq', () => {
    const value = '10'

    beforeEach(async () => {
      await testLocally(CreateAccount, ['--contract', contractAddress])
      await testLocally(LockedPlanq, [
        '--contract',
        contractAddress,
        '--action',
        'lock',
        '--value',
        value,
        '--yes',
      ])
    })

    test('will unlock all planq', async () => {
      await testLocally(AdminRevoke, ['--contract', contractAddress, '--yesreally'])
      const lockedPlanq = await kit.contracts.getLockedPlanq()
      const lockedAmount = await lockedPlanq.getAccountTotalLockedPlanq(releasePlanqWrapper.address)
      expect(lockedAmount.isZero()).toBeTruthy()
    })

    describe('#when account has authorized a vote signer', () => {
      let voteSigner: string
      let accountsWrapper: AccountsWrapper

      beforeEach(async () => {
        voteSigner = accounts[2]
        accountsWrapper = await kit.contracts.getAccounts()
        const pop = await accountsWrapper.generateProofOfKeyPossession(contractAddress, voteSigner)
        await testLocally(Authorize, [
          '--contract',
          contractAddress,
          '--role',
          'vote',
          '--signer',
          voteSigner,
          '--signature',
          serializeSignature(pop),
        ])
      })

      test('will rotate vote signer', async () => {
        await testLocally(AdminRevoke, ['--contract', contractAddress, '--yesreally'])
        const newVoteSigner = await accountsWrapper.getVoteSigner(contractAddress)
        expect(newVoteSigner).not.toEqual(voteSigner)
      })

      describe('#when account has voted', () => {
        let governance: GovernanceWrapper

        beforeEach(async () => {
          // from vote.test.ts
          const expConfig = NetworkConfig.governance
          const minDeposit = web3.utils.toWei(expConfig.minDeposit.toString(), 'ether')
          governance = await kit.contracts.getGovernance()
          await governance
            .propose([], 'URL')
            .sendAndWaitForReceipt({ from: accounts[0], value: minDeposit })
          await timeTravel(expConfig.dequeueFrequency, web3)
          await testLocally(Approve, ['--from', accounts[0], '--proposalID', '1', '--useMultiSig'])
          await testLocally(GovernanceVote, [
            '--from',
            voteSigner,
            '--proposalID',
            '1',
            '--value',
            'Yes',
          ])
          await governance
            .propose([], 'URL')
            .sendAndWaitForReceipt({ from: accounts[0], value: minDeposit })
          await governance
            .propose([], 'URL')
            .sendAndWaitForReceipt({ from: accounts[0], value: minDeposit })
          await testLocally(GovernanceUpvote, ['--from', voteSigner, '--proposalID', '3'])

          // const validators = await kit.contracts.getValidators()
          // const groups = await validators.getRegisteredValidatorGroupsAddresses()
          // await testLocally(ElectionVote, [
          //   '--from',
          //   voteSigner,
          //   '--for',
          //   groups[0],
          //   '--value',
          //   value
          // ])
        })

        test('will revoke governance votes and upvotes', async () => {
          const isVotingBefore = await governance.isVoting(contractAddress)
          expect(isVotingBefore).toBeTruthy()
          await testLocally(AdminRevoke, ['--contract', contractAddress, '--yesreally'])
          const isVotingAfter = await governance.isVoting(contractAddress)
          expect(isVotingAfter).toBeFalsy()
        })

        // test.only('will revoke election votes', async () => {
        //   const election = await kit.contracts.getElection()
        //   const votesBefore = await election.getTotalVotesByAccount(contractAddress)
        //   expect(votesBefore.isZero).toBeFalsy()
        //   await testLocally(AdminRevoke, ['--contract', contractAddress, '--yesreally'])
        //   const votesAfter = await election.getTotalVotesByAccount(contractAddress)
        //   expect(votesAfter.isZero()).toBeTruthy()
        // })
      })
    })
  })
})
