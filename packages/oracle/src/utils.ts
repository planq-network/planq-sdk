import { ErrorContext, MetricCollector } from './metric_collector'
import { toChecksumAddress, isValidPrivate } from '@ethereumjs/util'
import BigNumber from 'bignumber.js'
import Logger from 'bunyan'
import Web3 from 'web3'
import { min } from 'mathjs'
import { secp256k1 } from 'ethereum-cryptography/secp256k1'
import { keccak256 } from 'ethers/lib/utils'
import { STABLE_TOKEN_ADDRESS_MAPPING } from './constants'

export const MS_PER_SECOND = 1000
export const MS_PER_MINUTE = 60 * MS_PER_SECOND

const BYTES_PER_MB = 1000000

export type RequiredKeysOfType<T, KeyType> = {
  [K in keyof Required<T>]: T[K] extends KeyType ? K : never
}[keyof Required<T>]

export enum ReportStrategy {
  /**
   * The oracle has an assigned block that triggers report and expiry attempts
   */
  BLOCK_BASED = 'BLOCK_BASED',
}

export enum Exchange {
  BINANCE = 'BINANCE',
  BINANCEUS = 'BINANCEUS',
  BITTREX = 'BITTREX',
  BINGX = 'BINGX',
  COINBASE = 'COINBASE',
  OKCOIN = 'OKCOIN',
  BITSO = 'BITSO',
  NOVADAX = 'NOVADAX',
  GEMINI = 'GEMINI',
  KRAKEN = 'KRAKEN',
  KUCOIN = 'KUCOIN',
  BITSTAMP = 'BITSTAMP',
  MERCADO = 'MERCADO',
  OKX = 'OKX',
  WHITEBIT = 'WHITEBIT',
  BITGET = 'BITGET',
  BITMART = 'BITMART',
  ALPHAVANTAGE = 'ALPHAVANTAGE',
  CURRENCYAPI = 'CURRENCYAPI',
  XIGNITE = 'XIGNITE',
  COINGECKOOSMOSIS = 'COINGECKOOSMOSIS',
  COINGECKOGENERAL = 'COINGECKOGENERAL',
}

export enum ExternalCurrency {
  USD = 'USD',
  BTC = 'BTC',
  EUR = 'EUR',
  USDT = 'USDT',
  BRL = 'BRL',
  BUSD = 'BUSD',
  USDC = 'USDC',
  EUROC = 'EUROC',
  XOF = 'XOF',
  KES = 'KES',
  PLQ = 'PLQ',
}

export type Currency = ExternalCurrency

export enum OracleCurrencyPair {
  PLANQUSD = 'PLANQUSD',
  PLANQEUR = 'PLANQEUR',
  PLANQBTC = 'PLANQBTC',
  PLANQBRL = 'PLANQBRL',
  PLANQXOF = 'PLANQXOF',
  PLANQKES = 'PLANQKES',
  BTCEUR = 'BTCEUR',
  PLANQUSDT = 'PLANQUSDT',
  PLANQBUSD = 'PLANQBUSD',
  EURUSDT = 'EURUSDT',
  BTCUSD = 'BTCUSD',
  BTCUSDT = 'BTCUSDT',
  BTCBRL = 'BTCBRL',
  USDTUSD = 'USDTUSD',
  USDTUSDC = 'USDTUSDC',
  USDTEUR = 'USDTEUR',
  USDTBRL = 'USDTBRL',
  BUSDBRL = 'BUSDBRL',
  BUSDUSD = 'BUSDUSD',
  USDBRL = 'USDBRL',
  USDCUSD = 'USDCUSD',
  USDCEUR = 'USDCEUR',
  USDCBRL = 'USDCBRL',
  USDCUSDT = 'USDCUSDT',
  EURUSD = 'EURUSD',
  BTCUSDC = 'BTCUSDC',
  EUROCEUR = 'EUROCEUR',
  EUROAUSDC = 'EUROAUSDC',
  EUROAUSD = 'EUROAUSD',
  EURXOF = 'EURXOF',
  USDXOF = 'USDXOF',
  EUROCXOF = 'EUROCXOF',
  EUROAUSDT = 'EUROAUSDT',
  KESUSD = 'KESUSD',
  USDKES = 'USDKES',
}

export const CoreCurrencyPair: OracleCurrencyPair[] = [
  OracleCurrencyPair.PLANQEUR,
  OracleCurrencyPair.PLANQUSD,
  OracleCurrencyPair.PLANQBRL,
  OracleCurrencyPair.PLANQXOF,
  OracleCurrencyPair.PLANQKES,
]

export const CurrencyPairBaseQuote: Record<
  OracleCurrencyPair,
  { base: Currency; quote: Currency }
> = {
  [OracleCurrencyPair.PLANQUSD]: { base: ExternalCurrency.PLQ, quote: ExternalCurrency.USD },
  [OracleCurrencyPair.PLANQBTC]: { base: ExternalCurrency.PLQ, quote: ExternalCurrency.BTC },
  [OracleCurrencyPair.PLANQEUR]: { base: ExternalCurrency.PLQ, quote: ExternalCurrency.EUR },
  [OracleCurrencyPair.PLANQBRL]: { base: ExternalCurrency.PLQ, quote: ExternalCurrency.BRL },
  [OracleCurrencyPair.PLANQXOF]: { base: ExternalCurrency.PLQ, quote: ExternalCurrency.XOF },
  [OracleCurrencyPair.PLANQKES]: { base: ExternalCurrency.PLQ, quote: ExternalCurrency.KES },
  [OracleCurrencyPair.BTCEUR]: { base: ExternalCurrency.BTC, quote: ExternalCurrency.EUR },
  [OracleCurrencyPair.PLANQUSDT]: { base: ExternalCurrency.PLQ, quote: ExternalCurrency.USDT },
  [OracleCurrencyPair.PLANQBUSD]: { base: ExternalCurrency.PLQ, quote: ExternalCurrency.BUSD },
  [OracleCurrencyPair.EURUSDT]: { base: ExternalCurrency.EUR, quote: ExternalCurrency.USDT },
  [OracleCurrencyPair.USDTUSD]: { base: ExternalCurrency.USDT, quote: ExternalCurrency.USD },
  [OracleCurrencyPair.USDTUSDC]: { base: ExternalCurrency.USDT, quote: ExternalCurrency.USDC },
  [OracleCurrencyPair.USDTEUR]: { base: ExternalCurrency.USDT, quote: ExternalCurrency.EUR },
  [OracleCurrencyPair.BTCUSD]: { base: ExternalCurrency.BTC, quote: ExternalCurrency.USD },
  [OracleCurrencyPair.BTCBRL]: { base: ExternalCurrency.BTC, quote: ExternalCurrency.BRL },
  [OracleCurrencyPair.USDTBRL]: { base: ExternalCurrency.USDT, quote: ExternalCurrency.BRL },
  [OracleCurrencyPair.BUSDBRL]: { base: ExternalCurrency.BUSD, quote: ExternalCurrency.BRL },
  [OracleCurrencyPair.BUSDUSD]: { base: ExternalCurrency.BUSD, quote: ExternalCurrency.USD },
  [OracleCurrencyPair.USDBRL]: { base: ExternalCurrency.USD, quote: ExternalCurrency.BRL },
  [OracleCurrencyPair.USDCUSD]: { base: ExternalCurrency.USDC, quote: ExternalCurrency.USD },
  [OracleCurrencyPair.USDCEUR]: { base: ExternalCurrency.USDC, quote: ExternalCurrency.EUR },
  [OracleCurrencyPair.USDCUSDT]: { base: ExternalCurrency.USDC, quote: ExternalCurrency.USDT },
  [OracleCurrencyPair.EURUSD]: { base: ExternalCurrency.EUR, quote: ExternalCurrency.USD },
  [OracleCurrencyPair.BTCUSDT]: { base: ExternalCurrency.BTC, quote: ExternalCurrency.USDT },
  [OracleCurrencyPair.USDCBRL]: { base: ExternalCurrency.USDC, quote: ExternalCurrency.BRL },
  [OracleCurrencyPair.BTCUSDC]: { base: ExternalCurrency.BTC, quote: ExternalCurrency.USDC },
  [OracleCurrencyPair.EUROCEUR]: { base: ExternalCurrency.EUROC, quote: ExternalCurrency.EUR },
  [OracleCurrencyPair.EUROAUSDC]: { base: ExternalCurrency.EUROC, quote: ExternalCurrency.USDC },
  [OracleCurrencyPair.EUROAUSD]: { base: ExternalCurrency.EUROC, quote: ExternalCurrency.USD },
  [OracleCurrencyPair.EURXOF]: { base: ExternalCurrency.EUR, quote: ExternalCurrency.XOF },
  [OracleCurrencyPair.USDXOF]: { base: ExternalCurrency.USD, quote: ExternalCurrency.XOF },
  [OracleCurrencyPair.EUROCXOF]: { base: ExternalCurrency.EUROC, quote: ExternalCurrency.XOF },
  [OracleCurrencyPair.EUROAUSDT]: { base: ExternalCurrency.EUROC, quote: ExternalCurrency.USDT },
  [OracleCurrencyPair.KESUSD]: { base: ExternalCurrency.KES, quote: ExternalCurrency.USD },
  [OracleCurrencyPair.USDKES]: { base: ExternalCurrency.USD, quote: ExternalCurrency.KES },
}

export enum AggregationMethod {
  MIDPRICES = 'MIDPRICES',
}

export enum WalletType {
  AWS_HSM = 'AWS_HSM',
  AZURE_HSM = 'AZURE_HSM',
  NODE_ACCOUNT = 'NODE_ACCOUNT',
  PRIVATE_KEY = 'PRIVATE_KEY',
}

export function isCorePair(pair: OracleCurrencyPair) {
  return CoreCurrencyPair.includes(pair)
}

export function nonCorePairIdentifier(pair: OracleCurrencyPair) {
  return Web3.utils.toChecksumAddress(Web3.utils.keccak256(pair).slice(26))
}

/**
 * Determines what address to report to for a given CurrencyPair
 * @param pair the OracleCurrencyPair
 * @param kit an instance of contractkit
 */
export async function reportTargetForCurrencyPair(pair: OracleCurrencyPair): Promise<Address> {
  if (!isCorePair(pair)) {
    return nonCorePairIdentifier(pair)
  } else if (pair === OracleCurrencyPair.PLANQUSD) {
    return STABLE_TOKEN_ADDRESS_MAPPING['StableTokenUSD']
  } else if (pair === OracleCurrencyPair.PLANQEUR) {
    return STABLE_TOKEN_ADDRESS_MAPPING['StableTokenEUR']
  } else if (pair === OracleCurrencyPair.PLANQBRL) {
    // Workaround until StableTokenBRL makes it fully to ContractKit.
    return STABLE_TOKEN_ADDRESS_MAPPING['StableTokenBRL']
  } else if (pair === OracleCurrencyPair.PLANQXOF) {
    return STABLE_TOKEN_ADDRESS_MAPPING['StableTokenXOF']
  } else if (pair === OracleCurrencyPair.PLANQKES) {
    return STABLE_TOKEN_ADDRESS_MAPPING['StableTokenKES']
  } else {
    throw new Error(`${pair} can not be converted to a ReportTarget`)
  }
}

/**
 * Calculates the number of milliseconds until the next action (ex: reporting,
 * removing expired reports), using the current time, the frequency that action
 * should occur, and the offset for this particular oracle.
 *
 * @param frequencyMs number of milliseconds between times the action should occur
 * @param offsetMs number of milliseconds past an exact multiple of the frequency
 * @param minimumMs the minimum number of ms until the next action. If the next action
 *   is less then minimumMs away from the current time, that action is skipped and instead
 *   the ms until the subsequent action is returned. This prevents an action from being
 *   scheduled too quickly, and covers the case where two reports are unintentionally
 *   scheduled immediately after another. This can happen if msToNextAction is called
 *   too quickly before msAheadOfBase >= offsetMs but offsetMs - msAheadOfBase is very small (~1ms).
 */
export function msToNextAction(
  frequencyMs: number,
  offsetMs: number,
  minimumMs: number = 100
): number {
  /**
   * "Base" here means a precise moment when the time, as expressed as ms since
   * the unix epoch, is an exact multiple of frequencyMs.
   *
   * For example:
   *   frequencyMs = 5 minutes (5 * 60 * 1000 = 300000)
   *   Date.now() is 1587553154237
   *
   *   The most recent moment when 5 minutes divided evenly into it was
   *   1587552900000 or 272779 milliseconds ago
   *
   * The number of ms ahead of that moment is calculated via the modulo operator.
   */
  const msAheadOfBase = Date.now() % frequencyMs

  /**
   * Calculate how many milliseconds until the next moment when an action should
   * happen. This also takes care off the offset, if there is one.
   */
  let msToAction: number
  // tslint:disable-next-line: prefer-conditional-expression - this is more readable
  if (msAheadOfBase >= offsetMs) {
    msToAction = frequencyMs - msAheadOfBase + offsetMs
  } else {
    msToAction = offsetMs - msAheadOfBase
  }
  // if the number of ms to the next action is too low, skip the next action
  // and instead return the number of ms until the subsequent action
  if (msToAction < minimumMs) {
    msToAction += frequencyMs
  }
  return msToAction
}

/**
 * Converts a value in seconds to milliseconds
 * @param minutes number of minutes
 */
export function minutesToMs(minutes: number) {
  return minutes * MS_PER_MINUTE
}

/**
 * Converts a value in milliseconds to minutes
 */
export function msToMinutes(ms: number) {
  return ms / MS_PER_MINUTE
}

/**
 * Converts a value in milliseconds to seconds
 */
export function msToSeconds(ms: number) {
  return ms / MS_PER_SECOND
}

/**
 * Converts a value in seconds to milliseconds
 * @param seconds
 */
export function secondsToMs(seconds: number): number {
  return seconds * MS_PER_SECOND
}

export function megabytesToBytes(mb: number): number {
  return mb * BYTES_PER_MB
}

/**
 * Calls the function fn and calls onDuration with how long it took in milliseconds
 * for fn's Promise to resolve.
 * @param fn an asynchronous function whose duration to resolve will be kept track of
 * @param onDuration a callback that will be called with the duration in milliseconds it took for fn's Promise to resolve
 * @return the resolved value from fn
 */
export async function doWithDurationMetric<T>(
  fn: () => Promise<T>,
  onDuration: (duration: number) => void
): Promise<T> {
  const startTime = Date.now()
  const returnValue = await fn()
  const duration = Date.now() - startTime
  onDuration(duration)
  return returnValue
}

/**
 * Tries an async function multiple times with an exponential backoff between retries.
 * @param fn the function to try
 * @param maxTries the maximum number of tries, must be >= 1
 * @param maxBackoffMs the max backoff in ms between retries
 * @param onBackoff a callback for each retry backoff
 * @return a Promise that resolves with the resolved value of the call to fn
 */
export async function tryExponentialBackoff<T>(
  fn: () => Promise<T>,
  maxTries: number,
  baseBackoffMs: number,
  maxBackoffMs: number,
  onBackoff?: (e: Error, backoffMs: number) => void
): Promise<T> {
  if (maxTries < 1) {
    throw Error(`maxTries must be >= 1`)
  }
  let e: Error
  for (let i = 0; i < maxTries; i++) {
    try {
      const returnValue = await fn()
      return returnValue
    } catch (err: any) {
      if (i < maxTries - 1) {
        const backoff = min(2 ** i * baseBackoffMs, maxBackoffMs)
        await sleep(backoff, () => (onBackoff ? onBackoff(e, backoff) : undefined))
      }
      e = err
    }
  }
  throw e!
}

/**
 * Sleeps for a given number of ms
 * @param ms the number of ms to sleep for
 * @param onSleep a callback immediately after starting the sleep. Useful for manipulating timers when testing.
 * @return a Promise that resolves after the sleep is completed
 */
export function sleep(ms: number, onSleep?: () => void): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
    if (onSleep) {
      onSleep()
    }
  })
}

/**
 * Given a map of variables, throws if any are undefined.
 * @param variables a map that contains variable names and their corresponding values
 */
export function requireVariables(variables: { [variableName: string]: any }) {
  const undefinedVariableNames = []
  for (const variableName of Object.keys(variables)) {
    if (variables[variableName] === undefined) {
      undefinedVariableNames.push(variableName)
    }
  }
  if (undefinedVariableNames.length) {
    throw Error(`${undefinedVariableNames.join(', ')} not defined`)
  }
}

/**
 * Returns if a value is close to a referenceValue given a toleranceRatio
 * @param referenceValue the reference value to compare value to
 * @param value the value to compare to the reference value
 * @param toleranceRatio a multiplier to determine the tolerance of values relative to referenceValue
 * @return if value is within the range [referenceValue * (1 - toleranceRatio), referenceValue * (1 + toleranceRatio)]
 */
export function isWithinTolerance(
  referenceValue: BigNumber,
  value: BigNumber,
  toleranceRatio: BigNumber
) {
  const one = new BigNumber(1)
  const maxPercent = one.plus(toleranceRatio)
  const maxValue = referenceValue.times(maxPercent)
  const minPercent = one.minus(toleranceRatio)
  const minValue = referenceValue.times(minPercent)
  return value.isGreaterThanOrEqualTo(minValue) && value.isLessThanOrEqualTo(maxValue)
}

/**
 * Returns if a value is outside a given tolerance from a referenceValue
 * @param referenceValue the reference value to compare value to
 * @param value the value to compare to the reference value
 * @param toleranceRatio a multiplier to determine the tolerance of values relative to referenceValue
 * @return if value is outside the inclusive range [referenceValue * (1 - toleranceRatio), referenceValue * (1 + toleranceRatio)]
 */
export function isOutsideTolerance(
  referenceValue: BigNumber,
  value: BigNumber,
  toleranceRatio: BigNumber
) {
  return !isWithinTolerance(referenceValue, value, toleranceRatio)
}

export enum PromiseStatus {
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
}

export type SettledPromise =
  | {
      status: PromiseStatus.RESOLVED
      value: any
    }
  | {
      status: PromiseStatus.REJECTED
      value: Error
    }

/**
 * Waits for all promises to complete, whether resolved or rejected.
 * Doesn't throw.
 */
export function allSettled(promises: Promise<any>[]): Promise<SettledPromise[]> {
  return Promise.all(
    promises.map((promise) =>
      promise
        .then((value: any) => ({
          status: PromiseStatus.RESOLVED,
          value,
        }))
        .catch((value: Error) => ({
          status: PromiseStatus.REJECTED,
          value,
        }))
    )
  )
}

export type ErrorWrapper = {
  context: ErrorContext
  logger?: Logger
  logMsg?: string | any[]
  logObj?: object
  metricCollector?: MetricCollector
  swallowError: boolean
}

export type ErrorFnWrapper<T> = ErrorWrapper & {
  fn: () => T
}

/**
 * onError will optionally log an error and record the error metric
 */
export function onError(err: Error, errorFnWrapper: ErrorWrapper) {
  const { context, logger, logMsg, logObj, metricCollector } = errorFnWrapper
  logger?.error(
    {
      ...logObj,
      err,
      errorContext: context,
    },
    logMsg ? logMsg : 'An error occurred'
  )
  metricCollector?.error(context)
  // If we aren't swallowing the error, throw it again
  if (!errorFnWrapper.swallowError) {
    throw err
  }
}

/**
 * doWithErrorContext will perform a function and call onError if the function throws
 */
export function doFnWithErrorContext<T>(
  errorFnWrapper: { swallowError: false } & ErrorFnWrapper<T>
): T
export function doFnWithErrorContext<T>(
  errorFnWrapper: { swallowError: true } & ErrorFnWrapper<T>
): T | undefined
export function doFnWithErrorContext<T>(errorFnWrapper: ErrorFnWrapper<T>): T | undefined {
  try {
    return errorFnWrapper.fn()
  } catch (err: any) {
    onError(err, errorFnWrapper)
  }
}

/**
 * doWithErrorContext will perform an async function and call onError if it rejects.
 * If swallow is true and the async function rejected, then `undefined` is resolved.
 */
export async function doAsyncFnWithErrorContext<T>(
  errorFnWrapper: { swallowError: false } & ErrorFnWrapper<Promise<T>>
): Promise<T>
export async function doAsyncFnWithErrorContext<T>(
  errorFnWrapper: { swallowError: true } & ErrorFnWrapper<Promise<T>>
): Promise<T | undefined>
export async function doAsyncFnWithErrorContext<T>(
  errorFnWrapper: ErrorFnWrapper<Promise<T>>
): Promise<T | undefined> {
  try {
    return await errorFnWrapper.fn()
  } catch (err: any) {
    onError(err, errorFnWrapper)
  }
}
export type Address = string
export type StrongAddress = `0x${string}`

export const ensureLeading0x = (input: string): StrongAddress =>
  input.startsWith('0x') ? (input as StrongAddress) : (`0x${input}` as const)
export const hexToBuffer = (input: string) => Buffer.from(trimLeading0x(input), 'hex')
export const trimLeading0x = (input: string) => (input.startsWith('0x') ? input.slice(2) : input)
export const isValidPrivateKey = (privateKey: string) =>
  privateKey.startsWith('0x') && isValidPrivate(hexToBuffer(privateKey))
const privateToAddress = function (privateKey: Buffer): Buffer {
  return publicToAddress(privateToPublic(privateKey))
}
export const isValidAddress = (input: string): input is StrongAddress => {
  if ('string' !== typeof input) {
    return false
  }
  if (!/^(0x)?[0-9a-f]{40}$/i.test(input)) {
    return false
  }
  if (/^(0x|0X)?[0-9A-F]{40}$/.test(input.toUpperCase())) {
    return true
  }

  if (toChecksumAddress(input) === input) {
    return true
  }

  return false
}
export const pubToAddress = function (pubKey: Buffer, sanitize: boolean = false): Buffer {
  if (sanitize && pubKey.length !== 64) {
    pubKey = Buffer.from(secp256k1.ProjectivePoint.fromHex(pubKey).toRawBytes(false).slice(1))
  }
  if (pubKey.length !== 64) {
    throw new Error('Expected pubKey to be of length 64')
  }
  // Only take the lower 160bits of the hash
  return Buffer.from(keccak256(pubKey)).slice(-20)
}
export const publicToAddress = pubToAddress
export const privateToPublic = function (privateKey: Buffer): Buffer {
  // skip the type flag and use the X, Y points
  return Buffer.from(
    secp256k1.ProjectivePoint.fromPrivateKey(privateKey).toRawBytes(false).slice(1)
  )
}
export const privateKeyToAddress = (privateKey: string) =>
  toChecksumAddress(
    ensureLeading0x(privateToAddress(hexToBuffer(privateKey)).toString('hex'))
  ) as StrongAddress

export const normalizeAddressWith0x = (a: Address) =>
  ensureLeading0x(a).toLowerCase() as StrongAddress
