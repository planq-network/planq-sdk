import { Address } from '@planq-network/base'
import { EIP712TypedData } from './sign-typed-data-utils'

export const authorizeSigner = ({
  account,
  signer,
  chainId,
  role,
  accountsContractAddress,
}: {
  chainId: number
  signer: string
  account: string
  role: string
  accountsContractAddress: string
}): EIP712TypedData => ({
  types: {
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ],
    AuthorizeSigner: [
      { name: 'account', type: 'address' },
      { name: 'signer', type: 'address' },
      { name: 'role', type: 'bytes32' },
    ],
  },
  primaryType: 'AuthorizeSigner',
  domain: {
    name: 'Planq Core Contracts',
    version: '1.0',
    chainId,
    verifyingContract: accountsContractAddress,
  },
  message: {
    account,
    signer,
    role,
  },
})

interface AttestationDetails {
  identifier: string
  issuer: string
  account: string
  signer: string
  issuedOn: number
}

export const registerAttestation = (
  chainId: number,
  contractAddress: Address,
  message?: AttestationDetails
) => {
  return {
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ],
      OwnershipAttestation: [
        { name: 'identifier', type: 'bytes32' },
        { name: 'issuer', type: 'address' },
        { name: 'account', type: 'address' },
        { name: 'signer', type: 'address' },
        { name: 'issuedOn', type: 'uint64' },
      ],
    },
    primaryType: 'OwnershipAttestation',
    domain: {
      name: 'FederatedAttestations',
      version: '1.0',
      chainId,
      verifyingContract: contractAddress,
    },
    message: message ? message : {},
  }
}
