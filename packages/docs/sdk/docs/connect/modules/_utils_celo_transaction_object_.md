[@planq-network/connect](../README.md) › [Globals](../globals.md) › ["utils/planq-transaction-object"](_utils_planq_transaction_object_.md)

# Module: "utils/planq-transaction-object"

## Index

### Classes

* [PlanqTransactionObject](../classes/_utils_planq_transaction_object_.planqtransactionobject.md)

### Type aliases

* [PlanqTransactionParams](_utils_planq_transaction_object_.md#planqtransactionparams)

### Functions

* [toTransactionObject](_utils_planq_transaction_object_.md#totransactionobject)

## Type aliases

###  PlanqTransactionParams

Ƭ **PlanqTransactionParams**: *Omit‹[PlanqTx](_types_.md#planqtx), "data"›*

*Defined in [utils/planq-transaction-object.ts:5](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/connect/src/utils/planq-transaction-object.ts#L5)*

## Functions

###  toTransactionObject

▸ **toTransactionObject**<**O**>(`connection`: [Connection](../classes/_connection_.connection.md), `txo`: [PlanqTxObject](../interfaces/_types_.planqtxobject.md)‹O›, `defaultParams?`: [PlanqTransactionParams](_utils_planq_transaction_object_.md#planqtransactionparams)): *[PlanqTransactionObject](../classes/_utils_planq_transaction_object_.planqtransactionobject.md)‹O›*

*Defined in [utils/planq-transaction-object.ts:7](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/connect/src/utils/planq-transaction-object.ts#L7)*

**Type parameters:**

▪ **O**

**Parameters:**

Name | Type |
------ | ------ |
`connection` | [Connection](../classes/_connection_.connection.md) |
`txo` | [PlanqTxObject](../interfaces/_types_.planqtxobject.md)‹O› |
`defaultParams?` | [PlanqTransactionParams](_utils_planq_transaction_object_.md#planqtransactionparams) |

**Returns:** *[PlanqTransactionObject](../classes/_utils_planq_transaction_object_.planqtransactionobject.md)‹O›*
