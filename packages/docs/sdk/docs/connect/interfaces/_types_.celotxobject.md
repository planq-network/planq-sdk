[@planq-network/connect](../README.md) › [Globals](../globals.md) › ["types"](../modules/_types_.md) › [PlanqTxObject](_types_.planqtxobject.md)

# Interface: PlanqTxObject <**T**>

## Type parameters

▪ **T**

## Hierarchy

* **PlanqTxObject**

## Index

### Properties

* [_parent](_types_.planqtxobject.md#_parent)
* [arguments](_types_.planqtxobject.md#arguments)

### Methods

* [call](_types_.planqtxobject.md#call)
* [encodeABI](_types_.planqtxobject.md#encodeabi)
* [estimateGas](_types_.planqtxobject.md#estimategas)
* [send](_types_.planqtxobject.md#send)

## Properties

###  _parent

• **_parent**: *Contract*

*Defined in [types.ts:20](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/connect/src/types.ts#L20)*

___

###  arguments

• **arguments**: *any[]*

*Defined in [types.ts:15](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/connect/src/types.ts#L15)*

## Methods

###  call

▸ **call**(`tx?`: [PlanqTx](../modules/_types_.md#planqtx)): *Promise‹T›*

*Defined in [types.ts:16](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/connect/src/types.ts#L16)*

**Parameters:**

Name | Type |
------ | ------ |
`tx?` | [PlanqTx](../modules/_types_.md#planqtx) |

**Returns:** *Promise‹T›*

___

###  encodeABI

▸ **encodeABI**(): *string*

*Defined in [types.ts:19](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/connect/src/types.ts#L19)*

**Returns:** *string*

___

###  estimateGas

▸ **estimateGas**(`tx?`: [PlanqTx](../modules/_types_.md#planqtx)): *Promise‹number›*

*Defined in [types.ts:18](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/connect/src/types.ts#L18)*

**Parameters:**

Name | Type |
------ | ------ |
`tx?` | [PlanqTx](../modules/_types_.md#planqtx) |

**Returns:** *Promise‹number›*

___

###  send

▸ **send**(`tx?`: [PlanqTx](../modules/_types_.md#planqtx)): *PromiEvent‹[PlanqTxReceipt](../modules/_types_.md#planqtxreceipt)›*

*Defined in [types.ts:17](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/connect/src/types.ts#L17)*

**Parameters:**

Name | Type |
------ | ------ |
`tx?` | [PlanqTx](../modules/_types_.md#planqtx) |

**Returns:** *PromiEvent‹[PlanqTxReceipt](../modules/_types_.md#planqtxreceipt)›*
