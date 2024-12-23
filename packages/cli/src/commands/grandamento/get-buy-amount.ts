import { StableToken } from '@planq-network/contractkit'
import { toFixed } from '@planq-network/utils/lib/fixidity'
import { flags } from '@oclif/command'
import { BaseCommand } from '../../base'
import { printValueMap } from '../../utils/cli'
import { Flags } from '../../utils/command'
import { enumEntriesDupWithLowercase } from '../../utils/helpers'

const stableTokenOptions = enumEntriesDupWithLowercase(Object.entries(StableToken))

export default class GetBuyAmount extends BaseCommand {
  static description = 'Gets the buy amount for a prospective Granda Mento exchange'

  static flags = {
    ...BaseCommand.flags,
    value: Flags.wei({
      required: true,
      description: 'The value of the tokens to exchange',
    }),
    stableToken: flags.enum({
      required: true,
      options: Object.keys(stableTokenOptions),
      description: 'Name of the stable to receive or send',
      default: 'pUSD',
    }),
    sellPlanq: flags.enum({
      options: ['true', 'false'],
      required: true,
      description: 'Sell or buy PLQ',
    }),
  }

  async run() {
    const grandaMento = await this.kit.contracts.getGrandaMento()

    const res = this.parse(GetBuyAmount)
    const sellAmount = res.flags.value
    const stableToken = stableTokenOptions[res.flags.stableToken]
    const sellPlanq = res.flags.sellPlanq === 'true'

    const stableTokenAddress = await this.kit.planqTokens.getAddress(stableToken)
    const sortedOracles = await this.kit.contracts.getSortedOracles()
    const planqStableTokenOracleRate = (await sortedOracles.medianRate(stableTokenAddress)).rate

    const buyAmount = await grandaMento.getBuyAmount(
      toFixed(planqStableTokenOracleRate),
      sellAmount,
      sellPlanq
    )

    printValueMap({
      buyAmount,
    })
  }
}
