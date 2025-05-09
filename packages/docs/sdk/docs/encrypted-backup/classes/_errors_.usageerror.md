[@planq-network/encrypted-backup](../README.md) › ["errors"](../modules/_errors_.md) › [UsageError](_errors_.usageerror.md)

# Class: UsageError

## Hierarchy

* RootError‹[USAGE_ERROR](../enums/_errors_.backuperrortypes.md#usage_error)›

  ↳ **UsageError**

## Implements

* BaseError‹[USAGE_ERROR](../enums/_errors_.backuperrortypes.md#usage_error)›

## Index

### Constructors

* [constructor](_errors_.usageerror.md#constructor)

### Properties

* [error](_errors_.usageerror.md#optional-readonly-error)
* [errorType](_errors_.usageerror.md#readonly-errortype)
* [message](_errors_.usageerror.md#message)
* [name](_errors_.usageerror.md#name)
* [stack](_errors_.usageerror.md#optional-stack)

## Constructors

###  constructor

\+ **new UsageError**(`error?`: Error): *[UsageError](_errors_.usageerror.md)*

*Overrides void*

*Defined in [packages/sdk/encrypted-backup/src/errors.ts:86](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/encrypted-backup/src/errors.ts#L86)*

**Parameters:**

Name | Type |
------ | ------ |
`error?` | Error |

**Returns:** *[UsageError](_errors_.usageerror.md)*

## Properties

### `Optional` `Readonly` error

• **error**? : *Error*

*Defined in [packages/sdk/encrypted-backup/src/errors.ts:87](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/encrypted-backup/src/errors.ts#L87)*

___

### `Readonly` errorType

• **errorType**: *[USAGE_ERROR](../enums/_errors_.backuperrortypes.md#usage_error)*

*Inherited from [AuthorizationError](_errors_.authorizationerror.md).[errorType](_errors_.authorizationerror.md#readonly-errortype)*

Defined in packages/sdk/base/lib/result.d.ts:19

___

###  message

• **message**: *string*

*Inherited from [AuthorizationError](_errors_.authorizationerror.md).[message](_errors_.authorizationerror.md#message)*

Defined in node_modules/typescript/lib/lib.es5.d.ts:974

___

###  name

• **name**: *string*

*Inherited from [AuthorizationError](_errors_.authorizationerror.md).[name](_errors_.authorizationerror.md#name)*

Defined in node_modules/typescript/lib/lib.es5.d.ts:973

___

### `Optional` stack

• **stack**? : *undefined | string*

*Inherited from [AuthorizationError](_errors_.authorizationerror.md).[stack](_errors_.authorizationerror.md#optional-stack)*

Defined in node_modules/typescript/lib/lib.es5.d.ts:975
