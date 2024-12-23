[@planq-network/contractkit](../README.md) › [Globals](../globals.md) › ["base"](_base_.md)

# Module: "base"

## Index

### Enumerations

* [PlanqContract](../enums/_base_.planqcontract.md)

### Type aliases

* [PlanqToken](_base_.md#planqtoken)
* [PlanqTokenContract](_base_.md#planqtokencontract)
* [ExchangeContract](_base_.md#exchangecontract)
* [StableTokenContract](_base_.md#stabletokencontract)

### Variables

* [AllContracts](_base_.md#const-allcontracts)
* [ProxyContracts](_base_.md#const-proxycontracts)
* [RegisteredContracts](_base_.md#const-registeredcontracts)

### Functions

* [stripProxy](_base_.md#const-stripproxy)
* [suffixProxy](_base_.md#const-suffixproxy)

## Type aliases

###  PlanqToken

Ƭ **PlanqToken**: *[PlanqTokenContract](_base_.md#planqtokencontract)*

*Defined in [packages/sdk/contractkit/src/base.ts:50](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/base.ts#L50)*

Deprecated alias for PlanqTokenContract.

**`deprecated`** Use PlanqTokenContract instead

___

###  PlanqTokenContract

Ƭ **PlanqTokenContract**: *[StableTokenContract](_base_.md#stabletokencontract) | [PlanqToken](../enums/_base_.planqcontract.md#planqtoken)*

*Defined in [packages/sdk/contractkit/src/base.ts:45](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/base.ts#L45)*

___

###  ExchangeContract

Ƭ **ExchangeContract**: *[Exchange](../enums/_base_.planqcontract.md#exchange) | [ExchangeEUR](../enums/_base_.planqcontract.md#exchangeeur) | [ExchangeBRL](../enums/_base_.planqcontract.md#exchangebrl)*

*Defined in [packages/sdk/contractkit/src/base.ts:40](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/base.ts#L40)*

___

###  StableTokenContract

Ƭ **StableTokenContract**: *[StableToken](../enums/_base_.planqcontract.md#stabletoken) | [StableTokenEUR](../enums/_base_.planqcontract.md#stabletokeneur) | [StableTokenBRL](../enums/_base_.planqcontract.md#stabletokenbrl)*

*Defined in [packages/sdk/contractkit/src/base.ts:35](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/base.ts#L35)*

## Variables

### `Const` AllContracts

• **AllContracts**: *[PlanqContract](../enums/_base_.planqcontract.md)[]* = Object.keys(PlanqContract) as PlanqContract[]

*Defined in [packages/sdk/contractkit/src/base.ts:52](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/base.ts#L52)*

___

### `Const` ProxyContracts

• **ProxyContracts**: *[PlanqContract](../enums/_base_.planqcontract.md)[]* = AllContracts.map((c) => suffixProxy(c))

*Defined in [packages/sdk/contractkit/src/base.ts:68](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/base.ts#L68)*

___

### `Const` RegisteredContracts

• **RegisteredContracts**: *[PlanqContract](../enums/_base_.planqcontract.md)[]* = AllContracts.filter((v) => !AuxiliaryContracts.includes(v))

*Defined in [packages/sdk/contractkit/src/base.ts:59](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/base.ts#L59)*

## Functions

### `Const` stripProxy

▸ **stripProxy**(`contract`: [PlanqContract](../enums/_base_.planqcontract.md)): *[PlanqContract](../enums/_base_.planqcontract.md)*

*Defined in [packages/sdk/contractkit/src/base.ts:62](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/base.ts#L62)*

**`internal`** 

**Parameters:**

Name | Type |
------ | ------ |
`contract` | [PlanqContract](../enums/_base_.planqcontract.md) |

**Returns:** *[PlanqContract](../enums/_base_.planqcontract.md)*

___

### `Const` suffixProxy

▸ **suffixProxy**(`contract`: [PlanqContract](../enums/_base_.planqcontract.md)): *[PlanqContract](../enums/_base_.planqcontract.md)*

*Defined in [packages/sdk/contractkit/src/base.ts:65](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/base.ts#L65)*

**`internal`** 

**Parameters:**

Name | Type |
------ | ------ |
`contract` | [PlanqContract](../enums/_base_.planqcontract.md) |

**Returns:** *[PlanqContract](../enums/_base_.planqcontract.md)*
