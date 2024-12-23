[@planq-network/contractkit](../README.md) › [Globals](../globals.md) › ["basic-contract-cache-type"](../modules/_basic_contract_cache_type_.md) › [ContractCacheType](_basic_contract_cache_type_.contractcachetype.md)

# Interface: ContractCacheType

Interface for a class with the minimum required wrappers
to make a [MiniContractKit](../classes/_mini_kit_.minicontractkit.md) or [PlanqTokens](../classes/_planq_tokens_.planqtokens.md) Class

## Hierarchy

* **ContractCacheType**

## Implemented by

* [MiniContractCache](../classes/_mini_contract_cache_.minicontractcache.md)
* [WrapperCache](../classes/_contract_cache_.wrappercache.md)

## Index

### Methods

* [getAccounts](_basic_contract_cache_type_.contractcachetype.md#getaccounts)
* [getContract](_basic_contract_cache_type_.contractcachetype.md#getcontract)
* [getExchange](_basic_contract_cache_type_.contractcachetype.md#getexchange)
* [getPlanqToken](_basic_contract_cache_type_.contractcachetype.md#getplanqtoken)
* [getStableToken](_basic_contract_cache_type_.contractcachetype.md#getstabletoken)

## Methods

###  getAccounts

▸ **getAccounts**(): *Promise‹[AccountsWrapper](../classes/_wrappers_accounts_.accountswrapper.md)›*

*Defined in [packages/sdk/contractkit/src/basic-contract-cache-type.ts:13](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/basic-contract-cache-type.ts#L13)*

**Returns:** *Promise‹[AccountsWrapper](../classes/_wrappers_accounts_.accountswrapper.md)›*

___

###  getContract

▸ **getContract**(`contract`: [Exchange](../enums/_base_.planqcontract.md#exchange) | [ExchangeEUR](../enums/_base_.planqcontract.md#exchangeeur) | [ExchangeBRL](../enums/_base_.planqcontract.md#exchangebrl)): *Promise‹[ExchangeWrapper](../classes/_wrappers_exchange_.exchangewrapper.md)›*

*Defined in [packages/sdk/contractkit/src/basic-contract-cache-type.ts:20](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/basic-contract-cache-type.ts#L20)*

**Parameters:**

Name | Type |
------ | ------ |
`contract` | [Exchange](../enums/_base_.planqcontract.md#exchange) &#124; [ExchangeEUR](../enums/_base_.planqcontract.md#exchangeeur) &#124; [ExchangeBRL](../enums/_base_.planqcontract.md#exchangebrl) |

**Returns:** *Promise‹[ExchangeWrapper](../classes/_wrappers_exchange_.exchangewrapper.md)›*

▸ **getContract**(`contract`: [PlanqTokenContract](../modules/_base_.md#planqtokencontract)): *Promise‹[StableTokenWrapper](../classes/_wrappers_stabletokenwrapper_.stabletokenwrapper.md)›*

*Defined in [packages/sdk/contractkit/src/basic-contract-cache-type.ts:23](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/basic-contract-cache-type.ts#L23)*

**Parameters:**

Name | Type |
------ | ------ |
`contract` | [PlanqTokenContract](../modules/_base_.md#planqtokencontract) |

**Returns:** *Promise‹[StableTokenWrapper](../classes/_wrappers_stabletokenwrapper_.stabletokenwrapper.md)›*

▸ **getContract**(`contract`: [PlanqToken](../enums/_base_.planqcontract.md#planqtoken)): *Promise‹[PlanqTokenWrapperType](../modules/_wrappers_planqtokenwrapper_.md#planqtokenwrappertype)›*

*Defined in [packages/sdk/contractkit/src/basic-contract-cache-type.ts:24](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/basic-contract-cache-type.ts#L24)*

**Parameters:**

Name | Type |
------ | ------ |
`contract` | [PlanqToken](../enums/_base_.planqcontract.md#planqtoken) |

**Returns:** *Promise‹[PlanqTokenWrapperType](../modules/_wrappers_planqtokenwrapper_.md#planqtokenwrappertype)›*

___

###  getExchange

▸ **getExchange**(`stableToken`: [StableToken](../enums/_base_.planqcontract.md#stabletoken)): *Promise‹[ExchangeWrapper](../classes/_wrappers_exchange_.exchangewrapper.md)›*

*Defined in [packages/sdk/contractkit/src/basic-contract-cache-type.ts:14](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/basic-contract-cache-type.ts#L14)*

**Parameters:**

Name | Type |
------ | ------ |
`stableToken` | [StableToken](../enums/_base_.planqcontract.md#stabletoken) |

**Returns:** *Promise‹[ExchangeWrapper](../classes/_wrappers_exchange_.exchangewrapper.md)›*

___

###  getPlanqToken

▸ **getPlanqToken**(): *Promise‹[PlanqTokenWrapper](../classes/_wrappers_planqtokenwrapper_.planqtokenwrapper.md)›*

*Defined in [packages/sdk/contractkit/src/basic-contract-cache-type.ts:16](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/basic-contract-cache-type.ts#L16)*

**Returns:** *Promise‹[PlanqTokenWrapper](../classes/_wrappers_planqtokenwrapper_.planqtokenwrapper.md)›*

___

###  getStableToken

▸ **getStableToken**(`stableToken`: [StableToken](../enums/_base_.planqcontract.md#stabletoken)): *Promise‹[StableTokenWrapper](../classes/_wrappers_stabletokenwrapper_.stabletokenwrapper.md)›*

*Defined in [packages/sdk/contractkit/src/basic-contract-cache-type.ts:18](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/basic-contract-cache-type.ts#L18)*

**Parameters:**

Name | Type |
------ | ------ |
`stableToken` | [StableToken](../enums/_base_.planqcontract.md#stabletoken) |

**Returns:** *Promise‹[StableTokenWrapper](../classes/_wrappers_stabletokenwrapper_.stabletokenwrapper.md)›*
