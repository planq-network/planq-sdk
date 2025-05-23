import {ensureLeading0x, trimLeading0x} from "@planq-network/base/lib/address";
import {
  isValidAddress,
  toChecksumAddress,
} from "@planq-network/utils/lib/address";
import {sha3} from "@planq-network/utils/lib/solidity";
import BigNumber from "bignumber.js";
import {encode} from "utf8";
import {
  Block,
  BlockHeader,
  BlockNumber,
  PlanqTx,
  PlanqTxPending,
  PlanqTxReceipt,
  Log,
} from "../types";

/**
 * Formats the input of a transaction and converts all values to HEX
 */
export function inputPlanqTxFormatter(tx: PlanqTx) {
  tx.from = inputAddressFormatter(tx.from?.toString());
  tx.to = inputAddressFormatter(tx.to);

  if (tx.data) {
    tx.data = ensureLeading0x(tx.data);
  }

  if (tx.data && !isHex(tx.data)) {
    throw new Error("The data field must be HEX encoded data.");
  }

  tx.gas = numberToHex(tx.gas);
  tx.gasPrice = numberToHex(tx.gasPrice?.toString());
  tx.value = numberToHex(tx.value?.toString());
  // @ts-ignore - nonce is defined as number, but uses as string (web3)
  tx.nonce = numberToHex(tx.nonce?.toString());

  // @ts-ignore - prune undefines
  Object.keys(tx).forEach((key) => tx[key] === undefined && delete tx[key]);

  return tx;
}

export function outputPlanqTxFormatter(tx: any): PlanqTxPending {
  if (tx.blockNumber !== null) {
    tx.blockNumber = hexToNumber(tx.blockNumber);
  }
  if (tx.transactionIndex !== null) {
    tx.transactionIndex = hexToNumber(tx.transactionIndex);
  }
  tx.nonce = hexToNumber(tx.nonce);
  tx.gas = hexToNumber(tx.gas);
  tx.gasPrice = outputBigNumberFormatter(tx.gasPrice);
  tx.value = outputBigNumberFormatter(tx.value);

  tx.to =
    tx.to && isValidAddress(tx.to)
      ? // tx.to could be `0x0` or `null` while contract creation
        (tx.to = toChecksumAddress(tx.to))
      : null; // set to `null` if invalid address

  if (tx.from) {
    tx.from = toChecksumAddress(tx.from);
  }

  return tx as PlanqTxPending;
}

export function outputPlanqTxReceiptFormatter(receipt: any): PlanqTxReceipt {
  if (typeof receipt !== "object") {
    throw new Error("Received receipt is invalid: " + receipt);
  }

  if (receipt.blockNumber !== null) {
    receipt.blockNumber = hexToNumber(receipt.blockNumber);
  }
  if (receipt.transactionIndex !== null) {
    receipt.transactionIndex = hexToNumber(receipt.transactionIndex);
  }
  receipt.cumulativeGasUsed = hexToNumber(receipt.cumulativeGasUsed);
  receipt.gasUsed = hexToNumber(receipt.gasUsed);

  if (Array.isArray(receipt.logs)) {
    receipt.logs = receipt.logs.map(outputLogFormatter);
  }

  if (receipt.contractAddress) {
    receipt.contractAddress = toChecksumAddress(receipt.contractAddress);
  }

  if (typeof receipt.status !== "undefined" && receipt.status !== null) {
    receipt.status = Boolean(parseInt(trimLeading0x(receipt.status), 10));
  }

  return receipt as PlanqTxReceipt;
}

export function inputDefaultBlockNumberFormatter(
  blockNumber: BlockNumber | null | undefined
) {
  if (blockNumber == null) {
    blockNumber = "latest";
  }

  return inputBlockNumberFormatter(blockNumber);
}

export function inputBlockNumberFormatter(blockNumber: BlockNumber) {
  if (blockNumber == null) {
    return undefined;
  }

  if (isPredefinedBlockNumber(blockNumber)) {
    return blockNumber;
  }

  if (blockNumber === "genesis") {
    return "0x0";
  }

  return isHexStrict(blockNumber.toString())
    ? blockNumber.toString().toLocaleLowerCase()
    : numberToHex(blockNumber.toString())!;
}

export function outputBlockHeaderFormatter(blockHeader: any): BlockHeader {
  // transform to number
  blockHeader.gasLimit = hexToNumber(blockHeader.gasLimit);
  blockHeader.gasUsed = hexToNumber(blockHeader.gasUsed);
  blockHeader.size = hexToNumber(blockHeader.size);
  blockHeader.timestamp = hexToNumber(blockHeader.timestamp);
  if (blockHeader.number !== null) {
    blockHeader.number = hexToNumber(blockHeader.number);
  }
  if (blockHeader.miner) {
    blockHeader.miner = toChecksumAddress(blockHeader.miner);
  }
  return blockHeader as BlockHeader;
}

export function outputBlockFormatter(block: any): Block {
  block = outputBlockHeaderFormatter(block);

  if (block.difficulty) {
    block.difficulty = outputBigNumberFormatter(block.difficulty);
  }
  if (block.totalDifficulty) {
    block.totalDifficulty = outputBigNumberFormatter(block.totalDifficulty);
  }

  if (Array.isArray(block.transactions)) {
    block.transactions.forEach((item: any) => {
      if (typeof item !== "string" && !(item instanceof String)) {
        return outputPlanqTxFormatter(item);
      }
    });
  }

  return block as Block;
}

export function hexToNumber(hex?: string): number | undefined {
  if (hex) {
    return new BigNumber(hex).toNumber();
  }
  return undefined;
}

export function outputLogFormatter(log: any): Log {
  // generate a custom log id
  if (
    typeof log.blockHash === "string" &&
    typeof log.transactionHash === "string" &&
    typeof log.logIndex === "string"
  ) {
    const shaId = sha3(
      trimLeading0x(log.blockHash) +
        trimLeading0x(log.transactionHash) +
        trimLeading0x(log.logIndex)
    )!;
    log.id = "log_" + trimLeading0x(shaId).substring(0, 8);
  } else if (!log.id) {
    log.id = null;
  }

  if (log.blockNumber !== null) {
    log.blockNumber = hexToNumber(log.blockNumber);
  }
  if (log.transactionIndex !== null) {
    log.transactionIndex = hexToNumber(log.transactionIndex);
  }
  if (log.logIndex !== null) {
    log.logIndex = hexToNumber(log.logIndex);
  }

  if (log.address) {
    log.address = toChecksumAddress(log.address);
  }

  return log as Log;
}

export function outputBigNumberFormatter(hex: string): string {
  return new BigNumber(hex).toString(10);
}

export function inputAddressFormatter(address?: string): string | undefined {
  if (!address || address === "0x") {
    return undefined;
  }
  if (isValidAddress(address)) {
    return ensureLeading0x(address).toLocaleLowerCase();
  }
  throw new Error(
    `Provided address ${address} is invalid, the capitalization checksum test failed`
  );
}

export function inputSignFormatter(data: string) {
  return isHexStrict(data) ? data : utf8ToHex(data);
}

function utf8ToHex(str: string): string {
  str = encode(str);
  let hex = "";

  // remove \u0000 padding from either side
  str = str.replace(/^(?:\u0000)*/, "");
  str = str.split("").reverse().join("");
  str = str.replace(/^(?:\u0000)*/, "");
  str = str.split("").reverse().join("");

  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    // if (code !== 0) {
    const n = code.toString(16);
    hex += n.length < 2 ? "0" + n : n;
    // }
  }

  return ensureLeading0x(hex);
}

function isHex(hex: string): boolean {
  return /^(-0x|0x)?[0-9a-f]*$/i.test(hex);
}

function isHexStrict(hex: string): boolean {
  return /^(-)?0x[0-9a-f]*$/i.test(hex);
}

function numberToHex(value?: BigNumber.Value) {
  if (value) {
    const numberValue = new BigNumber(value);
    const result = ensureLeading0x(new BigNumber(value).toString(16));
    // Seen in web3, copied just in case
    return numberValue.lt(new BigNumber(0)) ? `-${result}` : result;
  }
  return undefined;
}

function isPredefinedBlockNumber(blockNumber: BlockNumber) {
  return (
    blockNumber === "latest" ||
    blockNumber === "pending" ||
    blockNumber === "earliest"
  );
}
