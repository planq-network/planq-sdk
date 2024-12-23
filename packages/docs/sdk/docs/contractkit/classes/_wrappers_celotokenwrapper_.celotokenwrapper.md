[@planq-network/contractkit](../README.md) › [Globals](../globals.md) › ["wrappers/PlanqTokenWrapper"](../modules/_wrappers_planqtokenwrapper_.md) › [PlanqTokenWrapper](_wrappers_planqtokenwrapper_.planqtokenwrapper.md)

# Class: PlanqTokenWrapper <**T**>

Contract for Planq native currency that adheres to the IPlanqToken and IERC20 interfaces.

## Type parameters

▪ **T**: *Ierc20 & IPlanqToken*

## Hierarchy

  ↳ [Erc20Wrapper](_wrappers_erc20wrapper_.erc20wrapper.md)‹T›

  ↳ **PlanqTokenWrapper**

  ↳ [PlanqTokenWrapper](_wrappers_planqtokenwrapper_.planqtokenwrapper.md)

  ↳ [StableTokenWrapper](_wrappers_stabletokenwrapper_.stabletokenwrapper.md)

## Index

### Constructors

* [constructor](_wrappers_planqtokenwrapper_.planqtokenwrapper.md#constructor)

### Properties

* [allowance](_wrappers_planqtokenwrapper_.planqtokenwrapper.md#allowance)
* [approve](_wrappers_planqtokenwrapper_.planqtokenwrapper.md#approve)
* [balanceOf](_wrappers_planqtokenwrapper_.planqtokenwrapper.md#balanceof)
* [decimals](_wrappers_planqtokenwrapper_.planqtokenwrapper.md#decimals)
* [eventTypes](_wrappers_planqtokenwrapper_.planqtokenwrapper.md#eventtypes)
* [events](_wrappers_planqtokenwrapper_.planqtokenwrapper.md#events)
* [methodIds](_wrappers_planqtokenwrapper_.planqtokenwrapper.md#methodids)
* [name](_wrappers_planqtokenwrapper_.planqtokenwrapper.md#name)
* [symbol](_wrappers_planqtokenwrapper_.planqtokenwrapper.md#symbol)
* [totalSupply](_wrappers_planqtokenwrapper_.planqtokenwrapper.md#totalsupply)
* [transfer](_wrappers_planqtokenwrapper_.planqtokenwrapper.md#transfer)
* [transferFrom](_wrappers_planqtokenwrapper_.planqtokenwrapper.md#transferfrom)
* [transferWithComment](_wrappers_planqtokenwrapper_.planqtokenwrapper.md#transferwithcomment)

### Accessors

* [address](_wrappers_planqtokenwrapper_.planqtokenwrapper.md#address)

### Methods

* [getPastEvents](_wrappers_planqtokenwrapper_.planqtokenwrapper.md#getpastevents)
* [version](_wrappers_planqtokenwrapper_.planqtokenwrapper.md#version)

## Constructors

###  constructor

\+ **new PlanqTokenWrapper**(`connection`: Connection, `contract`: T): *[PlanqTokenWrapper](_wrappers_planqtokenwrapper_.planqtokenwrapper.md)*

*Inherited from [BaseWrapper](_wrappers_basewrapper_.basewrapper.md).[constructor](_wrappers_basewrapper_.basewrapper.md#constructor)*

*Defined in [packages/sdk/contractkit/src/wrappers/BaseWrapper.ts:32](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/BaseWrapper.ts#L32)*

**Parameters:**

Name | Type |
------ | ------ |
`connection` | Connection |
`contract` | T |

**Returns:** *[PlanqTokenWrapper](_wrappers_planqtokenwrapper_.planqtokenwrapper.md)*

## Properties

###  allowance

• **allowance**: *function* = proxyCall(this.contract.methods.allowance, undefined, valueToBigNumber)

*Inherited from [Erc20Wrapper](_wrappers_erc20wrapper_.erc20wrapper.md).[allowance](_wrappers_erc20wrapper_.erc20wrapper.md#allowance)*

*Defined in [packages/sdk/contractkit/src/wrappers/Erc20Wrapper.ts:18](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/Erc20Wrapper.ts#L18)*

Querying allowance.

**`param`** Account who has given the allowance.

**`param`** Address of account to whom the allowance was given.

**`returns`** Amount of allowance.

#### Type declaration:

▸ (...`args`: InputArgs): *Promise‹Output›*

**Parameters:**

Name | Type |
------ | ------ |
`...args` | InputArgs |

___

###  approve

• **approve**: *function* = proxySend(this.connection, this.contract.methods.approve)

*Inherited from [Erc20Wrapper](_wrappers_erc20wrapper_.erc20wrapper.md).[approve](_wrappers_erc20wrapper_.erc20wrapper.md#approve)*

*Defined in [packages/sdk/contractkit/src/wrappers/Erc20Wrapper.ts:32](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/Erc20Wrapper.ts#L32)*

Approve a user to transfer the token on behalf of another user.

**`param`** The address which is being approved to spend the token.

**`param`** The amount of the token approved to the spender.

**`returns`** True if the transaction succeeds.

#### Type declaration:

▸ (...`args`: InputArgs): *PlanqTransactionObject‹Output›*

**Parameters:**

Name | Type |
------ | ------ |
`...args` | InputArgs |

___

###  balanceOf

• **balanceOf**: *function* = proxyCall(
    this.contract.methods.balanceOf,
    undefined,
    valueToBigNumber
  )

*Inherited from [Erc20Wrapper](_wrappers_erc20wrapper_.erc20wrapper.md).[balanceOf](_wrappers_erc20wrapper_.erc20wrapper.md#balanceof)*

*Defined in [packages/sdk/contractkit/src/wrappers/Erc20Wrapper.ts:56](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/Erc20Wrapper.ts#L56)*

Gets the balance of the specified address.

**`param`** The address to query the balance of.

**`returns`** The balance of the specified address.

#### Type declaration:

▸ (`owner`: string): *Promise‹BigNumber›*

**Parameters:**

Name | Type |
------ | ------ |
`owner` | string |

___

###  decimals

• **decimals**: *function* = proxyCall(this.contract.methods.decimals, undefined, valueToInt)

*Defined in [packages/sdk/contractkit/src/wrappers/PlanqTokenWrapper.ts:29](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/PlanqTokenWrapper.ts#L29)*

Returns the number of decimals used in the token.

**`returns`** Number of decimals.

#### Type declaration:

▸ (...`args`: InputArgs): *Promise‹Output›*

**Parameters:**

Name | Type |
------ | ------ |
`...args` | InputArgs |

___

###  eventTypes

• **eventTypes**: *EventsEnum‹T›* = Object.keys(this.events).reduce<EventsEnum<T>>(
    (acc, key) => ({ ...acc, [key]: key }),
    {} as any
  )

*Inherited from [BaseWrapper](_wrappers_basewrapper_.basewrapper.md).[eventTypes](_wrappers_basewrapper_.basewrapper.md#eventtypes)*

*Defined in [packages/sdk/contractkit/src/wrappers/BaseWrapper.ts:63](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/BaseWrapper.ts#L63)*

___

###  events

• **events**: *T["events"]* = this.contract.events

*Inherited from [BaseWrapper](_wrappers_basewrapper_.basewrapper.md).[events](_wrappers_basewrapper_.basewrapper.md#events)*

*Defined in [packages/sdk/contractkit/src/wrappers/BaseWrapper.ts:61](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/BaseWrapper.ts#L61)*

___

###  methodIds

• **methodIds**: *Record‹keyof T["methods"], string›* = Object.keys(this.contract.methods).reduce<Record<Methods<T>, string>>(
    (acc, method: Methods<T>) => {
      const methodABI = this.contract.options.jsonInterface.find((item) => item.name === method)

      acc[method] =
        methodABI === undefined
          ? '0x'
          : this.connection.getAbiCoder().encodeFunctionSignature(methodABI)

      return acc
    },
    {} as any
  )

*Inherited from [BaseWrapper](_wrappers_basewrapper_.basewrapper.md).[methodIds](_wrappers_basewrapper_.basewrapper.md#methodids)*

*Defined in [packages/sdk/contractkit/src/wrappers/BaseWrapper.ts:68](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/BaseWrapper.ts#L68)*

___

###  name

• **name**: *function* = proxyCall(this.contract.methods.name)

*Defined in [packages/sdk/contractkit/src/wrappers/PlanqTokenWrapper.ts:18](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/PlanqTokenWrapper.ts#L18)*

Returns the name of the token.

**`returns`** Name of the token.

#### Type declaration:

▸ (...`args`: InputArgs): *Promise‹Output›*

**Parameters:**

Name | Type |
------ | ------ |
`...args` | InputArgs |

___

###  symbol

• **symbol**: *function* = proxyCall(this.contract.methods.symbol)

*Defined in [packages/sdk/contractkit/src/wrappers/PlanqTokenWrapper.ts:24](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/PlanqTokenWrapper.ts#L24)*

Returns the three letter symbol of the token.

**`returns`** Symbol of the token.

#### Type declaration:

▸ (...`args`: InputArgs): *Promise‹Output›*

**Parameters:**

Name | Type |
------ | ------ |
`...args` | InputArgs |

___

###  totalSupply

• **totalSupply**: *function* = proxyCall(this.contract.methods.totalSupply, undefined, valueToBigNumber)

*Inherited from [Erc20Wrapper](_wrappers_erc20wrapper_.erc20wrapper.md).[totalSupply](_wrappers_erc20wrapper_.erc20wrapper.md#totalsupply)*

*Defined in [packages/sdk/contractkit/src/wrappers/Erc20Wrapper.ts:24](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/Erc20Wrapper.ts#L24)*

Returns the total supply of the token, that is, the amount of tokens currently minted.

**`returns`** Total supply.

#### Type declaration:

▸ (...`args`: InputArgs): *Promise‹Output›*

**Parameters:**

Name | Type |
------ | ------ |
`...args` | InputArgs |

___

###  transfer

• **transfer**: *function* = proxySend(this.connection, this.contract.methods.transfer)

*Inherited from [Erc20Wrapper](_wrappers_erc20wrapper_.erc20wrapper.md).[transfer](_wrappers_erc20wrapper_.erc20wrapper.md#transfer)*

*Defined in [packages/sdk/contractkit/src/wrappers/Erc20Wrapper.ts:40](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/Erc20Wrapper.ts#L40)*

Transfers the token from one address to another.

**`param`** The address to transfer the token to.

**`param`** The amount of the token to transfer.

**`returns`** True if the transaction succeeds.

#### Type declaration:

▸ (...`args`: InputArgs): *PlanqTransactionObject‹Output›*

**Parameters:**

Name | Type |
------ | ------ |
`...args` | InputArgs |

___

###  transferFrom

• **transferFrom**: *function* = proxySend(this.connection, this.contract.methods.transferFrom)

*Inherited from [Erc20Wrapper](_wrappers_erc20wrapper_.erc20wrapper.md).[transferFrom](_wrappers_erc20wrapper_.erc20wrapper.md#transferfrom)*

*Defined in [packages/sdk/contractkit/src/wrappers/Erc20Wrapper.ts:49](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/Erc20Wrapper.ts#L49)*

Transfers the token from one address to another on behalf of a user.

**`param`** The address to transfer the token from.

**`param`** The address to transfer the token to.

**`param`** The amount of the token to transfer.

**`returns`** True if the transaction succeeds.

#### Type declaration:

▸ (...`args`: InputArgs): *PlanqTransactionObject‹Output›*

**Parameters:**

Name | Type |
------ | ------ |
`...args` | InputArgs |

___

###  transferWithComment

• **transferWithComment**: *function* = proxySend(this.connection, this.contract.methods.transferWithComment)

*Defined in [packages/sdk/contractkit/src/wrappers/PlanqTokenWrapper.ts:38](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/PlanqTokenWrapper.ts#L38)*

Transfers the token from one address to another with a comment.

**`param`** The address to transfer the token to.

**`param`** The amount of the token to transfer.

**`param`** The transfer comment

**`returns`** True if the transaction succeeds.

#### Type declaration:

▸ (...`args`: InputArgs): *PlanqTransactionObject‹Output›*

**Parameters:**

Name | Type |
------ | ------ |
`...args` | InputArgs |

## Accessors

###  address

• **get address**(): *string*

*Inherited from [BaseWrapper](_wrappers_basewrapper_.basewrapper.md).[address](_wrappers_basewrapper_.basewrapper.md#address)*

*Defined in [packages/sdk/contractkit/src/wrappers/BaseWrapper.ts:37](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/BaseWrapper.ts#L37)*

Contract address

**Returns:** *string*

## Methods

###  getPastEvents

▸ **getPastEvents**(`event`: Events‹T›, `options`: PastEventOptions): *Promise‹EventLog[]›*

*Inherited from [BaseWrapper](_wrappers_basewrapper_.basewrapper.md).[getPastEvents](_wrappers_basewrapper_.basewrapper.md#getpastevents)*

*Defined in [packages/sdk/contractkit/src/wrappers/BaseWrapper.ts:57](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/BaseWrapper.ts#L57)*

Contract getPastEvents

**Parameters:**

Name | Type |
------ | ------ |
`event` | Events‹T› |
`options` | PastEventOptions |

**Returns:** *Promise‹EventLog[]›*

___

###  version

▸ **version**(): *Promise‹NonNullable‹T["methods"] extends object ? ContractVersion<> : never››*

*Inherited from [BaseWrapper](_wrappers_basewrapper_.basewrapper.md).[version](_wrappers_basewrapper_.basewrapper.md#version)*

*Defined in [packages/sdk/contractkit/src/wrappers/BaseWrapper.ts:41](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/BaseWrapper.ts#L41)*

**Returns:** *Promise‹NonNullable‹T["methods"] extends object ? ContractVersion<> : never››*
