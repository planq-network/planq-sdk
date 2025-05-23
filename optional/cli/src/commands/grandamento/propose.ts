import { StableToken } from '@planq-network/contractkit'
import { flags } from '@oclif/command'
import { BaseCommand } from '../../base'
import { newCheckBuilder } from '../../utils/checks'
import { displaySendTx } from '../../utils/cli'
import { Flags } from '../../utils/command'
import { enumEntriesDupWithLowercase } from '../../utils/helpers'

const stableTokenOptions = enumEntriesDupWithLowercase(Object.entries(StableToken))

export default class Propose extends BaseCommand {
  static description = 'Proposes a Granda Mento exchange'

  static flags = {
    ...BaseCommand.flags,
    from: Flags.address({ required: true, description: 'The address with tokens to exchange' }),
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
    const planqToken = await this.kit.contracts.getPlanqToken()
    const grandaMento = await this.kit.contracts.getGrandaMento()

    const res = this.parse(Propose)
    const signer = res.flags.from
    const sellAmount = res.flags.value
    const stableToken = stableTokenOptions[res.flags.stableToken]
    const sellPlanq = res.flags.sellPlanq === 'true'

    this.kit.defaultAccount = signer

    const tokenToSell = sellPlanq ? planqToken : await this.kit.contracts.getStableToken(stableToken)

    await newCheckBuilder(this, signer)
      .hasEnoughErc20(signer, sellAmount, tokenToSell.address)
      .runChecks()

    await displaySendTx(
      'increaseAllowance',
      tokenToSell.increaseAllowance(grandaMento.address, sellAmount.toFixed())
    )

    await displaySendTx(
      'createExchangeProposal',
      await grandaMento.createExchangeProposal(
        this.kit.planqTokens.getContract(stableToken),
        sellAmount,
        sellPlanq
      ),
      undefined,
      'ExchangeProposalCreated'
    )
  }
}
