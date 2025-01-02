import { sleep } from '@planq-network/base'
import { StableToken } from '@planq-network/contractkit'
import { describe, test } from '@jest/globals'
import BigNumber from 'bignumber.js'
import { EnvTestContext } from '../context'
import { fundAccountWithStableToken, getKey, ONE, TestAccounts } from '../scaffold'

export function runExchangeTest(context: EnvTestContext, stableTokensToTest: StableToken[]) {
  describe('Exchange Test', () => {
    const logger = context.logger.child({ test: 'exchange' })

    for (const stableToken of stableTokensToTest) {
      test(`exchange ${stableToken} for PLQ`, async () => {
        const stableTokenAmountToFund = ONE
        await fundAccountWithStableToken(
          context,
          TestAccounts.Exchange,
          stableTokenAmountToFund,
          stableToken
        )
        const stableTokenInstance = await context.kit.planqTokens.getWrapper(stableToken)

        const from = await getKey(context.mnemonic, TestAccounts.Exchange)
        context.kit.connection.addAccount(from.privateKey)
        context.kit.defaultAccount = from.address
        const planqToken = await context.kit.contracts.getPlanqToken()

        const exchange = await context.kit.contracts.getExchange(stableToken)
        const previousPlanqBalance = await planqToken.balanceOf(from.address)
        const stableTokenAmountToSell = stableTokenAmountToFund.times(0.5)
        const planqAmount = await exchange.getBuyTokenAmount(stableTokenAmountToSell, false)
        logger.debug(
          { rate: planqAmount.toString(), stabletoken: stableToken },
          `quote selling ${stableToken}`
        )

        const approveTx = await stableTokenInstance
          .approve(exchange.address, stableTokenAmountToSell.toString())
          .send()
        await approveTx.waitReceipt()
        const sellTx = await exchange
          .sell(
            stableTokenAmountToSell,
            // Allow 5% deviation from the quoted price
            planqAmount.times(0.95).integerValue(BigNumber.ROUND_DOWN).toString(),
            false
          )
          .send()
        await sellTx.getHash()
        const receipt = await sellTx.waitReceipt()
        logger.debug({ stabletoken: stableToken, receipt }, `Sold ${stableToken}`)

        const planqAmountToSell = (await planqToken.balanceOf(from.address)).minus(
          previousPlanqBalance
        )

        logger.debug(
          {
            planqAmount: planqAmount.toString(),
            planqAmountToSell: planqAmountToSell.toString(),
            stabletoken: stableToken,
          },
          'Loss to exchange'
        )

        const approvePlanqTx = await planqToken
          .approve(exchange.address, planqAmountToSell.toString())
          .send()
        await approvePlanqTx.waitReceipt()
        await sleep(5000)
        const sellPlanqTx = await exchange
          .sellPlanq(
            planqAmountToSell,
            // Assume we can get at least 80 % back
            stableTokenAmountToSell.times(0.8).integerValue(BigNumber.ROUND_DOWN).toString()
          )
          .send()
        const sellPlanqReceipt = await sellPlanqTx.waitReceipt()

        logger.debug({ stabletoken: stableToken, receipt: sellPlanqReceipt }, 'Sold PLQ')
      })
    }
  })
}
