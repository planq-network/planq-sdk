import { Exchange, ExternalCurrency } from '../../src/utils'

import BigNumber from 'bignumber.js'
import { BittrexAdapter } from '../../src/exchange_adapters/bittrex'
import { CeloContract } from '@celo/contractkit'
import { ExchangeAdapterConfig } from '../../src/exchange_adapters/base'
import { baseLogger } from '../../src/default_config'

describe('BittrexAdapter', () => {
  let bittrexAdapter: BittrexAdapter
  const config: ExchangeAdapterConfig = {
    baseCurrency: CeloContract.GoldToken,
    baseLogger,
    quoteCurrency: ExternalCurrency.USD,
  }
  beforeEach(() => {
    bittrexAdapter = new BittrexAdapter(config)
  })
  afterEach(() => {
    jest.clearAllTimers()
    jest.clearAllMocks()
  })
  describe('parseTicker', () => {
    const correctlyFormattedSummaryJson = {
      symbol: 'PLANQ-USD',
      high: '215.83000000',
      low: '210.33300000',
      volume: '3335.48514449',
      quoteVolume: '711062.81323057',
      percentChange: '0.2',
      updatedAt: '2020-05-20T10:12:41.393Z',
    }
    const correctlyFormattedTickerJson = {
      symbol: 'PLANQ-USD',
      lastTradeRate: '213.76200000',
      bidRate: '213.56500000',
      askRate: '213.83400000',
    }

    it('handles a response that matches the documentation', () => {
      const ticker = bittrexAdapter.parseTicker(
        correctlyFormattedTickerJson,
        correctlyFormattedSummaryJson
      )

      expect(ticker).toEqual({
        source: Exchange.BITTREX,
        symbol: bittrexAdapter.standardPairSymbol,
        timestamp: 1589969561393,
        high: new BigNumber(215.83),
        low: new BigNumber(210.333),
        bid: new BigNumber(213.565),
        ask: new BigNumber(213.834),
        lastPrice: new BigNumber(213.762),
        baseVolume: new BigNumber(3335.48514449),
        quoteVolume: new BigNumber(711062.81323057),
      })
    })
    it('throws an error when a required BigNumber field is missing', () => {
      expect(() => {
        bittrexAdapter.parseTicker(
          {
            ...correctlyFormattedTickerJson,
            lastTradeRate: undefined,
          },
          correctlyFormattedSummaryJson
        )
      }).toThrowError('lastPrice not defined')
    })
    it('throws an error when the date could not be parsed', () => {
      expect(() => {
        bittrexAdapter.parseTicker(correctlyFormattedTickerJson, {
          ...correctlyFormattedSummaryJson,
          updatedAt: 'the 20th of May, 2020 at 1:22 pm',
        })
      }).toThrowError('timestamp not defined')
    })
  })

  describe('isOrderbookLive', () => {
    const mockStatusJson = {
      symbol: 'PLANQ-USD',
      baseCurrencySymbol: 'PLANQ',
      quoteCurrencySymbol: 'USD',
      minTradeSize: '3.00000000',
      precision: 3,
      status: 'ONLINE',
      createdAt: '2020-05-21T16:43:29.013Z',
      notice: '',
      prohibitedIn: [],
      associatedTermsOfService: [],
    }

    it('returns true if status is online', async () => {
      jest.spyOn(bittrexAdapter, 'fetchFromApi').mockReturnValue(Promise.resolve(mockStatusJson))
      expect(await bittrexAdapter.isOrderbookLive()).toEqual(true)
    })
    it('returns false if status is offline', async () => {
      jest.spyOn(bittrexAdapter, 'fetchFromApi').mockReturnValue(
        Promise.resolve({
          ...mockStatusJson,
          status: 'OFFLINE',
        })
      )
      expect(await bittrexAdapter.isOrderbookLive()).toEqual(false)
    })
  })
})
