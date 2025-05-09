[@planq-network/contractkit](../README.md) › [Globals](../globals.md) › ["identity/claims/verify"](_identity_claims_verify_.md)

# Module: "identity/claims/verify"

## Index

### Functions

* [verifyAccountClaim](_identity_claims_verify_.md#const-verifyaccountclaim)
* [verifyClaim](_identity_claims_verify_.md#verifyclaim)
* [verifyDomainRecord](_identity_claims_verify_.md#const-verifydomainrecord)

## Functions

### `Const` verifyAccountClaim

▸ **verifyAccountClaim**(`kit`: [ContractKit](../classes/_kit_.contractkit.md), `claim`: [AccountClaim](_identity_claims_account_.md#accountclaim), `address`: string, `tries`: number): *Promise‹undefined | string›*

*Defined in [packages/sdk/contractkit/src/identity/claims/verify.ts:33](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/identity/claims/verify.ts#L33)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`kit` | [ContractKit](../classes/_kit_.contractkit.md) | - |
`claim` | [AccountClaim](_identity_claims_account_.md#accountclaim) | - |
`address` | string | - |
`tries` | number | 3 |

**Returns:** *Promise‹undefined | string›*

___

###  verifyClaim

▸ **verifyClaim**(`kit`: [ContractKit](../classes/_kit_.contractkit.md), `claim`: [Claim](_identity_claims_claim_.md#claim), `address`: string, `tries`: number): *Promise‹undefined | string›*

*Defined in [packages/sdk/contractkit/src/identity/claims/verify.ts:19](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/identity/claims/verify.ts#L19)*

Verifies a claim made by an account, i.e. whether a claim can be verified to be correct

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`kit` | [ContractKit](../classes/_kit_.contractkit.md) | - | ContractKit object |
`claim` | [Claim](_identity_claims_claim_.md#claim) | - | The claim to verify |
`address` | string | - | The address that is making the claim |
`tries` | number | 3 | - |

**Returns:** *Promise‹undefined | string›*

If valid, returns undefined. If invalid or unable to verify, returns a string with the error

___

### `Const` verifyDomainRecord

▸ **verifyDomainRecord**(`kit`: [ContractKit](../classes/_kit_.contractkit.md), `claim`: [DomainClaim](_identity_claims_claim_.md#domainclaim), `address`: string, `dnsResolver`: dnsResolverFunction): *Promise‹undefined | string›*

*Defined in [packages/sdk/contractkit/src/identity/claims/verify.ts:76](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/identity/claims/verify.ts#L76)*

It verifies if a DNS domain includes in the TXT records an entry with name
`planq-site-verification` and a valid signature in base64

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`kit` | [ContractKit](../classes/_kit_.contractkit.md) | - |
`claim` | [DomainClaim](_identity_claims_claim_.md#domainclaim) | - |
`address` | string | - |
`dnsResolver` | dnsResolverFunction | resolveTxt as any |

**Returns:** *Promise‹undefined | string›*
