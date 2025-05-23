import { Address, trimLeading0x } from '@planq-network/base/lib/address'
import { Err, makeAsyncThrowable, Ok } from '@planq-network/base/lib/result'
import { OffchainDataWrapper } from '../../offchain-data-wrapper'
import { readEncrypted, signBuffer, writeEncrypted, writeSymmetricKeys } from '../utils'
import { OffchainError } from './errors'
import { PrivateAccessor, PublicAccessor } from './interfaces'

/**
 * Schema for writing any generic binary data
 */
export class PublicBinaryAccessor implements PublicAccessor<Buffer> {
  constructor(readonly wrapper: OffchainDataWrapper, readonly dataPath: string) {}

  async write(data: Buffer) {
    const signature = await signBuffer(this.wrapper, this.dataPath, data)
    const error = await this.wrapper.writeDataTo(
      data,
      Buffer.from(trimLeading0x(signature), 'hex'),
      this.dataPath
    )
    if (error) {
      return new OffchainError(error)
    }
  }

  async readAsResult(account: Address) {
    const rawData = await this.wrapper.readDataFromAsResult(account, this.dataPath, true)
    if (!rawData.ok) {
      return Err(new OffchainError(rawData.error))
    }

    return Ok(rawData.result)
  }

  read = makeAsyncThrowable(this.readAsResult.bind(this))
}

/**
 * Schema for writing any encrypted binary data.
 */
export class PrivateBinaryAccessor implements PrivateAccessor<Buffer> {
  constructor(readonly wrapper: OffchainDataWrapper, readonly dataPath: string) {}

  async write(data: Buffer, toAddresses: Address[], symmetricKey?: Buffer) {
    return writeEncrypted(this.wrapper, this.dataPath, data, toAddresses, symmetricKey)
  }

  async allowAccess(toAddresses: Address[], symmetricKey?: Buffer) {
    return writeSymmetricKeys(this.wrapper, this.dataPath, toAddresses, symmetricKey)
  }

  async readAsResult(account: Address) {
    return readEncrypted(this.wrapper, this.dataPath, account)
  }

  read = makeAsyncThrowable(this.readAsResult.bind(this))
}
