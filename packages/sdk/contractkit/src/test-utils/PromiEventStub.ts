import { PlanqTxReceipt, PromiEvent } from '@planq-network/connect'
import { EventEmitter } from 'events'

interface PromiEventStub<T> extends PromiEvent<T> {
  emitter: EventEmitter
  resolveHash(hash: string): void
  resolveReceipt(receipt: PlanqTxReceipt): void
  rejectHash(error: any): void
  rejectReceipt(receipt: PlanqTxReceipt, error: any): void
}
export function promiEventSpy<T>(): PromiEventStub<T> {
  const ee = new EventEmitter()
  const pe: PromiEventStub<T> = {
    finally: () => {
      throw new Error('not implemented')
    },
    catch: () => {
      throw new Error('not implemented')
    },
    then: () => {
      throw new Error('not implemented')
    },
    on: ((event: string, listener: (...args: any[]) => void) => ee.on(event, listener)) as any,
    once: ((event: string, listener: (...args: any[]) => void) => ee.once(event, listener)) as any,
    [Symbol.toStringTag]: 'Not Implemented',
    emitter: ee,
    resolveHash: (hash: string) => {
      ee.emit('transactionHash', hash)
    },
    resolveReceipt: (receipt: PlanqTxReceipt) => {
      ee.emit('receipt', receipt)
    },
    rejectHash: (error: any) => {
      ee.emit('error', error, false)
    },
    rejectReceipt: (receipt: PlanqTxReceipt, error: any) => {
      ee.emit('error', error, receipt)
    },
  }
  return pe
}
