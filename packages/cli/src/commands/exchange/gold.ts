import ExchangePlanq from './planq'

export default class ExchangePlanq extends ExchangePlanq {
  static description =
    'Exchange PLQ for StableTokens via the stability mechanism. *DEPRECATION WARNING* Use the "exchange:planq" command instead'

  static flags = {
    ...ExchangePlanq.flags,
  }

  static args = []

  static examples = [
    'planq --value 5000000000000 --from 0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d',
    'planq --value 5000000000000 --forAtLeast 100000000000000 --from 0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d --stableToken pUSD',
  ]
}
