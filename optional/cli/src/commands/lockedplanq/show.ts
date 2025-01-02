import { BaseCommand } from '../../base'
import { newCheckBuilder } from '../../utils/checks'
import { printValueMapRecursive } from '../../utils/cli'
import { Args } from '../../utils/command'

export default class Show extends BaseCommand {
  static description =
    'Show Locked Planq information for a given account. This includes the total amount of locked planq, the amount being used for voting in Validator Elections, the Locked Planq balance this account is required to maintain due to a registered Validator or Validator Group, and any pending withdrawals that have been initiated via "lockedplanq:unlock".'

  static flags = {
    ...BaseCommand.flags,
  }

  static args = [Args.address('account')]

  static examples = ['show 0x5409ed021d9299bf6814279a6a1411a7e866a631']

  async run() {
    const { args } = this.parse(Show)

    const lockedPlanq = await this.kit.contracts.getLockedPlanq()

    await newCheckBuilder(this).isAccount(args.account).runChecks()

    printValueMapRecursive(await lockedPlanq.getAccountSummary(args.account))
  }
}
