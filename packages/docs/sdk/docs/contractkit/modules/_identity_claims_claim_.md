[@planq-network/contractkit](../README.md) › [Globals](../globals.md) › ["identity/claims/claim"](_identity_claims_claim_.md)

# Module: "identity/claims/claim"

## Index

### Type aliases

* [Claim](_identity_claims_claim_.md#claim)
* [ClaimPayload](_identity_claims_claim_.md#claimpayload)
* [DomainClaim](_identity_claims_claim_.md#domainclaim)
* [KeybaseClaim](_identity_claims_claim_.md#keybaseclaim)
* [NameClaim](_identity_claims_claim_.md#nameclaim)
* [StorageClaim](_identity_claims_claim_.md#storageclaim)

### Variables

* [ClaimType](_identity_claims_claim_.md#const-claimtype)
* [DOMAIN_TXT_HEADER](_identity_claims_claim_.md#const-domain_txt_header)
* [KeybaseClaimType](_identity_claims_claim_.md#const-keybaseclaimtype)
* [SignedClaimType](_identity_claims_claim_.md#const-signedclaimtype)

### Functions

* [createDomainClaim](_identity_claims_claim_.md#const-createdomainclaim)
* [createNameClaim](_identity_claims_claim_.md#const-createnameclaim)
* [createStorageClaim](_identity_claims_claim_.md#const-createstorageclaim)
* [hashOfClaim](_identity_claims_claim_.md#hashofclaim)
* [hashOfClaims](_identity_claims_claim_.md#hashofclaims)
* [isOfType](_identity_claims_claim_.md#const-isoftype)
* [serializeClaim](_identity_claims_claim_.md#serializeclaim)
* [validateClaim](_identity_claims_claim_.md#validateclaim)

## Type aliases

###  Claim

Ƭ **Claim**: *[AttestationServiceURLClaim](_identity_claims_attestation_service_url_.md#attestationserviceurlclaim) | [DomainClaim](_identity_claims_claim_.md#domainclaim) | [KeybaseClaim](_identity_claims_claim_.md#keybaseclaim) | [NameClaim](_identity_claims_claim_.md#nameclaim) | [AccountClaim](_identity_claims_account_.md#accountclaim) | [StorageClaim](_identity_claims_claim_.md#storageclaim)*

*Defined in [packages/sdk/contractkit/src/identity/claims/claim.ts:57](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/identity/claims/claim.ts#L57)*

___

###  ClaimPayload

Ƭ **ClaimPayload**: *K extends typeof DOMAIN ? DomainClaim : K extends typeof NAME ? NameClaim : K extends typeof KEYBASE ? KeybaseClaim : K extends typeof ATTESTATION_SERVICE_URL ? AttestationServiceURLClaim : K extends typeof ACCOUNT ? AccountClaim : StorageClaim*

*Defined in [packages/sdk/contractkit/src/identity/claims/claim.ts:65](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/identity/claims/claim.ts#L65)*

___

###  DomainClaim

Ƭ **DomainClaim**: *t.TypeOf‹typeof DomainClaimType›*

*Defined in [packages/sdk/contractkit/src/identity/claims/claim.ts:54](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/identity/claims/claim.ts#L54)*

___

###  KeybaseClaim

Ƭ **KeybaseClaim**: *t.TypeOf‹typeof KeybaseClaimType›*

*Defined in [packages/sdk/contractkit/src/identity/claims/claim.ts:18](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/identity/claims/claim.ts#L18)*

___

###  NameClaim

Ƭ **NameClaim**: *t.TypeOf‹typeof NameClaimType›*

*Defined in [packages/sdk/contractkit/src/identity/claims/claim.ts:55](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/identity/claims/claim.ts#L55)*

___

###  StorageClaim

Ƭ **StorageClaim**: *t.TypeOf‹typeof StorageClaimType›*

*Defined in [packages/sdk/contractkit/src/identity/claims/claim.ts:56](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/identity/claims/claim.ts#L56)*

## Variables

### `Const` ClaimType

• **ClaimType**: *UnionC‹[TypeC‹object›, Type‹object, any, unknown›, TypeC‹object›, TypeC‹object›, TypeC‹object›, TypeC‹object›]›* = t.union([
  AttestationServiceURLClaimType,
  AccountClaimType,
  DomainClaimType,
  KeybaseClaimType,
  NameClaimType,
  StorageClaimType,
])

*Defined in [packages/sdk/contractkit/src/identity/claims/claim.ts:39](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/identity/claims/claim.ts#L39)*

___

### `Const` DOMAIN_TXT_HEADER

• **DOMAIN_TXT_HEADER**: *"planq-site-verification"* = "planq-site-verification"

*Defined in [packages/sdk/contractkit/src/identity/claims/claim.ts:53](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/identity/claims/claim.ts#L53)*

___

### `Const` KeybaseClaimType

• **KeybaseClaimType**: *TypeC‹object›* = t.type({
  type: t.literal(ClaimTypes.KEYBASE),
  timestamp: TimestampType,
  // TODO: Validate compliant username before just interpolating
  username: t.string,
})

*Defined in [packages/sdk/contractkit/src/identity/claims/claim.ts:12](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/identity/claims/claim.ts#L12)*

___

### `Const` SignedClaimType

• **SignedClaimType**: *TypeC‹object›* = t.type({
  claim: ClaimType,
  signature: SignatureType,
})

*Defined in [packages/sdk/contractkit/src/identity/claims/claim.ts:48](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/identity/claims/claim.ts#L48)*

## Functions

### `Const` createDomainClaim

▸ **createDomainClaim**(`domain`: string): *[DomainClaim](_identity_claims_claim_.md#domainclaim)*

*Defined in [packages/sdk/contractkit/src/identity/claims/claim.ts:117](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/identity/claims/claim.ts#L117)*

**Parameters:**

Name | Type |
------ | ------ |
`domain` | string |

**Returns:** *[DomainClaim](_identity_claims_claim_.md#domainclaim)*

___

### `Const` createNameClaim

▸ **createNameClaim**(`name`: string): *[NameClaim](_identity_claims_claim_.md#nameclaim)*

*Defined in [packages/sdk/contractkit/src/identity/claims/claim.ts:111](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/identity/claims/claim.ts#L111)*

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |

**Returns:** *[NameClaim](_identity_claims_claim_.md#nameclaim)*

___

### `Const` createStorageClaim

▸ **createStorageClaim**(`storageURL`: string): *[StorageClaim](_identity_claims_claim_.md#storageclaim)*

*Defined in [packages/sdk/contractkit/src/identity/claims/claim.ts:123](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/identity/claims/claim.ts#L123)*

**Parameters:**

Name | Type |
------ | ------ |
`storageURL` | string |

**Returns:** *[StorageClaim](_identity_claims_claim_.md#storageclaim)*

___

###  hashOfClaim

▸ **hashOfClaim**(`claim`: [Claim](_identity_claims_claim_.md#claim)): *string*

*Defined in [packages/sdk/contractkit/src/identity/claims/claim.ts:98](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/identity/claims/claim.ts#L98)*

**Parameters:**

Name | Type |
------ | ------ |
`claim` | [Claim](_identity_claims_claim_.md#claim) |

**Returns:** *string*

___

###  hashOfClaims

▸ **hashOfClaims**(`claims`: [Claim](_identity_claims_claim_.md#claim)[]): *string*

*Defined in [packages/sdk/contractkit/src/identity/claims/claim.ts:102](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/identity/claims/claim.ts#L102)*

**Parameters:**

Name | Type |
------ | ------ |
`claims` | [Claim](_identity_claims_claim_.md#claim)[] |

**Returns:** *string*

___

### `Const` isOfType

▸ **isOfType**<**K**>(`type`: K): *(Anonymous function)*

*Defined in [packages/sdk/contractkit/src/identity/claims/claim.ts:78](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/identity/claims/claim.ts#L78)*

**`internal`** 

**Type parameters:**

▪ **K**: *[ClaimTypes](../enums/_identity_claims_types_.claimtypes.md)*

**Parameters:**

Name | Type |
------ | ------ |
`type` | K |

**Returns:** *(Anonymous function)*

___

###  serializeClaim

▸ **serializeClaim**(`claim`: [Claim](_identity_claims_claim_.md#claim)): *string*

*Defined in [packages/sdk/contractkit/src/identity/claims/claim.ts:107](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/identity/claims/claim.ts#L107)*

**Parameters:**

Name | Type |
------ | ------ |
`claim` | [Claim](_identity_claims_claim_.md#claim) |

**Returns:** *string*

___

###  validateClaim

▸ **validateClaim**(`kit`: [ContractKit](../classes/_kit_.contractkit.md), `claim`: [Claim](_identity_claims_claim_.md#claim), `address`: string): *Promise‹undefined | string›*

*Defined in [packages/sdk/contractkit/src/identity/claims/claim.ts:88](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/identity/claims/claim.ts#L88)*

Validates a claim made by an account, i.e. whether the claim is usable

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`kit` | [ContractKit](../classes/_kit_.contractkit.md) | The ContractKit object |
`claim` | [Claim](_identity_claims_claim_.md#claim) | The claim to validate |
`address` | string | The address that is making the claim |

**Returns:** *Promise‹undefined | string›*

If valid, returns undefined. If invalid or unable to validate, returns a string with the error
