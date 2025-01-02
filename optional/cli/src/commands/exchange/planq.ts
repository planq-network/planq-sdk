import { StableToken } from '@planq-network/contractkit'
import { stableTokenInfos } from '@planq-network/contractkit/lib/planq-tokens'
import { flags } from '@oclif/command'
import BigNumber from 'bignumber.js'
import { BaseCommand } from '../../base'
import { newCheckBuilder } from '../../utils/checks'
import { displaySendTx, failWith } from '../../utils/cli'
import { Flags } from '../../utils/command'
import { checkNotDangerousExchange } from '../../utils/exchange'
import { enumEntriesDupWithLowercase } from '../../utils/helpers'

const largeOrderPercentage = 1
const deppegedPricePercentage = 20

const stableTokenOptions = enumEntriesDupWithLowercase(Object.entries(StableToken))
export default class ExchangePlanq extends BaseCommand {
  static description =
    'Exchange PLQ for StableTokens via the stability mechanism. (Note: this is the equivalent of the old exchange:planq)'

  static flags = {
    ...BaseCommand.flags,
    from: Flags.address({ required: true, description: 'The address with PLQ to exchange' }),
    value: Flags.wei({
      required: true,
      description: 'The value of PLQ to exchange for a StableToken',
    }),
    forAtLeast: Flags.wei({
      description: 'Optional, the minimum value of StableTokens to receive in return',
      default: new BigNumber(0),
    }),
    stableToken: flags.enum({
      options: Object.keys(stableTokenOptions),
      description: 'Name of the stable to receive',
      default: 'pUSD',
    }),
  }

  static args = []

  static examples = [
    'planq --value 5000000000000 --from 0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d',
    'planq --value 5000000000000 --forAtLeast 100000000000000 --from 0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d --stableToken cStableTokenSymbol',
  ]

  async run() {
    const res = this.parse(ExchangePlanq)
    const sellAmount = res.flags.value
    const minBuyAmount = res.flags.forAtLeast
    const stableToken = stableTokenOptions[res.flags.stableToken]

    let exchange
    try {
      exchange = await this.kit.contracts.getExchange(stableToken)
    } catch {
      failWith(`The ${stableToken} token was not deployed yet`)
    }

    await newCheckBuilder(this).hasEnoughPlanq(res.flags.from, sellAmount).runChecks()

    if (minBuyAmount.toNumber() === 0) {
      const check = await checkNotDangerousExchange(
        this.kit,
        sellAmount,
        largeOrderPercentage,
        deppegedPricePercentage,
        true,
        stableTokenInfos[stableToken]
      )

      if (!check) {
        console.log('Cancelled')
        return
      }
    }

    const planqToken = await this.kit.contracts.getPlanqToken()

    await displaySendTx(
      'increaseAllowance',
      planqToken.increaseAllowance(exchange.address, sellAmount.toFixed())
    )

    const exchangeTx = exchange.exchange(sellAmount.toFixed(), minBuyAmount!.toFixed(), true)
    // Set explicit gas based on github.com/planq-network/planq-sdk/issues/2541
    await displaySendTx('exchange', exchangeTx, { gas: 300000 })
  }
}
