import { flags } from '@oclif/command'
import prompts from 'prompts'
import { displaySendTx, printValueMap } from '../../utils/cli'
import { ReleasePlanqBaseCommand } from '../../utils/release-planq-base'

export default class AdminRevoke extends ReleasePlanqBaseCommand {
  static hidden = true

  static description = 'Take all possible steps to revoke given contract instance.'

  static flags = {
    ...ReleasePlanqBaseCommand.flags,
    yesreally: flags.boolean({ description: 'Override interactive prompt to confirm revocation' }),
  }

  static args = []

  static examples = ['admin-revoke --contract 0x5409ED021D9299bf6814279A6A1411A7e866A631']

  async run() {
    const { flags: _flags } = this.parse(AdminRevoke)

    if (!_flags.yesreally) {
      const response = await prompts({
        type: 'confirm',
        name: 'confirmation',
        message: 'Are you sure you want to revoke this contract? (y/n)',
      })

      if (!response.confirmation) {
        console.info('Aborting due to user response')
        process.exit(0)
      }
    }

    this.kit.defaultAccount = await this.releasePlanqWrapper.getReleaseOwner()

    const isRevoked = await this.releasePlanqWrapper.isRevoked()
    if (!isRevoked) {
      await displaySendTx(
        'releaseplanq: revokeBeneficiary',
        this.releasePlanqWrapper.revokeBeneficiary(),
        undefined,
        'ReleaseScheduleRevoked'
      )
    }

    const accounts = await this.kit.contracts.getAccounts()
    const isAccount = await accounts.isAccount(this.contractAddress)
    if (isAccount) {
      // rotate vote signers
      let voteSigner = await accounts.getVoteSigner(this.contractAddress)
      if (voteSigner !== this.contractAddress) {
        const password = 'bad_password'
        voteSigner = await this.web3.eth.personal.newAccount(password)
        await this.web3.eth.personal.unlockAccount(voteSigner, password, 1000)
        const pop = await accounts.generateProofOfKeyPossession(this.contractAddress, voteSigner)
        await displaySendTx(
          'accounts: rotateVoteSigner',
          await this.releasePlanqWrapper.authorizeVoteSigner(voteSigner, pop),
          undefined,
          'VoteSignerAuthorized'
        )
      }

      const election = await this.kit.contracts.getElection()
      const electionVotes = await election.getTotalVotesByAccount(this.contractAddress)
      const isElectionVoting = electionVotes.isGreaterThan(0)

      // handle election votes
      if (isElectionVoting) {
        const txos = await this.releasePlanqWrapper.revokeAllVotesForAllGroups()
        for (const txo of txos) {
          await displaySendTx('election: revokeVotes', txo, { from: voteSigner }, [
            'ValidatorGroupPendingVoteRevoked',
            'ValidatorGroupActiveVoteRevoked',
          ])
        }
      }

      const governance = await this.kit.contracts.getGovernance()
      const isGovernanceVoting = await governance.isVoting(this.contractAddress)

      // handle governance votes
      if (isGovernanceVoting) {
        const isUpvoting = await governance.isUpvoting(this.contractAddress)
        if (isUpvoting) {
          await displaySendTx(
            'governance: revokeUpvote',
            await governance.revokeUpvote(this.contractAddress),
            { from: voteSigner },
            'ProposalUpvoteRevoked'
          )
        }

        const isVotingReferendum = await governance.isVotingReferendum(this.contractAddress)
        if (isVotingReferendum) {
          await displaySendTx(
            'governance: revokeVotes',
            governance.revokeVotes(),
            { from: voteSigner },
            'ProposalVoteRevoked'
          )
        }
      }

      await displaySendTx(
        'releaseplanq: unlockAllPlanq',
        await this.releasePlanqWrapper.unlockAllPlanq(),
        undefined,
        'PlanqUnlocked'
      )
    }

    // rescue any pUSD balance
    const stabletoken = await this.kit.contracts.getStableToken()
    const pusdBalance = await stabletoken.balanceOf(this.contractAddress)
    if (pusdBalance.isGreaterThan(0)) {
      await displaySendTx(
        'releaseplanq: rescueCUSD',
        this.releasePlanqWrapper.transfer(this.kit.defaultAccount, pusdBalance),
        undefined,
        'Transfer'
      )
    }

    // attempt to refund and finalize, surface pending withdrawals
    const remainingLockedPlanq = await this.releasePlanqWrapper.getRemainingLockedBalance()
    if (remainingLockedPlanq.isZero()) {
      await displaySendTx(
        'releaseplanq: refundAndFinalize',
        this.releasePlanqWrapper.refundAndFinalize(),
        undefined,
        'ReleasePlanqInstanceDestroyed'
      )
    } else {
      console.log('Some planq is still locked, printing pending withdrawals...')
      const lockedPlanq = await this.kit.contracts.getLockedPlanq()
      const pendingWithdrawals = await lockedPlanq.getPendingWithdrawals(this.contractAddress)
      pendingWithdrawals.forEach((w) => printValueMap(w))
    }
  }
}
