import { Address, EventLog } from '@planq-network/connect'
import BigNumber from 'bignumber.js'
import { Reserve } from '../generated/mento/Reserve'
import {
  BaseWrapper,
  fixidityValueToBigNumber,
  proxyCall,
  proxySend,
  valueToBigNumber,
} from './BaseWrapper'

export interface ReserveConfig {
  tobinTaxStalenessThreshold: BigNumber
  frozenReservePlanqStartBalance: BigNumber
  frozenReservePlanqStartDay: BigNumber
  frozenReservePlanqDays: BigNumber
  otherReserveAddresses: string[]
}

/**
 * Contract for handling reserve for stable currencies
 */
export class ReserveWrapper extends BaseWrapper<Reserve> {
  /**
   * Query Tobin tax staleness threshold parameter.
   * @returns Current Tobin tax staleness threshold.
   */
  tobinTaxStalenessThreshold = proxyCall(
    this.contract.methods.tobinTaxStalenessThreshold,
    undefined,
    valueToBigNumber
  )
  dailySpendingRatio = proxyCall(
    this.contract.methods.getDailySpendingRatio,
    undefined,
    fixidityValueToBigNumber
  )
  isSpender: (account: string) => Promise<boolean> = proxyCall(this.contract.methods.isSpender)
  transferPlanq = proxySend(this.connection, this.contract.methods.transferPlanq)
  getOrComputeTobinTax = proxySend(this.connection, this.contract.methods.getOrComputeTobinTax)
  frozenReservePlanqStartBalance = proxyCall(
    this.contract.methods.frozenReservePlanqStartBalance,
    undefined,
    valueToBigNumber
  )
  frozenReservePlanqStartDay = proxyCall(
    this.contract.methods.frozenReservePlanqStartDay,
    undefined,
    valueToBigNumber
  )
  frozenReservePlanqDays = proxyCall(
    this.contract.methods.frozenReservePlanqDays,
    undefined,
    valueToBigNumber
  )

  /**
   * @notice Returns a list of weights used for the allocation of reserve assets.
   * @return An array of a list of weights used for the allocation of reserve assets.
   */
  getAssetAllocationWeights = proxyCall(
    this.contract.methods.getAssetAllocationWeights,
    undefined,
    (weights) => weights.map(valueToBigNumber)
  )

  /**
   * @notice Returns a list of token symbols that have been allocated.
   * @return An array of token symbols that have been allocated.
   */
  getAssetAllocationSymbols = proxyCall(
    this.contract.methods.getAssetAllocationSymbols,
    undefined,
    (symbols) => symbols.map((symbol) => this.connection.hexToAscii(symbol))
  )

  /**
   * @alias {getReservePlanqBalance}
   */
  getReservePlanqBalance = proxyCall(
    this.contract.methods.getReservePlanqBalance,
    undefined,
    valueToBigNumber
  )

  /**
   * @notice Returns the amount of PLQ included in the reserve
   * @return {BigNumber} The PLQ amount included in the reserve.
   */
  getReservePlanqBalance = this.getReservePlanqBalance

  /**
   * @notice Returns the amount of unfrozen PLQ in the Reserve contract.
   * @see {getUnfrozenReservePlanqBalance}
   * @return {BigNumber} amount in wei
   */
  getUnfrozenBalance = proxyCall(
    this.contract.methods.getUnfrozenBalance,
    undefined,
    valueToBigNumber
  )

  /**
   * @notice Returns the amount of unfrozen PLQ included in the reserve
   *  contract and in other reserve addresses.
   * @see {getUnfrozenBalance}
   * @return {BigNumber} amount in wei
   */
  getUnfrozenReservePlanqBalance = proxyCall(
    this.contract.methods.getUnfrozenReservePlanqBalance,
    undefined,
    valueToBigNumber
  )

  getOtherReserveAddresses = proxyCall(this.contract.methods.getOtherReserveAddresses)

  /**
   * Returns current configuration parameters.
   */
  async getConfig(): Promise<ReserveConfig> {
    return {
      tobinTaxStalenessThreshold: await this.tobinTaxStalenessThreshold(),
      frozenReservePlanqStartBalance: await this.frozenReservePlanqStartBalance(),
      frozenReservePlanqStartDay: await this.frozenReservePlanqStartDay(),
      frozenReservePlanqDays: await this.frozenReservePlanqDays(),
      otherReserveAddresses: await this.getOtherReserveAddresses(),
    }
  }

  isOtherReserveAddress = proxyCall(this.contract.methods.isOtherReserveAddress)

  async getSpenders(): Promise<Address[]> {
    const spendersAdded = (
      await this.getPastEvents('SpenderAdded', {
        fromBlock: 0,
        toBlock: 'latest',
      })
    ).map((eventlog: EventLog) => eventlog.returnValues.spender)
    const spendersRemoved = (
      await this.getPastEvents('SpenderRemoved', {
        fromBlock: 0,
        toBlock: 'latest',
      })
    ).map((eventlog: EventLog) => eventlog.returnValues.spender)
    return spendersAdded.filter((spender) => !spendersRemoved.includes(spender))
  }
}

export type ReserveWrapperType = ReserveWrapper
