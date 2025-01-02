import { flags } from '@oclif/command'
import BigNumber from 'bignumber.js'
import { BaseCommand } from '../../base'
import { newCheckBuilder } from '../../utils/checks'
import { displaySendTx } from '../../utils/cli'
import { Flags } from '../../utils/command'

export default class TransferPlanq extends BaseCommand {
  static description =
    'Transfer PLQ to a specified address. (Note: this is the equivalent of the old transfer:planq)'

  static flags = {
    ...BaseCommand.flags,
    from: Flags.address({ required: true, description: 'Address of the sender' }),
    to: Flags.address({ required: true, description: 'Address of the receiver' }),
    value: flags.string({ required: true, description: 'Amount to transfer (in wei)' }),
    comment: flags.string({ description: 'Transfer comment' }),
  }

  static examples = [
    'planq --from 0xa0Af2E71cECc248f4a7fD606F203467B500Dd53B --to 0x5409ed021d9299bf6814279a6a1411a7e866a631 --value 10000000000000000000',
  ]

  async run() {
    const res = this.parse(TransferPlanq)

    const from: string = res.flags.from
    const to: string = res.flags.to
    const value = new BigNumber(res.flags.value)

    this.kit.defaultAccount = from
    const planqToken = await this.kit.contracts.getPlanqToken()

    await newCheckBuilder(this).hasEnoughPlanq(from, value).runChecks()

    if (res.flags.comment) {
      await displaySendTx(
        'transferWithComment',
        planqToken.transferWithComment(to, value.toFixed(), res.flags.comment)
      )
    } else {
      await displaySendTx('transfer', planqToken.transfer(to, value.toFixed()))
    }
  }
}
