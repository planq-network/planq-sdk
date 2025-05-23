[@planq-network/connect](../README.md) › [Globals](../globals.md) › ["utils/tx-params-normalizer"](../modules/_utils_tx_params_normalizer_.md) › [TxParamsNormalizer](_utils_tx_params_normalizer_.txparamsnormalizer.md)

# Class: TxParamsNormalizer

## Hierarchy

* **TxParamsNormalizer**

## Index

### Constructors

* [constructor](_utils_tx_params_normalizer_.txparamsnormalizer.md#constructor)

### Properties

* [connection](_utils_tx_params_normalizer_.txparamsnormalizer.md#readonly-connection)

### Methods

* [populate](_utils_tx_params_normalizer_.txparamsnormalizer.md#populate)

## Constructors

###  constructor

\+ **new TxParamsNormalizer**(`connection`: [Connection](_connection_.connection.md)): *[TxParamsNormalizer](_utils_tx_params_normalizer_.txparamsnormalizer.md)*

*Defined in [utils/tx-params-normalizer.ts:16](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/connect/src/utils/tx-params-normalizer.ts#L16)*

**Parameters:**

Name | Type |
------ | ------ |
`connection` | [Connection](_connection_.connection.md) |

**Returns:** *[TxParamsNormalizer](_utils_tx_params_normalizer_.txparamsnormalizer.md)*

## Properties

### `Readonly` connection

• **connection**: *[Connection](_connection_.connection.md)*

*Defined in [utils/tx-params-normalizer.ts:18](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/connect/src/utils/tx-params-normalizer.ts#L18)*

## Methods

###  populate

▸ **populate**(`planqTxParams`: [PlanqTx](../modules/_types_.md#planqtx)): *Promise‹[PlanqTx](../modules/_types_.md#planqtx)›*

*Defined in [utils/tx-params-normalizer.ts:20](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/connect/src/utils/tx-params-normalizer.ts#L20)*

**Parameters:**

Name | Type |
------ | ------ |
`planqTxParams` | [PlanqTx](../modules/_types_.md#planqtx) |

**Returns:** *Promise‹[PlanqTx](../modules/_types_.md#planqtx)›*
