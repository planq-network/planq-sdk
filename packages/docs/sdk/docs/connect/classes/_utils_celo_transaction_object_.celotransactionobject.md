[@planq-network/connect](../README.md) › [Globals](../globals.md) › ["utils/planq-transaction-object"](../modules/_utils_planq_transaction_object_.md) › [PlanqTransactionObject](_utils_planq_transaction_object_.planqtransactionobject.md)

# Class: PlanqTransactionObject <**O**>

## Type parameters

▪ **O**

## Hierarchy

* **PlanqTransactionObject**

## Index

### Constructors

* [constructor](_utils_planq_transaction_object_.planqtransactionobject.md#constructor)

### Properties

* [defaultParams](_utils_planq_transaction_object_.planqtransactionobject.md#optional-readonly-defaultparams)
* [txo](_utils_planq_transaction_object_.planqtransactionobject.md#readonly-txo)

### Methods

* [send](_utils_planq_transaction_object_.planqtransactionobject.md#send)
* [sendAndWaitForReceipt](_utils_planq_transaction_object_.planqtransactionobject.md#sendandwaitforreceipt)

## Constructors

###  constructor

\+ **new PlanqTransactionObject**(`connection`: [Connection](_connection_.connection.md), `txo`: [PlanqTxObject](../interfaces/_types_.planqtxobject.md)‹O›, `defaultParams?`: [PlanqTransactionParams](../modules/_utils_planq_transaction_object_.md#planqtransactionparams)): *[PlanqTransactionObject](_utils_planq_transaction_object_.planqtransactionobject.md)*

*Defined in [utils/planq-transaction-object.ts:15](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/connect/src/utils/planq-transaction-object.ts#L15)*

**Parameters:**

Name | Type |
------ | ------ |
`connection` | [Connection](_connection_.connection.md) |
`txo` | [PlanqTxObject](../interfaces/_types_.planqtxobject.md)‹O› |
`defaultParams?` | [PlanqTransactionParams](../modules/_utils_planq_transaction_object_.md#planqtransactionparams) |

**Returns:** *[PlanqTransactionObject](_utils_planq_transaction_object_.planqtransactionobject.md)*

## Properties

### `Optional` `Readonly` defaultParams

• **defaultParams**? : *[PlanqTransactionParams](../modules/_utils_planq_transaction_object_.md#planqtransactionparams)*

*Defined in [utils/planq-transaction-object.ts:19](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/connect/src/utils/planq-transaction-object.ts#L19)*

___

### `Readonly` txo

• **txo**: *[PlanqTxObject](../interfaces/_types_.planqtxobject.md)‹O›*

*Defined in [utils/planq-transaction-object.ts:18](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/connect/src/utils/planq-transaction-object.ts#L18)*

## Methods

###  send

▸ **send**(`params?`: [PlanqTransactionParams](../modules/_utils_planq_transaction_object_.md#planqtransactionparams)): *Promise‹[TransactionResult](_utils_tx_result_.transactionresult.md)›*

*Defined in [utils/planq-transaction-object.ts:23](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/connect/src/utils/planq-transaction-object.ts#L23)*

send the transaction to the chain

**Parameters:**

Name | Type |
------ | ------ |
`params?` | [PlanqTransactionParams](../modules/_utils_planq_transaction_object_.md#planqtransactionparams) |

**Returns:** *Promise‹[TransactionResult](_utils_tx_result_.transactionresult.md)›*

___

###  sendAndWaitForReceipt

▸ **sendAndWaitForReceipt**(`params?`: [PlanqTransactionParams](../modules/_utils_planq_transaction_object_.md#planqtransactionparams)): *Promise‹[PlanqTxReceipt](../modules/_types_.md#planqtxreceipt)›*

*Defined in [utils/planq-transaction-object.ts:28](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/connect/src/utils/planq-transaction-object.ts#L28)*

send the transaction and waits for the receipt

**Parameters:**

Name | Type |
------ | ------ |
`params?` | [PlanqTransactionParams](../modules/_utils_planq_transaction_object_.md#planqtransactionparams) |

**Returns:** *Promise‹[PlanqTxReceipt](../modules/_types_.md#planqtxreceipt)›*
