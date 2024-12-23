import { Connection } from '../connection'
import { PlanqTx, PlanqTxObject, PlanqTxReceipt } from '../types'
import { TransactionResult } from './tx-result'

export type PlanqTransactionParams = Omit<PlanqTx, 'data'>

export function toTransactionObject<O>(
  connection: Connection,
  txo: PlanqTxObject<O>,
  defaultParams?: PlanqTransactionParams
): PlanqTransactionObject<O> {
  return new PlanqTransactionObject(connection, txo, defaultParams)
}

export class PlanqTransactionObject<O> {
  constructor(
    private connection: Connection,
    readonly txo: PlanqTxObject<O>,
    readonly defaultParams?: PlanqTransactionParams
  ) {}

  /** send the transaction to the chain */
  send = (params?: PlanqTransactionParams): Promise<TransactionResult> => {
    return this.connection.sendTransactionObject(this.txo, { ...this.defaultParams, ...params })
  }

  /** send the transaction and waits for the receipt */
  sendAndWaitForReceipt = (params?: PlanqTransactionParams): Promise<PlanqTxReceipt> =>
    this.send(params).then((result) => result.waitReceipt())
}
