import { flags } from '@oclif/command'
import BigNumber from 'bignumber.js'
import { BaseCommand } from '../../base'
import { newCheckBuilder } from '../../utils/checks'
import { displaySendTx } from '../../utils/cli'
import { Flags } from '../../utils/command'
import { LockedPlanqArgs } from '../../utils/lockedplanq'

export default class Unlock extends BaseCommand {
  static description =
    'Unlocks PLQ, which can be withdrawn after the unlocking period. Unlocked planq will appear as a "pending withdrawal" until the unlocking period is over, after which it can be withdrawn via "lockedplanq:withdraw".'

  static flags = {
    ...BaseCommand.flags,
    from: Flags.address({ required: true }),
    value: flags.string({ ...LockedPlanqArgs.valueArg, required: true }),
  }

  static args = []

  static examples = ['unlock --from 0x47e172F6CfB6c7D01C1574fa3E2Be7CC73269D95 --value 500000000']

  async run() {
    const res = this.parse(Unlock)

    const lockedplanq = await this.kit.contracts.getLockedPlanq()
    const value = new BigNumber(res.flags.value)

    await newCheckBuilder(this, res.flags.from)
      .isAccount(res.flags.from)
      .isNotVoting(res.flags.from)
      .hasEnoughLockedPlanqToUnlock(value)
      .runChecks()

    await displaySendTx('unlock', lockedplanq.unlock(value))
  }
}
