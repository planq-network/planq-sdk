import { BaseExchangeAdapter, ExchangeAdapter, ExchangeDataType, Ticker } from './base'

import BigNumber from 'bignumber.js'
import { Currency, Exchange, ExternalCurrency } from '../utils'
import { strict as assert } from 'assert'

export class CoingeckoGeneralAdapter extends BaseExchangeAdapter implements ExchangeAdapter {
  baseApiUrl = 'https://pro-api.coingecko.com/api/v3/coins'
  readonly _exchangeName: Exchange = Exchange.COINGECKOGENERAL
  // E1 - validity not after: 15/09/2025, 13:00:00 GMT-3
  readonly _certFingerprint256 =
    '89:23:D3:75:A3:D8:77:EC:BB:21:8F:91:63:EB:01:95:4F:0D:E6:33:09:E2:32:6F:AF:CB:0A:04:9B:E6:47:26'

  private static readonly tokenSymbolMap = new Map<Currency, string>([
    ...CoingeckoGeneralAdapter.standardTokenSymbolMap,
    [ExternalCurrency.USDC, 'usd-coin'],
    [ExternalCurrency.PLQ, 'planq'],
  ])

  protected generatePairSymbol(): string {
    const base = CoingeckoGeneralAdapter.tokenSymbolMap.get(this.config.baseCurrency)
    const quote = CoingeckoGeneralAdapter.tokenSymbolMap.get(this.config.quoteCurrency)

    return `${base}${quote}`
  }

  async fetchTicker(): Promise<Ticker> {
    assert(this.config.apiKey !== undefined, 'Coingecko API key was not set')

    const base = CoingeckoGeneralAdapter.tokenSymbolMap.get(this.config.baseCurrency)

    const tickerJson: Response = await this.fetchFromApi(
      ExchangeDataType.TICKER,
      `/${base}?x_cg_pro_api_key=${this.config.apiKey}`
    )
    return this.parseTicker(tickerJson)
  }

  /**
   *
   * @param json parsed response from Coingecko latest endpoint
   * {
   *   "market_data": {
   *     "current_price": {
   *       "usd": 0.0,
   *       "eur": 0.0,
   *       "xof": 0.0
   *     },
   *   },
   *     "last_updated": "2025-03-05T12:47:17.256Z",
   * }
   */
  parseTicker(json: any): Ticker {
    assert(json.error === undefined, 'Coingecko response object contains error field')
    assert(
      json.id == CoingeckoGeneralAdapter.tokenSymbolMap.get(this.config.baseCurrency),
      'Coingecko response object to field does not match base currency'
    )
    assert(
      json.market_data.current_price[this.config.quoteCurrency.toLowerCase()] !== undefined,
      'Coingecko response object from field does not match quote currency'
    )

    const price = this.safeBigNumberParse(
      json.market_data.current_price[this.config.quoteCurrency.toLowerCase()]
    )!
    const ticker = {
      ...this.priceObjectMetadata,
      ask: price,
      bid: price,
      lastPrice: price,
      timestamp: this.safeDateParse(json.market_data.last_updated)!,

      baseVolume:
        this.safeBigNumberParse(
          json.market_data.total_volume[this.config.quoteCurrency.toLowerCase()]
        )!.div(price) ?? new BigNumber(1),
      quoteVolume:
        this.safeBigNumberParse(
          json.market_data.total_volume[this.config.quoteCurrency.toLowerCase()]
        ) ?? new BigNumber(1),
    }
    this.verifyTicker(ticker)
    return ticker
  }

  async isOrderbookLive(): Promise<boolean> {
    return true
  }
}
