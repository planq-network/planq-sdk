import {
  PromiEvent,
  Transaction,
  TransactionConfig,
  TransactionReceipt,
} from "web3-core";
import {Contract} from "web3-eth-contract";

export type Address = string;

export interface PlanqParams {
  feeCurrency: string;
  gatewayFeeRecipient: string;
  gatewayFee: string;
}

export type PlanqTx = TransactionConfig; // & Partial<PlanqParams>

export interface PlanqTxObject<T> {
  arguments: any[];
  call(tx?: PlanqTx): Promise<T>;
  send(tx?: PlanqTx): PromiEvent<PlanqTxReceipt>;
  estimateGas(tx?: PlanqTx): Promise<number>;
  encodeABI(): string;
  _parent: Contract;
}

export {BlockNumber, EventLog, Log, PromiEvent, Sign} from "web3-core";
export {Block, BlockHeader, Syncing} from "web3-eth";
export {
  Contract,
  ContractSendMethod,
  PastEventOptions,
} from "web3-eth-contract";

export interface EncodedTransaction {
  raw: string;
  tx: {
    nonce: string;
    gasPrice: string;
    gas: string;
    to: string;
    value: string;
    input: string;
    r: string;
    s: string;
    v: string;
    hash: string;
  };
}

export type PlanqTxPending = Transaction; // & Partial<PlanqParams>
export type PlanqTxReceipt = TransactionReceipt; // & Partial<PlanqParams>

export type Callback<T> = (error: Error | null, result?: T) => void;

export interface JsonRpcResponse {
  jsonrpc: string;
  id: string | number;
  result?: any;
  error?: {
    readonly code?: number;
    readonly data?: unknown;
    readonly message: string;
  };
}

export interface JsonRpcPayload {
  jsonrpc: string;
  method: string;
  params: any[];
  id?: string | number;
}

export interface Provider {
  send(
    payload: JsonRpcPayload,
    callback: (error: Error | null, result?: JsonRpcResponse) => void
  ): void;
}

export interface Error {
  readonly code?: number;
  readonly data?: unknown;
  readonly message: string;
}

export interface HttpProvider {
  send(
    payload: JsonRpcPayload,
    callback: (error: Error | null, result?: JsonRpcResponse) => void
  ): void;
}

export interface RLPEncodedTx {
  transaction: PlanqTx;
  rlpEncode: string;
}
