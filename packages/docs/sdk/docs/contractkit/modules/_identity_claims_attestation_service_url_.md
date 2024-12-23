[@planq-network/contractkit](../README.md) › [Globals](../globals.md) › ["identity/claims/attestation-service-url"](_identity_claims_attestation_service_url_.md)

# Module: "identity/claims/attestation-service-url"

## Index

### Type aliases

* [AttestationServiceURLClaim](_identity_claims_attestation_service_url_.md#attestationservipeurlclaim)

### Variables

* [AttestationServiceURLClaimType](_identity_claims_attestation_service_url_.md#const-attestationservipeurlclaimtype)

### Functions

* [createAttestationServiceURLClaim](_identity_claims_attestation_service_url_.md#const-createattestationservipeurlclaim)
* [validateAttestationServiceUrl](_identity_claims_attestation_service_url_.md#validateattestationservipeurl)

## Type aliases

###  AttestationServiceURLClaim

Ƭ **AttestationServiceURLClaim**: *t.TypeOf‹typeof AttestationServiceURLClaimType›*

*Defined in [packages/sdk/contractkit/src/identity/claims/attestation-service-url.ts:20](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/identity/claims/attestation-service-url.ts#L20)*

## Variables

### `Const` AttestationServiceURLClaimType

• **AttestationServiceURLClaimType**: *TypeC‹object›* = t.type({
  type: t.literal(ClaimTypes.ATTESTATION_SERVICE_URL),
  timestamp: TimestampType,
  url: UrlType,
})

*Defined in [packages/sdk/contractkit/src/identity/claims/attestation-service-url.ts:14](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/identity/claims/attestation-service-url.ts#L14)*

## Functions

### `Const` createAttestationServiceURLClaim

▸ **createAttestationServiceURLClaim**(`url`: string): *[AttestationServiceURLClaim](_identity_claims_attestation_service_url_.md#attestationservipeurlclaim)*

*Defined in [packages/sdk/contractkit/src/identity/claims/attestation-service-url.ts:22](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/identity/claims/attestation-service-url.ts#L22)*

**Parameters:**

Name | Type |
------ | ------ |
`url` | string |

**Returns:** *[AttestationServiceURLClaim](_identity_claims_attestation_service_url_.md#attestationservipeurlclaim)*

___

###  validateAttestationServiceUrl

▸ **validateAttestationServiceUrl**(`kit`: [ContractKit](../classes/_kit_.contractkit.md), `claim`: [AttestationServiceURLClaim](_identity_claims_attestation_service_url_.md#attestationservipeurlclaim), `address`: Address): *Promise‹string | undefined›*

*Defined in [packages/sdk/contractkit/src/identity/claims/attestation-service-url.ts:28](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/identity/claims/attestation-service-url.ts#L28)*

**Parameters:**

Name | Type |
------ | ------ |
`kit` | [ContractKit](../classes/_kit_.contractkit.md) |
`claim` | [AttestationServiceURLClaim](_identity_claims_attestation_service_url_.md#attestationservipeurlclaim) |
`address` | Address |

**Returns:** *Promise‹string | undefined›*
