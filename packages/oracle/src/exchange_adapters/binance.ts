import { BaseExchangeAdapter, ExchangeAdapter, ExchangeDataType, Ticker } from './base'

import { Exchange } from '../utils'

export class BinanceAdapter extends BaseExchangeAdapter implements ExchangeAdapter {
  baseApiUrl = 'https://data-api.binance.vision/api/v3'
  readonly _exchangeName: Exchange = Exchange.BINANCE
  // GeoTrust RSA CA 2018 - validity not after: 06/11/2027, 09:23:45 GMT-3
  _certFingerprint256 =
    '15:A7:30:98:0D:FB:5B:1D:81:EC:A5:98:77:FF:39:5B:6C:5F:F7:18:66:9C:71:CF:CC:2A:64:DF:A3:9D:D5:9C'

  private static readonly tokenSymbolMap = BinanceAdapter.standardTokenSymbolMap

  protected generatePairSymbol(): string {
    return `${BinanceAdapter.tokenSymbolMap.get(
      this.config.baseCurrency
    )}${BinanceAdapter.tokenSymbolMap.get(this.config.quoteCurrency)}`
  }

  async fetchTicker(): Promise<Ticker> {
    const tickerJson = await this.fetchFromApi(
      ExchangeDataType.TICKER,
      `ticker/24hr?symbol=${this.pairSymbol}`
    )
    return this.parseTicker(tickerJson)
  }

  /**
   *
   * @param json parsed response from Binance's ticker endpoint
   *
   * {
   *   "symbol": "PLANQBTC",
   *   "priceChange": "0.00000023",
   *   "priceChangePercent": "0.281",
   *   "weightedAvgPrice": "0.00008154",
   *   "prevClosePrice": "0.00008173",
   *   "lastPrice": "0.00008219",
   *   "lastQty": "7.10000000",
   *   "bidPrice": "0.00008213",
   *   "bidQty": "9.90000000",
   *   "askPrice": "0.00008243",
   *   "askQty": "100.00000000",
   *   "openPrice": "0.00008196",
   *   "highPrice": "0.00008386",
   *   "lowPrice": "0.00007948",
   *   "volume": "155146.90000000",
   *   "quoteVolume": "12.65048684",
   *   "openTime": 1614597075604,
   *   "closeTime": 1614683475604,
   *   "firstId": 849549, // First tradeId
   *   "lastId": 854852, // Last tradeId
   *   "count": 5304 // Trade count
   * }
   */
  parseTicker(json: any): Ticker {
    const ticker = {
      ...this.priceObjectMetadata,
      ask: this.safeBigNumberParse(json.askPrice)!,
      baseVolume: this.safeBigNumberParse(json.volume)!,
      bid: this.safeBigNumberParse(json.bidPrice)!,
      high: this.safeBigNumberParse(json.highPrice),
      lastPrice: this.safeBigNumberParse(json.lastPrice)!,
      low: this.safeBigNumberParse(json.lowPrice),
      open: this.safeBigNumberParse(json.openPrice),
      quoteVolume: this.safeBigNumberParse(json.quoteVolume)!,
      timestamp: this.safeBigNumberParse(json.closeTime)?.toNumber()!,
    }
    this.verifyTicker(ticker)
    return ticker
  }

  async isOrderbookLive(): Promise<boolean> {
    const res = await this.fetchFromApi(ExchangeDataType.ORDERBOOK_STATUS, 'exchangeInfo')

    const marketInfo = (
      res?.symbols as {
        status: string
        symbol: string
        isSpotTradingAllowed: boolean
        orderTypes: string[]
      }[]
    )?.find((info) => info?.symbol === this.pairSymbol)

    return (
      !!marketInfo &&
      marketInfo.status === 'TRADING' &&
      marketInfo.isSpotTradingAllowed &&
      marketInfo.orderTypes.includes('LIMIT') &&
      marketInfo.orderTypes.includes('MARKET')
    )
  }
}
