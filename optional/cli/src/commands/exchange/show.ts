import { StableTokenInfo } from '@planq-network/contractkit/lib/planq-tokens'
import { flags } from '@oclif/command'
import { cli } from 'cli-ux'
import { BaseCommand } from '../../base'

export default class ExchangeShow extends BaseCommand {
  static description = 'Show the current exchange rates offered by the Exchange'

  static flags = {
    ...BaseCommand.flags,
    amount: flags.string({
      description: 'Amount of the token being exchanged to report rates for',
      default: '1000000000000000000',
    }),
  }

  static args = []

  static examples = ['list']

  async run() {
    const { flags: parsedFlags } = this.parse(ExchangeShow)

    cli.action.start('Fetching exchange rates...')
    const exchangeAmounts = await this.kit.planqTokens.forStablePlanqToken(
      async (info: StableTokenInfo) => {
        const exchange = await this.kit.contracts.getContract(info.exchangeContract)
        return {
          buy: await exchange.getBuyTokenAmount(parsedFlags.amount as string, true),
          sell: await exchange.getBuyTokenAmount(parsedFlags.amount as string, false),
        }
      }
    )
    cli.action.stop()

    Object.entries(exchangeAmounts).forEach((element) => {
      this.log(`PLQ/${element[0]}:`)
      this.log(`${parsedFlags.amount} PLQ => ${element[1]!.buy} ${element[0]}`)
      this.log(`${parsedFlags.amount} ${element[0]} => ${element[1]!.sell} PLQ`)
    })
  }
}
