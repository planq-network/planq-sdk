[@planq-network/connect](../README.md) › [Globals](../globals.md) › ["planq-provider"](../modules/_planq_provider_.md) › [PlanqProvider](_planq_provider_.planqprovider.md)

# Class: PlanqProvider

## Hierarchy

* **PlanqProvider**

## Implements

* [Provider](../interfaces/_types_.provider.md)

## Index

### Constructors

* [constructor](_planq_provider_.planqprovider.md#constructor)

### Properties

* [connection](_planq_provider_.planqprovider.md#readonly-connection)
* [existingProvider](_planq_provider_.planqprovider.md#readonly-existingprovider)

### Accessors

* [connected](_planq_provider_.planqprovider.md#connected)

### Methods

* [addAccount](_planq_provider_.planqprovider.md#addaccount)
* [getAccounts](_planq_provider_.planqprovider.md#getaccounts)
* [isLocalAccount](_planq_provider_.planqprovider.md#islocalaccount)
* [removeAccount](_planq_provider_.planqprovider.md#removeaccount)
* [send](_planq_provider_.planqprovider.md#send)
* [stop](_planq_provider_.planqprovider.md#stop)
* [supportsSubscriptions](_planq_provider_.planqprovider.md#supportssubscriptions)

## Constructors

###  constructor

\+ **new PlanqProvider**(`existingProvider`: [Provider](../interfaces/_types_.provider.md), `connection`: [Connection](_connection_.connection.md)): *[PlanqProvider](_planq_provider_.planqprovider.md)*

*Defined in [planq-provider.ts:40](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/connect/src/planq-provider.ts#L40)*

**Parameters:**

Name | Type |
------ | ------ |
`existingProvider` | [Provider](../interfaces/_types_.provider.md) |
`connection` | [Connection](_connection_.connection.md) |

**Returns:** *[PlanqProvider](_planq_provider_.planqprovider.md)*

## Properties

### `Readonly` connection

• **connection**: *[Connection](_connection_.connection.md)*

*Defined in [planq-provider.ts:42](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/connect/src/planq-provider.ts#L42)*

___

### `Readonly` existingProvider

• **existingProvider**: *[Provider](../interfaces/_types_.provider.md)*

*Defined in [planq-provider.ts:42](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/connect/src/planq-provider.ts#L42)*

## Accessors

###  connected

• **get connected**(): *any*

*Defined in [planq-provider.ts:245](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/connect/src/planq-provider.ts#L245)*

**Returns:** *any*

## Methods

###  addAccount

▸ **addAccount**(`privateKey`: string): *void*

*Defined in [planq-provider.ts:47](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/connect/src/planq-provider.ts#L47)*

**Parameters:**

Name | Type |
------ | ------ |
`privateKey` | string |

**Returns:** *void*

___

###  getAccounts

▸ **getAccounts**(): *Promise‹string[]›*

*Defined in [planq-provider.ts:57](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/connect/src/planq-provider.ts#L57)*

**Returns:** *Promise‹string[]›*

___

###  isLocalAccount

▸ **isLocalAccount**(`address?`: undefined | string): *boolean*

*Defined in [planq-provider.ts:61](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/connect/src/planq-provider.ts#L61)*

**Parameters:**

Name | Type |
------ | ------ |
`address?` | undefined &#124; string |

**Returns:** *boolean*

___

###  removeAccount

▸ **removeAccount**(`address`: string): *void*

*Defined in [planq-provider.ts:52](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/connect/src/planq-provider.ts#L52)*

**Parameters:**

Name | Type |
------ | ------ |
`address` | string |

**Returns:** *void*

___

###  send

▸ **send**(`payload`: [JsonRpcPayload](../interfaces/_types_.jsonrpcpayload.md), `callback`: [Callback](../modules/_types_.md#callback)‹[JsonRpcResponse](../interfaces/_types_.jsonrpcresponse.md)›): *void*

*Implementation of [Provider](../interfaces/_types_.provider.md)*

*Defined in [planq-provider.ts:68](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/connect/src/planq-provider.ts#L68)*

Send method as expected by web3.js

**Parameters:**

Name | Type |
------ | ------ |
`payload` | [JsonRpcPayload](../interfaces/_types_.jsonrpcpayload.md) |
`callback` | [Callback](../modules/_types_.md#callback)‹[JsonRpcResponse](../interfaces/_types_.jsonrpcresponse.md)› |

**Returns:** *void*

___

###  stop

▸ **stop**(): *void*

*Defined in [planq-provider.ts:143](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/connect/src/planq-provider.ts#L143)*

**Returns:** *void*

___

###  supportsSubscriptions

▸ **supportsSubscriptions**(): *any*

*Defined in [planq-provider.ts:249](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/connect/src/planq-provider.ts#L249)*

**Returns:** *any*
