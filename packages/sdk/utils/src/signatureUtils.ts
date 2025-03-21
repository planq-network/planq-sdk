import { NativeSigner, serializeSignature, Signature, Signer } from '@planq-network/base/lib/signatureUtils'
import {
  bufferToHex,
  ecrecover,
  ecsign,
  fromRpcSig,
  privateToPublic,
  pubToAddress,
  toBuffer,
} from '@ethereumjs/util'
import { isHexStrict, soliditySha3 } from 'web3-utils'
import { ensureLeading0x, eqAddress, privateKeyToAddress, trimLeading0x } from './address'
import { EIP712TypedData, generateTypedDataHash } from './sign-typed-data-utils'

// Exports moved to @planq-network/base, forwarding them
// here for backwards compatibility
export {
  NativeSigner,
  POP_SIZE,
  serializeSignature,
  Signature,
  Signer,
} from '@planq-network/base/lib/signatureUtils'

// If messages is a hex, the length of it should be the number of bytes
function messageLength(message: string) {
  if (isHexStrict(message)) {
    return (message.length - 2) / 2
  }
  return message.length
}
// Ethereum has a special signature format that requires a prefix
// https://github.com/ethereum/wiki/wiki/JSON-RPC#eth_sign
export function hashMessageWithPrefix(message: string): string {
  const prefix = '\x19Ethereum Signed Message:\n' + messageLength(message)
  return soliditySha3(prefix, message)!
}

export function hashMessage(message: string): string {
  return soliditySha3({ type: 'string', value: message })!
}

export async function addressToPublicKey(
  signer: string,
  signFn: (message: string, signer: string) => Promise<string>
) {
  const msg = Buffer.from('dummy_msg_data')
  const data = '0x' + msg.toString('hex')
  // Note: Eth.sign typing displays incorrect parameter order
  const sig = await signFn(data, signer)

  const rawsig = fromRpcSig(sig)
  const prefixedMsg = hashMessageWithPrefix(data)
  const pubKey = ecrecover(Buffer.from(prefixedMsg.slice(2), 'hex'), rawsig.v, rawsig.r, rawsig.s)

  const computedAddr = pubToAddress(pubKey).toString('hex')
  if (!eqAddress(computedAddr, signer)) {
    throw new Error('computed address !== signer')
  }

  return '0x' + pubKey.toString('hex')
}

export function LocalSigner(privateKey: string): Signer {
  return {
    sign: async (message: string) =>
      Promise.resolve(
        serializeSignature(signMessage(message, privateKey, privateKeyToAddress(privateKey)))
      ),
  }
}

export function signedMessageToPublicKey(message: string, v: number, r: string, s: string) {
  const pubKeyBuf = ecrecover(
    Buffer.from(message.slice(2), 'hex'),
    BigInt(v),
    Buffer.from(r.slice(2), 'hex'),
    Buffer.from(s.slice(2), 'hex')
  )
  return '0x' + pubKeyBuf.toString('hex')
}

export function signMessage(message: string, privateKey: string, address: string) {
  return signMessageWithoutPrefix(
    hashMessageWithPrefix(message),
    ensureLeading0x(privateKey),
    address
  )
}

export function signMessageWithoutPrefix(messageHash: string, privateKey: string, address: string) {
  const publicKey = privateToPublic(toBuffer(privateKey))
  const derivedAddress: string = bufferToHex(pubToAddress(publicKey))
  if (derivedAddress.toLowerCase() !== address.toLowerCase()) {
    throw new Error('Provided private key does not match address of intended signer')
  }
  const { r, s, v } = ecsign(toBuffer(messageHash), toBuffer(privateKey))
  if (!isValidSignature(address, messageHash, Number(v), bufferToHex(r), bufferToHex(s))) {
    throw new Error('Unable to validate signature')
  }
  return { v: Number(v), r: bufferToHex(r), s: bufferToHex(s) }
}

export function verifySignature(message: string, signature: string, signer: string) {
  try {
    parseSignature(message, signature, signer)
    return true
  } catch (error) {
    return false
  }
}

export function parseSignature(message: string, signature: string, signer: string) {
  return parseSignatureWithoutPrefix(hashMessageWithPrefix(message), signature, signer)
}

export function parseSignatureWithoutPrefix(
  messageHash: string,
  signature: string,
  signer: string
) {
  let { r, s, v } = parseSignatureAsRsv(signature.slice(2))
  if (isValidSignature(signer, messageHash, v, r, s)) {
    return { v, r, s }
  }

  ;({ r, s, v } = parseSignatureAsVrs(signature.slice(2)))
  if (isValidSignature(signer, messageHash, v, r, s)) {
    return { v, r, s }
  }

  throw new Error(`Unable to parse signature (expected signer ${signer})`)
}

function recoverEIP712TypedDataSigner(
  typedData: EIP712TypedData,
  signature: string,
  parseFunction: (signature: string) => Signature
): string {
  const dataBuff = generateTypedDataHash(typedData)
  const { r, s, v } = parseFunction(trimLeading0x(signature))
  const publicKey = ecrecover(toBuffer(dataBuff), BigInt(v), toBuffer(r), toBuffer(s))
  // TODO test error handling on this
  return bufferToHex(pubToAddress(publicKey))
}

/**
 * Recover signer from RSV-serialized signature over signed typed data.
 * @param typedData EIP712 typed data
 * @param signature RSV signature of signed type data by signer
 * @returns string signer, or throws error if parsing fails
 */
export function recoverEIP712TypedDataSignerRsv(
  typedData: EIP712TypedData,
  signature: string
): string {
  return recoverEIP712TypedDataSigner(typedData, signature, parseSignatureAsRsv)
}

/**
 * Recover signer from VRS-serialized signature over signed typed data.
 * @param typedData EIP712 typed data
 * @param signature VRS signature of signed type data by signer
 * @returns string signer, or throws error if parsing fails
 */
export function recoverEIP712TypedDataSignerVrs(
  typedData: EIP712TypedData,
  signature: string
): string {
  return recoverEIP712TypedDataSigner(typedData, signature, parseSignatureAsVrs)
}

/**
 * @param typedData EIP712 typed data
 * @param signature VRS or SRV signature of `typedData` by `signer`
 * @param signer address to verify signed the `typedData`
 * @returns boolean, true if `signer` is a possible signer of `signature`
 */
export function verifyEIP712TypedDataSigner(
  typedData: EIP712TypedData,
  signature: string,
  signer: string
) {
  for (const recover of [recoverEIP712TypedDataSignerVrs, recoverEIP712TypedDataSignerRsv]) {
    try {
      if (eqAddress(recover(typedData, signature), signer)) {
        return true
      }
    } catch (e) {
      // try both serialization formats before failing to verify
    }
  }
  return false
}

export function guessSigner(message: string, signature: string): string {
  const messageHash = hashMessageWithPrefix(message)
  const { r, s, v } = parseSignatureAsRsv(signature.slice(2))
  const publicKey = ecrecover(toBuffer(messageHash), BigInt(v), toBuffer(r), toBuffer(s))
  return bufferToHex(pubToAddress(publicKey))
}

function parseSignatureAsVrs(signature: string) {
  let v: number = parseInt(signature.slice(0, 2), 16)
  const r: string = `0x${signature.slice(2, 66)}`
  const s: string = `0x${signature.slice(66, 130)}`
  if (v < 27) {
    v += 27
  }
  return { v, r, s }
}

function parseSignatureAsRsv(signature: string) {
  const r: string = `0x${signature.slice(0, 64)}`
  const s: string = `0x${signature.slice(64, 128)}`
  let v: number = parseInt(signature.slice(128, 130), 16)
  if (v < 27) {
    v += 27
  }
  return { r, s, v }
}

function isValidSignature(signer: string, message: string, v: number, r: string, s: string) {
  try {
    const publicKey = ecrecover(toBuffer(message), BigInt(v), toBuffer(r), toBuffer(s))

    const retrievedAddress: string = bufferToHex(pubToAddress(publicKey))

    return eqAddress(retrievedAddress, signer)
  } catch (err) {
    return false
  }
}

export const SignatureUtils = {
  NativeSigner,
  LocalSigner,
  signMessage,
  signMessageWithoutPrefix,
  parseSignature,
  parseSignatureWithoutPrefix,
  serializeSignature,
  recoverEIP712TypedDataSignerRsv,
  recoverEIP712TypedDataSignerVrs,
  verifyEIP712TypedDataSigner,
}
