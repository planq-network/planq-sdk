import { publicKeyToAddress } from '@planq-network/utils/lib/address'
import { AddressType, PublicKeyType } from '@planq-network/utils/lib/io'
import { either, isLeft } from 'fp-ts/lib/Either'
import * as t from 'io-ts'
import { ClaimTypes, now, TimestampType } from './types'

/**
 *
 * Provide the type minus the validation that the public key and address are derived from the same private key
 */
export const AccountClaimTypeH = t.type({
  type: t.literal(ClaimTypes.ACCOUNT),
  timestamp: TimestampType,
  address: AddressType,
  // io-ts way of defining optional key-value pair
  publicKey: t.union([t.undefined, PublicKeyType]),
})

export const AccountClaimType = new t.Type<AccountClaim, any, unknown>(
  'AccountClaimType',
  AccountClaimTypeH.is,
  (unknownValue, context) =>
    either.chain(AccountClaimTypeH.validate(unknownValue, context), (claim) => {
      if (claim.publicKey === undefined) {
        return t.success(claim)
      }
      const derivedAddress = publicKeyToAddress(claim.publicKey)
      return derivedAddress === claim.address
        ? t.success(claim)
        : t.failure(claim, context, 'public key did not match the address in the claim')
    }),
  (x) => x
)

export type AccountClaim = t.TypeOf<typeof AccountClaimTypeH>

export const createAccountClaim = (address: string, publicKey?: string): AccountClaim => {
  const claim = {
    timestamp: now(),
    type: ClaimTypes.ACCOUNT,
    address,
    publicKey,
  }

  const parsedClaim = AccountClaimType.decode(claim)

  if (isLeft(parsedClaim)) {
    throw new Error(`A valid claim could not be created`)
  }

  return parsedClaim.right
}
