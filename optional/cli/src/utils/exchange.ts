import { ContractKit } from '@planq-network/contractkit'
import { StableToken, StableTokenInfo, stableTokenInfos } from '@planq-network/contractkit/lib/planq-tokens'
import BigNumber from 'bignumber.js'
import { binaryPrompt } from './cli'

export const swapArguments = [
  {
    name: 'sellAmount',
    required: true,
    description: 'the amount of sellToken (in wei) to sell',
  },
  {
    name: 'minBuyAmount',
    required: true,
    description: 'the minimum amount of buyToken (in wei) expected',
  },
  {
    name: 'from',
    required: true,
  },
]

export async function checkNotDangerousExchange(
  kit: ContractKit,
  amount: BigNumber,
  largeOrderPercentage: number,
  deppegedPricePercentage: number,
  buyBucket: boolean,
  stableTokenInfo: StableTokenInfo = stableTokenInfos[StableToken.pUSD]
): Promise<boolean> {
  const oracles = await kit.contracts.getSortedOracles()
  const exchange = await kit.contracts.getExchange(stableTokenInfo.symbol as StableToken)
  const oracleMedianRate = (await oracles.medianRate(stableTokenInfo.contract)).rate
  const buckets = await exchange.getBuyAndSellBuckets(false)

  const chainRate = buckets[1].dividedBy(buckets[0])
  let warningMessage
  // XX% difference between rates
  if (Math.abs(oracleMedianRate.dividedBy(chainRate).toNumber() - 1) > deppegedPricePercentage) {
    const warningDeppegedPrice = `Warning ${stableTokenInfo.symbol} price here (i.e. on-chain) is depegged by >${deppegedPricePercentage}% from the oracle prices (i.e. exchange prices).`
    warningMessage = warningDeppegedPrice
  }

  // X% of the bucket
  const bucket = buyBucket ? buckets[1] : buckets[0]
  if (bucket.dividedBy(100 / largeOrderPercentage).isLessThanOrEqualTo(amount)) {
    const warningLargeOrder =
      'Warning you are executing a large order, risk of price slippage i.e. getting an unfavorable exchange rate.'
    warningMessage = warningMessage ? `${warningMessage} ${warningLargeOrder}` : warningLargeOrder
  }

  if (warningMessage) {
    const check = await binaryPrompt(`${warningMessage}. Are you sure you want to continue?`, true)
    return check
  }
  return true
}
