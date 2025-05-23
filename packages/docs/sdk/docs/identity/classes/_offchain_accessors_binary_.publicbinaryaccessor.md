[@planq-network/identity](../README.md) › ["offchain/accessors/binary"](../modules/_offchain_accessors_binary_.md) › [PublicBinaryAccessor](_offchain_accessors_binary_.publicbinaryaccessor.md)

# Class: PublicBinaryAccessor

Schema for writing any generic binary data

## Hierarchy

* **PublicBinaryAccessor**

  ↳ [PublicPictureAccessor](_offchain_accessors_pictures_.publicpictureaccessor.md)

## Implements

* [PublicAccessor](../interfaces/_offchain_accessors_interfaces_.publicaccessor.md)‹Buffer›

## Index

### Constructors

* [constructor](_offchain_accessors_binary_.publicbinaryaccessor.md#constructor)

### Properties

* [dataPath](_offchain_accessors_binary_.publicbinaryaccessor.md#readonly-datapath)
* [read](_offchain_accessors_binary_.publicbinaryaccessor.md#read)
* [wrapper](_offchain_accessors_binary_.publicbinaryaccessor.md#readonly-wrapper)

### Methods

* [readAsResult](_offchain_accessors_binary_.publicbinaryaccessor.md#readasresult)
* [write](_offchain_accessors_binary_.publicbinaryaccessor.md#write)

## Constructors

###  constructor

\+ **new PublicBinaryAccessor**(`wrapper`: [OffchainDataWrapper](../interfaces/_offchain_data_wrapper_.offchaindatawrapper.md), `dataPath`: string): *[PublicBinaryAccessor](_offchain_accessors_binary_.publicbinaryaccessor.md)*

*Defined in [packages/sdk/identity/src/offchain/accessors/binary.ts:11](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/identity/src/offchain/accessors/binary.ts#L11)*

**Parameters:**

Name | Type |
------ | ------ |
`wrapper` | [OffchainDataWrapper](../interfaces/_offchain_data_wrapper_.offchaindatawrapper.md) |
`dataPath` | string |

**Returns:** *[PublicBinaryAccessor](_offchain_accessors_binary_.publicbinaryaccessor.md)*

## Properties

### `Readonly` dataPath

• **dataPath**: *string*

*Defined in [packages/sdk/identity/src/offchain/accessors/binary.ts:12](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/identity/src/offchain/accessors/binary.ts#L12)*

___

###  read

• **read**: *function* = makeAsyncThrowable(this.readAsResult.bind(this))

*Implementation of [PublicAccessor](../interfaces/_offchain_accessors_interfaces_.publicaccessor.md).[read](../interfaces/_offchain_accessors_interfaces_.publicaccessor.md#read)*

*Defined in [packages/sdk/identity/src/offchain/accessors/binary.ts:35](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/identity/src/offchain/accessors/binary.ts#L35)*

#### Type declaration:

▸ (...`args`: TArgs): *Promise‹TResult›*

**Parameters:**

Name | Type |
------ | ------ |
`...args` | TArgs |

___

### `Readonly` wrapper

• **wrapper**: *[OffchainDataWrapper](../interfaces/_offchain_data_wrapper_.offchaindatawrapper.md)*

*Defined in [packages/sdk/identity/src/offchain/accessors/binary.ts:12](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/identity/src/offchain/accessors/binary.ts#L12)*

## Methods

###  readAsResult

▸ **readAsResult**(`account`: Address): *Promise‹OkResult‹Buffer‹›› | ErrorResult‹[OffchainError](_offchain_accessors_errors_.offchainerror.md)‹›››*

*Defined in [packages/sdk/identity/src/offchain/accessors/binary.ts:26](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/identity/src/offchain/accessors/binary.ts#L26)*

**Parameters:**

Name | Type |
------ | ------ |
`account` | Address |

**Returns:** *Promise‹OkResult‹Buffer‹›› | ErrorResult‹[OffchainError](_offchain_accessors_errors_.offchainerror.md)‹›››*

___

###  write

▸ **write**(`data`: Buffer): *Promise‹undefined | [OffchainError](_offchain_accessors_errors_.offchainerror.md)‹››*

*Defined in [packages/sdk/identity/src/offchain/accessors/binary.ts:14](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/identity/src/offchain/accessors/binary.ts#L14)*

**Parameters:**

Name | Type |
------ | ------ |
`data` | Buffer |

**Returns:** *Promise‹undefined | [OffchainError](_offchain_accessors_errors_.offchainerror.md)‹››*
