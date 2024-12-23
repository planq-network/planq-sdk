[@planq-network/contractkit](../README.md) › [Globals](../globals.md) › ["planq-tokens"](../modules/_planq_tokens_.md) › [PlanqTokens](_planq_tokens_.planqtokens.md)

# Class: PlanqTokens

A helper class to interact with all Planq tokens, ie PLQ and stable tokens

## Hierarchy

* **PlanqTokens**

## Index

### Constructors

* [constructor](_planq_tokens_.planqtokens.md#constructor)

### Properties

* [contracts](_planq_tokens_.planqtokens.md#readonly-contracts)
* [isStableTokenContract](_planq_tokens_.planqtokens.md#isstabletokencontract)
* [registry](_planq_tokens_.planqtokens.md#readonly-registry)

### Methods

* [balancesOf](_planq_tokens_.planqtokens.md#balancesof)
* [forEachPlanqToken](_planq_tokens_.planqtokens.md#foreachplanqtoken)
* [forStablePlanqToken](_planq_tokens_.planqtokens.md#forstableplanqtoken)
* [getAddress](_planq_tokens_.planqtokens.md#getaddress)
* [getAddresses](_planq_tokens_.planqtokens.md#getaddresses)
* [getContract](_planq_tokens_.planqtokens.md#getcontract)
* [getExchangeContract](_planq_tokens_.planqtokens.md#getexchangecontract)
* [getExchangesConfigs](_planq_tokens_.planqtokens.md#getexchangesconfigs)
* [getFeeCurrencyAddress](_planq_tokens_.planqtokens.md#getfeecurrencyaddress)
* [getStablesConfigs](_planq_tokens_.planqtokens.md#getstablesconfigs)
* [getWrapper](_planq_tokens_.planqtokens.md#getwrapper)
* [getWrappers](_planq_tokens_.planqtokens.md#getwrappers)
* [isStableToken](_planq_tokens_.planqtokens.md#isstabletoken)
* [validPlanqTokenInfos](_planq_tokens_.planqtokens.md#validplanqtokeninfos)
* [validStableTokenInfos](_planq_tokens_.planqtokens.md#validstabletokeninfos)

## Constructors

###  constructor

\+ **new PlanqTokens**(`contracts`: [ContractCacheType](../interfaces/_basic_contract_cache_type_.contractcachetype.md), `registry`: [AddressRegistry](_address_registry_.addressregistry.md)): *[PlanqTokens](_planq_tokens_.planqtokens.md)*

*Defined in [packages/sdk/contractkit/src/planq-tokens.ts:61](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/planq-tokens.ts#L61)*

**Parameters:**

Name | Type |
------ | ------ |
`contracts` | [ContractCacheType](../interfaces/_basic_contract_cache_type_.contractcachetype.md) |
`registry` | [AddressRegistry](_address_registry_.addressregistry.md) |

**Returns:** *[PlanqTokens](_planq_tokens_.planqtokens.md)*

## Properties

### `Readonly` contracts

• **contracts**: *[ContractCacheType](../interfaces/_basic_contract_cache_type_.contractcachetype.md)*

*Defined in [packages/sdk/contractkit/src/planq-tokens.ts:62](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/planq-tokens.ts#L62)*

___

###  isStableTokenContract

• **isStableTokenContract**: *[isStableTokenContract](../modules/_planq_tokens_.md#isstabletokencontract)* = isStableTokenContract

*Defined in [packages/sdk/contractkit/src/planq-tokens.ts:272](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/planq-tokens.ts#L272)*

___

### `Readonly` registry

• **registry**: *[AddressRegistry](_address_registry_.addressregistry.md)*

*Defined in [packages/sdk/contractkit/src/planq-tokens.ts:62](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/planq-tokens.ts#L62)*

## Methods

###  balancesOf

▸ **balancesOf**(`address`: string): *Promise‹[EachPlanqToken](../modules/_planq_tokens_.md#eachplanqtoken)‹BigNumber››*

*Defined in [packages/sdk/contractkit/src/planq-tokens.ts:70](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/planq-tokens.ts#L70)*

Gets an address's balance for each planq token.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`address` | string | the address to look up the balances for |

**Returns:** *Promise‹[EachPlanqToken](../modules/_planq_tokens_.md#eachplanqtoken)‹BigNumber››*

a promise resolving to an object containing the address's balance
 for each planq token

___

###  forEachPlanqToken

▸ **forEachPlanqToken**<**T**>(`fn`: function): *Promise‹[EachPlanqToken](../modules/_planq_tokens_.md#eachplanqtoken)‹T››*

*Defined in [packages/sdk/contractkit/src/planq-tokens.ts:120](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/planq-tokens.ts#L120)*

Runs fn for each planq token found in planqTokenInfos, and returns the
value of each call in an object keyed by the token.

**Type parameters:**

▪ **T**

**Parameters:**

▪ **fn**: *function*

the function to be called for each PlanqTokenInfo.

▸ (`info`: [PlanqTokenInfo](../interfaces/_planq_tokens_.planqtokeninfo.md)): *T | Promise‹T›*

**Parameters:**

Name | Type |
------ | ------ |
`info` | [PlanqTokenInfo](../interfaces/_planq_tokens_.planqtokeninfo.md) |

**Returns:** *Promise‹[EachPlanqToken](../modules/_planq_tokens_.md#eachplanqtoken)‹T››*

an object containing the resolved value the call to fn for each
 planq token.

___

###  forStablePlanqToken

▸ **forStablePlanqToken**<**T**>(`fn`: function): *Promise‹[EachPlanqToken](../modules/_planq_tokens_.md#eachplanqtoken)‹T››*

*Defined in [packages/sdk/contractkit/src/planq-tokens.ts:143](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/planq-tokens.ts#L143)*

Runs fn for each stable token found in stableTokenInfos, and returns the
value of each call in an object keyed by the token.

**Type parameters:**

▪ **T**

**Parameters:**

▪ **fn**: *function*

the function to be called for each StableTokenInfo.

▸ (`info`: [StableTokenInfo](../interfaces/_planq_tokens_.stabletokeninfo.md)): *T | Promise‹T›*

**Parameters:**

Name | Type |
------ | ------ |
`info` | [StableTokenInfo](../interfaces/_planq_tokens_.stabletokeninfo.md) |

**Returns:** *Promise‹[EachPlanqToken](../modules/_planq_tokens_.md#eachplanqtoken)‹T››*

an object containing the resolved value the call to fn for each
 planq token.

___

###  getAddress

▸ **getAddress**(`token`: [PlanqTokenType](../modules/_planq_tokens_.md#planqtokentype)): *Promise‹string›*

*Defined in [packages/sdk/contractkit/src/planq-tokens.ts:247](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/planq-tokens.ts#L247)*

Gets the address of the contract for the provided token.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`token` | [PlanqTokenType](../modules/_planq_tokens_.md#planqtokentype) | the token to get the (proxy) contract address for |

**Returns:** *Promise‹string›*

A promise resolving to the address of the token's contract

___

###  getAddresses

▸ **getAddresses**(): *Promise‹[EachPlanqToken](../modules/_planq_tokens_.md#eachplanqtoken)‹string››*

*Defined in [packages/sdk/contractkit/src/planq-tokens.ts:89](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/planq-tokens.ts#L89)*

Gets the address for each planq token proxy contract.

**Returns:** *Promise‹[EachPlanqToken](../modules/_planq_tokens_.md#eachplanqtoken)‹string››*

an promise resolving to an object containing the address for each planq token proxy.

___

###  getContract

▸ **getContract**(`token`: [StableToken](../modules/_planq_tokens_.md#stabletoken)): *[StableTokenContract](../modules/_base_.md#stabletokencontract)*

*Defined in [packages/sdk/contractkit/src/planq-tokens.ts:228](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/planq-tokens.ts#L228)*

Gets the contract for the provided token

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`token` | [StableToken](../modules/_planq_tokens_.md#stabletoken) | the token to get the contract of |

**Returns:** *[StableTokenContract](../modules/_base_.md#stabletokencontract)*

The contract for the token

___

###  getExchangeContract

▸ **getExchangeContract**(`token`: [StableToken](../modules/_planq_tokens_.md#stabletoken)): *[ExchangeContract](../modules/_base_.md#exchangecontract)*

*Defined in [packages/sdk/contractkit/src/planq-tokens.ts:238](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/planq-tokens.ts#L238)*

Gets the exchange contract for the provided stable token

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`token` | [StableToken](../modules/_planq_tokens_.md#stabletoken) | the stable token to get exchange contract of |

**Returns:** *[ExchangeContract](../modules/_base_.md#exchangecontract)*

The exchange contract for the token

___

###  getExchangesConfigs

▸ **getExchangesConfigs**(`humanReadable`: boolean): *Promise‹[EachPlanqToken](../modules/_planq_tokens_.md#eachplanqtoken)‹[ExchangeConfig](../interfaces/_wrappers_exchange_.exchangeconfig.md) | object››*

*Defined in [packages/sdk/contractkit/src/planq-tokens.ts:103](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/planq-tokens.ts#L103)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`humanReadable` | boolean | false |

**Returns:** *Promise‹[EachPlanqToken](../modules/_planq_tokens_.md#eachplanqtoken)‹[ExchangeConfig](../interfaces/_wrappers_exchange_.exchangeconfig.md) | object››*

___

###  getFeeCurrencyAddress

▸ **getFeeCurrencyAddress**(`token`: [PlanqTokenType](../modules/_planq_tokens_.md#planqtokentype)): *undefined | Promise‹string›*

*Defined in [packages/sdk/contractkit/src/planq-tokens.ts:255](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/planq-tokens.ts#L255)*

Gets the address to use as the feeCurrency when paying for gas with the
 provided token.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`token` | [PlanqTokenType](../modules/_planq_tokens_.md#planqtokentype) | the token to get the feeCurrency address for |

**Returns:** *undefined | Promise‹string›*

If not PLQ, the address of the token's contract. If PLQ, undefined.

___

###  getStablesConfigs

▸ **getStablesConfigs**(`humanReadable`: boolean): *Promise‹[EachPlanqToken](../modules/_planq_tokens_.md#eachplanqtoken)‹[StableTokenConfig](../interfaces/_wrappers_stabletokenwrapper_.stabletokenconfig.md) | object››*

*Defined in [packages/sdk/contractkit/src/planq-tokens.ts:93](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/planq-tokens.ts#L93)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`humanReadable` | boolean | false |

**Returns:** *Promise‹[EachPlanqToken](../modules/_planq_tokens_.md#eachplanqtoken)‹[StableTokenConfig](../interfaces/_wrappers_stabletokenwrapper_.stabletokenconfig.md) | object››*

___

###  getWrapper

▸ **getWrapper**(`token`: [StableToken](../modules/_planq_tokens_.md#stabletoken)): *Promise‹[StableTokenWrapper](_wrappers_stabletokenwrapper_.stabletokenwrapper.md)›*

*Defined in [packages/sdk/contractkit/src/planq-tokens.ts:216](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/planq-tokens.ts#L216)*

Gets the wrapper for a given planq token.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`token` | [StableToken](../modules/_planq_tokens_.md#stabletoken) | the token to get the appropriate wrapper for |

**Returns:** *Promise‹[StableTokenWrapper](_wrappers_stabletokenwrapper_.stabletokenwrapper.md)›*

an promise resolving to the wrapper for the token

▸ **getWrapper**(`token`: [Token](../modules/_planq_tokens_.md#token)): *Promise‹[PlanqTokenWrapper](_wrappers_planqtokenwrapper_.planqtokenwrapper.md)›*

*Defined in [packages/sdk/contractkit/src/planq-tokens.ts:217](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/planq-tokens.ts#L217)*

**Parameters:**

Name | Type |
------ | ------ |
`token` | [Token](../modules/_planq_tokens_.md#token) |

**Returns:** *Promise‹[PlanqTokenWrapper](_wrappers_planqtokenwrapper_.planqtokenwrapper.md)›*

▸ **getWrapper**(`token`: [PlanqTokenType](../modules/_planq_tokens_.md#planqtokentype)): *Promise‹[PlanqTokenWrapper](../modules/_planq_tokens_.md#planqtokenwrapper)›*

*Defined in [packages/sdk/contractkit/src/planq-tokens.ts:218](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/planq-tokens.ts#L218)*

**Parameters:**

Name | Type |
------ | ------ |
`token` | [PlanqTokenType](../modules/_planq_tokens_.md#planqtokentype) |

**Returns:** *Promise‹[PlanqTokenWrapper](../modules/_planq_tokens_.md#planqtokenwrapper)›*

___

###  getWrappers

▸ **getWrappers**(): *Promise‹[EachPlanqToken](../modules/_planq_tokens_.md#eachplanqtoken)‹[PlanqTokenWrapper](../modules/_planq_tokens_.md#planqtokenwrapper)››*

*Defined in [packages/sdk/contractkit/src/planq-tokens.ts:81](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/planq-tokens.ts#L81)*

Gets the wrapper for each planq token.

**Returns:** *Promise‹[EachPlanqToken](../modules/_planq_tokens_.md#eachplanqtoken)‹[PlanqTokenWrapper](../modules/_planq_tokens_.md#planqtokenwrapper)››*

an promise resolving to an object containing the wrapper for each planq token.

___

###  isStableToken

▸ **isStableToken**(`token`: [PlanqTokenType](../modules/_planq_tokens_.md#planqtokentype)): *boolean*

*Defined in [packages/sdk/contractkit/src/planq-tokens.ts:267](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/planq-tokens.ts#L267)*

Returns if the provided token is a StableToken

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`token` | [PlanqTokenType](../modules/_planq_tokens_.md#planqtokentype) | the token |

**Returns:** *boolean*

if token is a StableToken

___

###  validPlanqTokenInfos

▸ **validPlanqTokenInfos**(): *Promise‹[PlanqTokenInfo](../interfaces/_planq_tokens_.planqtokeninfo.md)[]›*

*Defined in [packages/sdk/contractkit/src/planq-tokens.ts:176](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/planq-tokens.ts#L176)*

**Returns:** *Promise‹[PlanqTokenInfo](../interfaces/_planq_tokens_.planqtokeninfo.md)[]›*

___

###  validStableTokenInfos

▸ **validStableTokenInfos**(): *Promise‹[StableTokenInfo](../interfaces/_planq_tokens_.stabletokeninfo.md)[]›*

*Defined in [packages/sdk/contractkit/src/planq-tokens.ts:193](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/planq-tokens.ts#L193)*

**Returns:** *Promise‹[StableTokenInfo](../interfaces/_planq_tokens_.stabletokeninfo.md)[]›*
