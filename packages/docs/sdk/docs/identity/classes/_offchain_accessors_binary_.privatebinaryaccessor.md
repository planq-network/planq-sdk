[@planq-network/identity](../README.md) › ["offchain/accessors/binary"](../modules/_offchain_accessors_binary_.md) › [PrivateBinaryAccessor](_offchain_accessors_binary_.privatebinaryaccessor.md)

# Class: PrivateBinaryAccessor

Schema for writing any encrypted binary data.

## Hierarchy

* **PrivateBinaryAccessor**

  ↳ [PrivatePictureAccessor](_offchain_accessors_pictures_.privatepictureaccessor.md)

## Implements

* [PrivateAccessor](../interfaces/_offchain_accessors_interfaces_.privateaccessor.md)‹Buffer›

## Index

### Constructors

* [constructor](_offchain_accessors_binary_.privatebinaryaccessor.md#constructor)

### Properties

* [dataPath](_offchain_accessors_binary_.privatebinaryaccessor.md#readonly-datapath)
* [read](_offchain_accessors_binary_.privatebinaryaccessor.md#read)
* [wrapper](_offchain_accessors_binary_.privatebinaryaccessor.md#readonly-wrapper)

### Methods

* [allowAccess](_offchain_accessors_binary_.privatebinaryaccessor.md#allowaccess)
* [readAsResult](_offchain_accessors_binary_.privatebinaryaccessor.md#readasresult)
* [write](_offchain_accessors_binary_.privatebinaryaccessor.md#write)

## Constructors

###  constructor

\+ **new PrivateBinaryAccessor**(`wrapper`: [OffchainDataWrapper](../interfaces/_offchain_data_wrapper_.offchaindatawrapper.md), `dataPath`: string): *[PrivateBinaryAccessor](_offchain_accessors_binary_.privatebinaryaccessor.md)*

*Defined in [packages/sdk/identity/src/offchain/accessors/binary.ts:41](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/identity/src/offchain/accessors/binary.ts#L41)*

**Parameters:**

Name | Type |
------ | ------ |
`wrapper` | [OffchainDataWrapper](../interfaces/_offchain_data_wrapper_.offchaindatawrapper.md) |
`dataPath` | string |

**Returns:** *[PrivateBinaryAccessor](_offchain_accessors_binary_.privatebinaryaccessor.md)*

## Properties

### `Readonly` dataPath

• **dataPath**: *string*

*Defined in [packages/sdk/identity/src/offchain/accessors/binary.ts:42](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/identity/src/offchain/accessors/binary.ts#L42)*

___

###  read

• **read**: *function* = makeAsyncThrowable(this.readAsResult.bind(this))

*Implementation of [PrivateAccessor](../interfaces/_offchain_accessors_interfaces_.privateaccessor.md).[read](../interfaces/_offchain_accessors_interfaces_.privateaccessor.md#read)*

*Defined in [packages/sdk/identity/src/offchain/accessors/binary.ts:56](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/identity/src/offchain/accessors/binary.ts#L56)*

#### Type declaration:

▸ (...`args`: TArgs): *Promise‹TResult›*

**Parameters:**

Name | Type |
------ | ------ |
`...args` | TArgs |

___

### `Readonly` wrapper

• **wrapper**: *[OffchainDataWrapper](../interfaces/_offchain_data_wrapper_.offchaindatawrapper.md)*

*Defined in [packages/sdk/identity/src/offchain/accessors/binary.ts:42](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/identity/src/offchain/accessors/binary.ts#L42)*

## Methods

###  allowAccess

▸ **allowAccess**(`toAddresses`: Address[], `symmetricKey?`: Buffer): *Promise‹void | [InvalidDataError](_offchain_accessors_errors_.invaliddataerror.md)‹› | [OffchainError](_offchain_accessors_errors_.offchainerror.md)‹› | [UnknownCiphertext](_offchain_accessors_errors_.unknownciphertext.md)‹› | [UnavailableKey](_offchain_accessors_errors_.unavailablekey.md)‹› | [InvalidKey](_offchain_accessors_errors_.invalidkey.md)‹››*

*Defined in [packages/sdk/identity/src/offchain/accessors/binary.ts:48](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/identity/src/offchain/accessors/binary.ts#L48)*

**Parameters:**

Name | Type |
------ | ------ |
`toAddresses` | Address[] |
`symmetricKey?` | Buffer |

**Returns:** *Promise‹void | [InvalidDataError](_offchain_accessors_errors_.invaliddataerror.md)‹› | [OffchainError](_offchain_accessors_errors_.offchainerror.md)‹› | [UnknownCiphertext](_offchain_accessors_errors_.unknownciphertext.md)‹› | [UnavailableKey](_offchain_accessors_errors_.unavailablekey.md)‹› | [InvalidKey](_offchain_accessors_errors_.invalidkey.md)‹››*

___

###  readAsResult

▸ **readAsResult**(`account`: Address): *Promise‹Result‹Buffer‹›, [SchemaErrors](../modules/_offchain_accessors_errors_.md#schemaerrors)››*

*Defined in [packages/sdk/identity/src/offchain/accessors/binary.ts:52](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/identity/src/offchain/accessors/binary.ts#L52)*

**Parameters:**

Name | Type |
------ | ------ |
`account` | Address |

**Returns:** *Promise‹Result‹Buffer‹›, [SchemaErrors](../modules/_offchain_accessors_errors_.md#schemaerrors)››*

___

###  write

▸ **write**(`data`: Buffer, `toAddresses`: Address[], `symmetricKey?`: Buffer): *Promise‹void | [InvalidDataError](_offchain_accessors_errors_.invaliddataerror.md)‹› | [OffchainError](_offchain_accessors_errors_.offchainerror.md)‹› | [UnknownCiphertext](_offchain_accessors_errors_.unknownciphertext.md)‹› | [UnavailableKey](_offchain_accessors_errors_.unavailablekey.md)‹› | [InvalidKey](_offchain_accessors_errors_.invalidkey.md)‹››*

*Defined in [packages/sdk/identity/src/offchain/accessors/binary.ts:44](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/identity/src/offchain/accessors/binary.ts#L44)*

**Parameters:**

Name | Type |
------ | ------ |
`data` | Buffer |
`toAddresses` | Address[] |
`symmetricKey?` | Buffer |

**Returns:** *Promise‹void | [InvalidDataError](_offchain_accessors_errors_.invaliddataerror.md)‹› | [OffchainError](_offchain_accessors_errors_.offchainerror.md)‹› | [UnknownCiphertext](_offchain_accessors_errors_.unknownciphertext.md)‹› | [UnavailableKey](_offchain_accessors_errors_.unavailablekey.md)‹› | [InvalidKey](_offchain_accessors_errors_.invalidkey.md)‹››*
