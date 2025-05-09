import { ProposalBuilder, proposalToJSON, ProposalTransactionJSON } from '@planq-network/governance'
import { flags } from '@oclif/command'
import { BigNumber } from 'bignumber.js'
import { readFileSync } from 'fs'
import { BaseCommand } from '../../base'
import { newCheckBuilder } from '../../utils/checks'
import { displaySendTx, printValueMapRecursive } from '../../utils/cli'
import { Flags } from '../../utils/command'
import {
  addExistingProposalIDToBuilder,
  addExistingProposalJSONFileToBuilder,
  checkProposal,
} from '../../utils/governance'
export default class Propose extends BaseCommand {
  static description = 'Submit a governance proposal'

  static flags = {
    ...BaseCommand.flags,
    jsonTransactions: flags.string({
      required: true,
      description: 'Path to json transactions',
    }),
    deposit: flags.string({ required: true, description: 'Amount of Planq to attach to proposal' }),
    from: Flags.address({ required: true, description: "Proposer's address" }),
    force: flags.boolean({ description: 'Skip execution check', default: false }),
    descriptionURL: flags.string({
      required: true,
      description: 'A URL where further information about the proposal can be viewed',
    }),
    afterExecutingProposal: flags.string({
      required: false,
      description: 'Path to proposal which will be executed prior to proposal',
      exclusive: ['afterExecutingID'],
    }),
    afterExecutingID: flags.string({
      required: false,
      description: 'Governance proposal identifier which will be executed prior to proposal',
      exclusive: ['afterExecutingProposal'],
    }),
  }

  static examples = [
    'propose --jsonTransactions ./transactions.json --deposit 10000 --from 0x5409ed021d9299bf6814279a6a1411a7e866a631 --descriptionURL https://gist.github.com/yorhodes/46430eacb8ed2f73f7bf79bef9d58a33',
  ]

  async run() {
    const res = this.parse(Propose)
    const account = res.flags.from
    const deposit = new BigNumber(res.flags.deposit)
    this.kit.defaultAccount = account

    await newCheckBuilder(this, account)
      .hasEnoughPlanq(account, deposit)
      .exceedsProposalMinDeposit(deposit)
      .runChecks()

    const builder = new ProposalBuilder(this.kit)

    if (res.flags.afterExecutingID) {
      await addExistingProposalIDToBuilder(this.kit, builder, res.flags.afterExecutingID)
    } else if (res.flags.afterExecutingProposal) {
      await addExistingProposalJSONFileToBuilder(builder, res.flags.afterExecutingProposal)
    }

    // BUILD FROM JSON
    const jsonString = readFileSync(res.flags.jsonTransactions).toString()
    const jsonTransactions: ProposalTransactionJSON[] = JSON.parse(jsonString)
    jsonTransactions.forEach((tx) => builder.addJsonTx(tx))

    // BUILD FROM CONTRACTKIT FUNCTIONS
    // const params = await this.kit.contracts.getBlockchainParameters()
    // builder.addTx(params.setMinimumClientVersion(1, 8, 24), { to: params.address })
    // builder.addWeb3Tx()
    // builder.addProxyRepointingTx
    const proposal = await builder.build()
    printValueMapRecursive(await proposalToJSON(this.kit, proposal, builder.registryAdditions))

    const governance = await this.kit.contracts.getGovernance()

    if (!res.flags.force) {
      const ok = await checkProposal(proposal, this.kit)
      if (!ok) {
        return
      }
    }

    await displaySendTx(
      'proposeTx',
      governance.propose(proposal, res.flags.descriptionURL),
      { value: deposit.toString() },
      'ProposalQueued'
    )
  }
}
