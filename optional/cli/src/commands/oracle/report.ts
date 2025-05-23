import { PlanqContract } from '@planq-network/contractkit'
import { flags } from '@oclif/command'
import BigNumber from 'bignumber.js'
import { BaseCommand } from '../../base'
import { displaySendTx, failWith } from '../../utils/cli'
import { Flags } from '../../utils/command'

export default class ReportPrice extends BaseCommand {
  static description = 'Report the price of PLQ in a specified token'

  static args = [
    {
      name: 'token',
      required: true,
      default: PlanqContract.StableToken,
      description: 'Token to report on',
    },
  ]
  static flags = {
    ...BaseCommand.flags,
    from: Flags.address({ required: true, description: 'Address of the oracle account' }),
    value: flags.string({
      required: true,
      description: 'Amount of the specified token equal to 1 PLQ',
    }),
  }

  static example = [
    'report StableToken --value 1.02 --from 0x8c349AAc7065a35B7166f2659d6C35D75A3893C1',
    'report --value 0.99 --from 0x8c349AAc7065a35B7166f2659d6C35D75A3893C1',
    'report StableTokenEUR --value 1.02 --from 0x8c349AAc7065a35B7166f2659d6C35D75A3893C1',
  ]

  async run() {
    const res = this.parse(ReportPrice)
    const sortedOracles = await this.kit.contracts.getSortedOracles()
    const value = new BigNumber(res.flags.value)

    await displaySendTx(
      'sortedOracles.report',
      await sortedOracles.report(res.args.token, value, res.flags.from).catch((e) => failWith(e))
    )
    this.log(`Reported oracle value: ${value.toString()} ${res.args.token} == 1 PLQ`)
  }
}
