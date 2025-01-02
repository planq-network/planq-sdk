import { PlanqTransactionObject } from '@planq-network/connect'
import BigNumber from 'bignumber.js'
import { Exchange } from '../generated/astonic/Exchange'
import {
  BaseWrapper,
  fixidityValueToBigNumber,
  identity,
  proxyCall,
  proxySend,
  secondsToDurationString,
  tupleParser,
  unixSecondsTimestampToDateString,
  valueToBigNumber,
  valueToFrac,
  valueToString,
} from './BaseWrapper'

export interface ExchangeConfig {
  spread: BigNumber
  reserveFraction: BigNumber
  updateFrequency: BigNumber
  minimumReports: BigNumber
  lastBucketUpdate: BigNumber
}

/**
 * Contract that allows to exchange StableToken for PlanqToken and vice versa
 * using a Constant Product Market Maker Model aka Mento
 */
export class ExchangeWrapper extends BaseWrapper<Exchange> {
  /**
   * Query spread parameter
   * @returns Current spread charged on exchanges
   */
  spread = proxyCall(this.contract.methods.spread, undefined, fixidityValueToBigNumber)
  /**
   * Query reserve fraction parameter
   * @returns Current fraction to commit to the planq bucket
   */
  reserveFraction = proxyCall(
    this.contract.methods.reserveFraction,
    undefined,
    fixidityValueToBigNumber
  )
  /**
   * Query update frequency parameter
   * @returns The time period that needs to elapse between bucket
   * updates
   */
  updateFrequency = proxyCall(this.contract.methods.updateFrequency, undefined, valueToBigNumber)
  /**
   * Query minimum reports parameter
   * @returns The minimum number of fresh reports that need to be
   * present in the oracle to update buckets
   * commit to the planq bucket
   */
  minimumReports = proxyCall(this.contract.methods.minimumReports, undefined, valueToBigNumber)
  /**
   * Query last bucket update
   * @returns The timestamp of the last time exchange buckets were updated.
   */
  lastBucketUpdate = proxyCall(this.contract.methods.lastBucketUpdate, undefined, valueToBigNumber)

  /**
   * DEPRECATED: use function sell
   * Exchanges sellAmount of sellToken in exchange for at least minBuyAmount of buyToken
   * Requires the sellAmount to have been approved to the exchange
   * @param sellAmount The amount of sellToken the user is selling to the exchange
   * @param minBuyAmount The minimum amount of buyToken the user has to receive for this
   * transaction to succeed
   * @param sellPlanq `true` if planq is the sell token
   * @return The amount of buyToken that was transfered
   */
  exchange: (
    sellAmount: BigNumber.Value,
    minBuyAmount: BigNumber.Value,
    sellPlanq: boolean
  ) => PlanqTransactionObject<string> = proxySend(
    this.connection,
    this.contract.methods.exchange,
    tupleParser(valueToString, valueToString, identity)
  )

  /**
   * Sells sellAmount of sellToken in exchange for at least minBuyAmount of buyToken
   * Requires the sellAmount to have been approved to the exchange
   * @param sellAmount The amount of sellToken the user is selling to the exchange
   * @param minBuyAmount The minimum amount of buyToken the user has to receive for this
   * transaction to succeed
   * @param sellPlanq `true` if planq is the sell token
   * @return The amount of buyToken that was transfered
   */
  sell: (
    sellAmount: BigNumber.Value,
    minBuyAmount: BigNumber.Value,
    sellPlanq: boolean
  ) => PlanqTransactionObject<string> = proxySend(
    this.connection,
    this.contract.methods.sell,
    tupleParser(valueToString, valueToString, identity)
  )

  /**
   * Sells sellAmount of sellToken in exchange for at least minBuyAmount of buyToken
   * Requires the sellAmount to have been approved to the exchange
   * @param buyAmount The amount of sellToken the user is selling to the exchange
   * @param maxSellAmount The maximum amount of sellToken the user will sell for this
   * transaction to succeed
   * @param buyPlanq `true` if planq is the buy token
   * @return The amount of buyToken that was transfered
   */
  buy: (
    buyAmount: BigNumber.Value,
    maxSellAmount: BigNumber.Value,
    buyPlanq: boolean
  ) => PlanqTransactionObject<string> = proxySend(
    this.connection,
    this.contract.methods.buy,
    tupleParser(valueToString, valueToString, identity)
  )

  /**
   * @dev Returns the amount of buyToken a user would get for sellAmount of sellToken
   * @param sellAmount The amount of sellToken the user is selling to the exchange
   * @param sellPlanq `true` if planq is the sell token
   * @return The corresponding buyToken amount.
   */
  async getBuyTokenAmount(sellAmount: BigNumber.Value, sellPlanq: boolean): Promise<BigNumber> {
    const sell = valueToString(sellAmount)
    if (new BigNumber(sell).eq(0)) {
      return new BigNumber(0)
    }
    const res = await this.contract.methods.getBuyTokenAmount(sell, sellPlanq).call()
    return valueToBigNumber(res)
  }

  /**
   * Returns the amount of sellToken a user would need to exchange to receive buyAmount of
   * buyToken.
   * @param buyAmount The amount of buyToken the user would like to purchase.
   * @param sellPlanq `true` if planq is the sell token
   * @return The corresponding sellToken amount.
   */
  async getSellTokenAmount(buyAmount: BigNumber.Value, sellPlanq: boolean): Promise<BigNumber> {
    const buy = valueToString(buyAmount)
    if (new BigNumber(buy).eq(0)) {
      return new BigNumber(0)
    }
    const res = await this.contract.methods.getSellTokenAmount(buy, sellPlanq).call()
    return valueToBigNumber(res)
  }

  /**
   * Returns the buy token and sell token bucket sizes, in order. The ratio of
   * the two also represents the exchange rate between the two.
   * @param sellPlanq `true` if planq is the sell token
   * @return [buyTokenBucket, sellTokenBucket]
   */
  getBuyAndSellBuckets: (sellPlanq: boolean) => Promise<[BigNumber, BigNumber]> = proxyCall(
    this.contract.methods.getBuyAndSellBuckets,
    undefined,
    (callRes: { 0: string; 1: string }) =>
      [valueToBigNumber(callRes[0]), valueToBigNumber(callRes[1])] as [BigNumber, BigNumber]
  )

  /**
   * Sell amount of PLQ in exchange for at least minStableAmount of the stable token
   * Requires the amount to have been approved to the exchange
   * @param amount The amount of PLQ the user is selling to the exchange
   * @param minStableAmount The minimum amount of the stable token the user has to receive for this
   * transaction to succeed
   */
  sellPlanq = (amount: BigNumber.Value, minStableAmount: BigNumber.Value) =>
    this.sell(amount, minStableAmount, true)

  /**
   * Sell amount of the stable token in exchange for at least minPlanqAmount of PLQ
   * Requires the amount to have been approved to the exchange
   * @param amount The amount of the stable token the user is selling to the exchange
   * @param minPlanqAmount The minimum amount of PLQ the user has to receive for this
   * transaction to succeed
   */
  sellStable = (amount: BigNumber.Value, minPlanqAmount: BigNumber.Value) =>
    this.sell(amount, minPlanqAmount, false)

  /**
   * Deprecated alias of sellStable.
   * Sell amount of the stable token in exchange for at least minPlanqAmount of PLQ
   * Requires the amount to have been approved to the exchange
   * @deprecated use sellStable instead
   * @param amount The amount of the stable token the user is selling to the exchange
   * @param minPlanqAmount The minimum amount of PLQ the user has to receive for this
   * transaction to succeed
   */
  sellDollar = this.sellStable

  /**
   * Buy amount of PLQ in exchange for at most maxStableAmount of the stable token
   * Requires the amount to have been approved to the exchange
   * @param amount The amount of PLQ the user is buying from the exchange
   * @param maxStableAmount The maximum amount of the stable token the user will pay for this
   * transaction to succeed
   */
  buyPlanq = (amount: BigNumber.Value, maxStableAmount: BigNumber.Value) =>
    this.buy(amount, maxStableAmount, true)

  /**
   * Buy amount of the stable token in exchange for at least minPlanqAmount of PLQ
   * Requires the amount to have been approved to the exchange
   * @param amount The amount of the stable token the user is selling to the exchange
   * @param maxPlanqAmount The maximum amount of PLQ the user will pay for this
   * transaction to succeed
   */
  buyStable = (amount: BigNumber.Value, maxPlanqAmount: BigNumber.Value) =>
    this.buy(amount, maxPlanqAmount, false)

  /**
   * Deprecated alias of buyStable.
   * Buy amount of the stable token in exchange for at least minPlanqAmount of PLQ
   * Requires the amount to have been approved to the exchange
   * @deprecated use buyStable instead
   * @param amount The amount of the stable token the user is selling to the exchange
   * @param maxPlanqAmount The maximum amount of PLQ the user will pay for this
   * transaction to succeed
   */
  buyDollar = this.buyStable

  /**
   * Returns the amount of PLQ a user would get for sellAmount of the stable token
   * @param sellAmount The amount of the stable token the user is selling to the exchange
   * @return The corresponding PLQ amount.
   */
  quoteStableSell = (sellAmount: BigNumber.Value) => this.getBuyTokenAmount(sellAmount, false)

  /**
   * Deprecated alias of quoteStableSell.
   * Returns the amount of PLQ a user would get for sellAmount of the stable token
   * @deprecated Use quoteStableSell instead
   * @param sellAmount The amount of the stable token the user is selling to the exchange
   * @return The corresponding PLQ amount.
   */
  quoteUsdSell = this.quoteStableSell

  /**
   * Returns the amount of the stable token a user would get for sellAmount of PLQ
   * @param sellAmount The amount of PLQ the user is selling to the exchange
   * @return The corresponding stable token amount.
   */
  quotePlanqSell = (sellAmount: BigNumber.Value) => this.getBuyTokenAmount(sellAmount, true)

  /**
   * Returns the amount of PLQ a user would need to exchange to receive buyAmount of
   * the stable token.
   * @param buyAmount The amount of the stable token the user would like to purchase.
   * @return The corresponding PLQ amount.
   */
  quoteStableBuy = (buyAmount: BigNumber.Value) => this.getSellTokenAmount(buyAmount, false)

  /**
   * Deprecated alias of quoteStableBuy.
   * Returns the amount of PLQ a user would need to exchange to receive buyAmount of
   * the stable token.
   * @deprecated Use quoteStableBuy instead
   * @param buyAmount The amount of the stable token the user would like to purchase.
   * @return The corresponding PLQ amount.
   */
  quoteUsdBuy = this.quoteStableBuy

  /**
   * Returns the amount of the stable token a user would need to exchange to receive buyAmount of
   * PLQ.
   * @param buyAmount The amount of PLQ the user would like to purchase.
   * @return The corresponding stable token amount.
   */
  quotePlanqBuy = (buyAmount: BigNumber.Value) => this.getSellTokenAmount(buyAmount, true)

  /**
   * @dev Returns the current configuration of the exchange contract
   * @return ExchangeConfig object
   */
  async getConfig(): Promise<ExchangeConfig> {
    const res = await Promise.all([
      this.spread(),
      this.reserveFraction(),
      this.updateFrequency(),
      this.minimumReports(),
      this.lastBucketUpdate(),
    ])
    return {
      spread: res[0],
      reserveFraction: res[1],
      updateFrequency: res[2],
      minimumReports: res[3],
      lastBucketUpdate: res[4],
    }
  }

  /**
   * @dev Returns human readable configuration of the exchange contract
   * @return ExchangeConfig object
   */
  async getHumanReadableConfig() {
    const config = await this.getConfig()
    return {
      ...config,
      updateFrequency: secondsToDurationString(config.updateFrequency),
      lastBucketUpdate: unixSecondsTimestampToDateString(config.lastBucketUpdate),
    }
  }

  /**
   * Returns the exchange rate estimated at buyAmount.
   * @param buyAmount The amount of buyToken in wei to estimate the exchange rate at
   * @param sellPlanq `true` if planq is the sell token
   * @return The exchange rate (number of sellTokens received for one buyToken).
   */
  async getExchangeRate(buyAmount: BigNumber.Value, sellPlanq: boolean): Promise<BigNumber> {
    const takerAmount = await this.getBuyTokenAmount(buyAmount, sellPlanq)
    return valueToFrac(buyAmount, takerAmount) // Number of sellTokens received for one buyToken
  }

  /**
   * Returns the exchange rate for the stable token estimated at the buyAmount
   * @param buyAmount The amount of the stable token in wei to estimate the exchange rate at
   * @return The exchange rate (number of PLQ received for one stable token)
   */
  getStableExchangeRate = (buyAmount: BigNumber.Value) => this.getExchangeRate(buyAmount, false)

  /**
   * Deprecated alias of getStableExchangeRate.
   * Returns the exchange rate for the stable token estimated at the buyAmount
   * @deprecated Use getStableExchangeRate instead
   * @param buyAmount The amount of the stable token in wei to estimate the exchange rate at
   * @return The exchange rate (number of PLQ received for one stable token)
   */
  getUsdExchangeRate = this.getStableExchangeRate

  /**
   * Returns the exchange rate for PLQ estimated at the buyAmount
   * @param buyAmount The amount of PLQ in wei to estimate the exchange rate at
   * @return The exchange rate (number of stable tokens received for one PLQ)
   */
  getPlanqExchangeRate = (buyAmount: BigNumber.Value) => this.getExchangeRate(buyAmount, true)
}

export type ExchangeWrapperType = ExchangeWrapper
