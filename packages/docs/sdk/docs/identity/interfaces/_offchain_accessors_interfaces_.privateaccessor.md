[@planq-network/identity](../README.md) › ["offchain/accessors/interfaces"](../modules/_offchain_accessors_interfaces_.md) › [PrivateAccessor](_offchain_accessors_interfaces_.privateaccessor.md)

# Interface: PrivateAccessor <**DataType**>

## Type parameters

▪ **DataType**

## Hierarchy

* **PrivateAccessor**

## Implemented by

* [PrivateBinaryAccessor](../classes/_offchain_accessors_binary_.privatebinaryaccessor.md)
* [PrivateNameAccessor](../classes/_offchain_accessors_name_.privatenameaccessor.md)
* [PrivatePictureAccessor](../classes/_offchain_accessors_pictures_.privatepictureaccessor.md)
* [PrivateSimpleAccessor](../classes/_offchain_accessors_simple_.privatesimpleaccessor.md)

## Index

### Properties

* [read](_offchain_accessors_interfaces_.privateaccessor.md#read)
* [readAsResult](_offchain_accessors_interfaces_.privateaccessor.md#readasresult)
* [write](_offchain_accessors_interfaces_.privateaccessor.md#write)

## Properties

###  read

• **read**: *function*

*Defined in [packages/sdk/identity/src/offchain/accessors/interfaces.ts:12](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/identity/src/offchain/accessors/interfaces.ts#L12)*

#### Type declaration:

▸ (`from`: string): *Promise‹DataType›*

**Parameters:**

Name | Type |
------ | ------ |
`from` | string |

___

###  readAsResult

• **readAsResult**: *function*

*Defined in [packages/sdk/identity/src/offchain/accessors/interfaces.ts:13](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/identity/src/offchain/accessors/interfaces.ts#L13)*

#### Type declaration:

▸ (`from`: string): *Promise‹Result‹DataType, [SchemaErrors](../modules/_offchain_accessors_errors_.md#schemaerrors)››*

**Parameters:**

Name | Type |
------ | ------ |
`from` | string |

___

###  write

• **write**: *function*

*Defined in [packages/sdk/identity/src/offchain/accessors/interfaces.ts:11](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/identity/src/offchain/accessors/interfaces.ts#L11)*

#### Type declaration:

▸ (`data`: DataType, `to`: string[], `symmetricKey?`: Buffer): *Promise‹[SchemaErrors](../modules/_offchain_accessors_errors_.md#schemaerrors) | void›*

**Parameters:**

Name | Type |
------ | ------ |
`data` | DataType |
`to` | string[] |
`symmetricKey?` | Buffer |
