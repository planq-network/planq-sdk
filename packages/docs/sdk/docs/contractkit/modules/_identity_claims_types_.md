[@planq-network/contractkit](../README.md) › [Globals](../globals.md) › ["identity/claims/types"](_identity_claims_types_.md)

# Module: "identity/claims/types"

## Index

### Enumerations

* [ClaimTypes](../enums/_identity_claims_types_.claimtypes.md)

### Variables

* [SINGULAR_CLAIM_TYPES](_identity_claims_types_.md#const-singular_claim_types)
* [SignatureType](_identity_claims_types_.md#const-signaturetype)
* [TimestampType](_identity_claims_types_.md#const-timestamptype)
* [VALIDATABLE_CLAIM_TYPES](_identity_claims_types_.md#const-validatable_claim_types)
* [VERIFIABLE_CLAIM_TYPES](_identity_claims_types_.md#const-verifiable_claim_types)

### Functions

* [now](_identity_claims_types_.md#const-now)

## Variables

### `Const` SINGULAR_CLAIM_TYPES

• **SINGULAR_CLAIM_TYPES**: *[ClaimTypes](../enums/_identity_claims_types_.claimtypes.md)[]* = [ClaimTypes.NAME, ClaimTypes.ATTESTATION_SERVICE_URL]

*Defined in [packages/sdk/contractkit/src/identity/claims/types.ts:25](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/identity/claims/types.ts#L25)*

___

### `Const` SignatureType

• **SignatureType**: *StringC‹›* = t.string

*Defined in [packages/sdk/contractkit/src/identity/claims/types.ts:3](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/identity/claims/types.ts#L3)*

___

### `Const` TimestampType

• **TimestampType**: *NumberC‹›* = t.number

*Defined in [packages/sdk/contractkit/src/identity/claims/types.ts:4](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/identity/claims/types.ts#L4)*

___

### `Const` VALIDATABLE_CLAIM_TYPES

• **VALIDATABLE_CLAIM_TYPES**: *[ClaimTypes](../enums/_identity_claims_types_.claimtypes.md)[]* = [ClaimTypes.ATTESTATION_SERVICE_URL]

*Defined in [packages/sdk/contractkit/src/identity/claims/types.ts:23](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/identity/claims/types.ts#L23)*

___

### `Const` VERIFIABLE_CLAIM_TYPES

• **VERIFIABLE_CLAIM_TYPES**: *[ClaimTypes](../enums/_identity_claims_types_.claimtypes.md)[]* = [ClaimTypes.KEYBASE, ClaimTypes.ACCOUNT, ClaimTypes.DOMAIN]

*Defined in [packages/sdk/contractkit/src/identity/claims/types.ts:20](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/identity/claims/types.ts#L20)*

## Functions

### `Const` now

▸ **now**(): *number*

*Defined in [packages/sdk/contractkit/src/identity/claims/types.ts:7](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/identity/claims/types.ts#L7)*

**`internal`** 

**Returns:** *number*
