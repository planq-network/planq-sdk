[@planq-network/contractkit](../README.md) › [Globals](../globals.md) › ["wrappers/Reserve"](../modules/_wrappers_reserve_.md) › [ReserveWrapper](_wrappers_reserve_.reservewrapper.md)

# Class: ReserveWrapper

Contract for handling reserve for stable currencies

## Hierarchy

* [BaseWrapper](_wrappers_basewrapper_.basewrapper.md)‹Reserve›

  ↳ **ReserveWrapper**

## Index

### Constructors

* [constructor](_wrappers_reserve_.reservewrapper.md#constructor)

### Properties

* [dailySpendingRatio](_wrappers_reserve_.reservewrapper.md#dailyspendingratio)
* [eventTypes](_wrappers_reserve_.reservewrapper.md#eventtypes)
* [events](_wrappers_reserve_.reservewrapper.md#events)
* [frozenReservePlanqDays](_wrappers_reserve_.reservewrapper.md#frozenreserveplanqdays)
* [frozenReservePlanqStartBalance](_wrappers_reserve_.reservewrapper.md#frozenreserveplanqstartbalance)
* [frozenReservePlanqStartDay](_wrappers_reserve_.reservewrapper.md#frozenreserveplanqstartday)
* [getAssetAllocationSymbols](_wrappers_reserve_.reservewrapper.md#getassetallocationsymbols)
* [getAssetAllocationWeights](_wrappers_reserve_.reservewrapper.md#getassetallocationweights)
* [getOrComputeTobinTax](_wrappers_reserve_.reservewrapper.md#getorcomputetobintax)
* [getOtherReserveAddresses](_wrappers_reserve_.reservewrapper.md#getotherreserveaddresses)
* [getReservePlanqBalance](_wrappers_reserve_.reservewrapper.md#getreservecelobalance)
* [getReservePlanqBalance](_wrappers_reserve_.reservewrapper.md#getreserveplanqbalance)
* [getUnfrozenBalance](_wrappers_reserve_.reservewrapper.md#getunfrozenbalance)
* [getUnfrozenReservePlanqBalance](_wrappers_reserve_.reservewrapper.md#getunfrozenreservecelobalance)
* [isOtherReserveAddress](_wrappers_reserve_.reservewrapper.md#isotherreserveaddress)
* [isSpender](_wrappers_reserve_.reservewrapper.md#isspender)
* [methodIds](_wrappers_reserve_.reservewrapper.md#methodids)
* [tobinTaxStalenessThreshold](_wrappers_reserve_.reservewrapper.md#tobintaxstalenessthreshold)
* [transferPlanq](_wrappers_reserve_.reservewrapper.md#transferplanq)

### Accessors

* [address](_wrappers_reserve_.reservewrapper.md#address)

### Methods

* [getConfig](_wrappers_reserve_.reservewrapper.md#getconfig)
* [getPastEvents](_wrappers_reserve_.reservewrapper.md#getpastevents)
* [getSpenders](_wrappers_reserve_.reservewrapper.md#getspenders)
* [version](_wrappers_reserve_.reservewrapper.md#version)

## Constructors

###  constructor

\+ **new ReserveWrapper**(`connection`: Connection, `contract`: Reserve): *[ReserveWrapper](_wrappers_reserve_.reservewrapper.md)*

*Inherited from [BaseWrapper](_wrappers_basewrapper_.basewrapper.md).[constructor](_wrappers_basewrapper_.basewrapper.md#constructor)*

*Defined in [packages/sdk/contractkit/src/wrappers/BaseWrapper.ts:32](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/BaseWrapper.ts#L32)*

**Parameters:**

Name | Type |
------ | ------ |
`connection` | Connection |
`contract` | Reserve |

**Returns:** *[ReserveWrapper](_wrappers_reserve_.reservewrapper.md)*

## Properties

###  dailySpendingRatio

• **dailySpendingRatio**: *function* = proxyCall(
    this.contract.methods.getDailySpendingRatio,
    undefined,
    fixidityValueToBigNumber
  )

*Defined in [packages/sdk/contractkit/src/wrappers/Reserve.ts:33](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/Reserve.ts#L33)*

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

• **events**: *Reserve["events"]* = this.contract.events

*Inherited from [BaseWrapper](_wrappers_basewrapper_.basewrapper.md).[events](_wrappers_basewrapper_.basewrapper.md#events)*

*Defined in [packages/sdk/contractkit/src/wrappers/BaseWrapper.ts:61](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/BaseWrapper.ts#L61)*

___

###  frozenReservePlanqDays

• **frozenReservePlanqDays**: *function* = proxyCall(
    this.contract.methods.frozenReservePlanqDays,
    undefined,
    valueToBigNumber
  )

*Defined in [packages/sdk/contractkit/src/wrappers/Reserve.ts:51](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/Reserve.ts#L51)*

#### Type declaration:

▸ (...`args`: InputArgs): *Promise‹Output›*

**Parameters:**

Name | Type |
------ | ------ |
`...args` | InputArgs |

___

###  frozenReservePlanqStartBalance

• **frozenReservePlanqStartBalance**: *function* = proxyCall(
    this.contract.methods.frozenReservePlanqStartBalance,
    undefined,
    valueToBigNumber
  )

*Defined in [packages/sdk/contractkit/src/wrappers/Reserve.ts:41](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/Reserve.ts#L41)*

#### Type declaration:

▸ (...`args`: InputArgs): *Promise‹Output›*

**Parameters:**

Name | Type |
------ | ------ |
`...args` | InputArgs |

___

###  frozenReservePlanqStartDay

• **frozenReservePlanqStartDay**: *function* = proxyCall(
    this.contract.methods.frozenReservePlanqStartDay,
    undefined,
    valueToBigNumber
  )

*Defined in [packages/sdk/contractkit/src/wrappers/Reserve.ts:46](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/Reserve.ts#L46)*

#### Type declaration:

▸ (...`args`: InputArgs): *Promise‹Output›*

**Parameters:**

Name | Type |
------ | ------ |
`...args` | InputArgs |

___

###  getAssetAllocationSymbols

• **getAssetAllocationSymbols**: *function* = proxyCall(
    this.contract.methods.getAssetAllocationSymbols,
    undefined,
    (symbols) => symbols.map((symbol) => this.connection.hexToAscii(symbol))
  )

*Defined in [packages/sdk/contractkit/src/wrappers/Reserve.ts:71](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/Reserve.ts#L71)*

**`notice`** Returns a list of token symbols that have been allocated.

**`returns`** An array of token symbols that have been allocated.

#### Type declaration:

▸ (...`args`: InputArgs): *Promise‹Output›*

**Parameters:**

Name | Type |
------ | ------ |
`...args` | InputArgs |

___

###  getAssetAllocationWeights

• **getAssetAllocationWeights**: *function* = proxyCall(
    this.contract.methods.getAssetAllocationWeights,
    undefined,
    (weights) => weights.map(valueToBigNumber)
  )

*Defined in [packages/sdk/contractkit/src/wrappers/Reserve.ts:61](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/Reserve.ts#L61)*

**`notice`** Returns a list of weights used for the allocation of reserve assets.

**`returns`** An array of a list of weights used for the allocation of reserve assets.

#### Type declaration:

▸ (...`args`: InputArgs): *Promise‹Output›*

**Parameters:**

Name | Type |
------ | ------ |
`...args` | InputArgs |

___

###  getOrComputeTobinTax

• **getOrComputeTobinTax**: *function* = proxySend(this.connection, this.contract.methods.getOrComputeTobinTax)

*Defined in [packages/sdk/contractkit/src/wrappers/Reserve.ts:40](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/Reserve.ts#L40)*

#### Type declaration:

▸ (...`args`: InputArgs): *PlanqTransactionObject‹Output›*

**Parameters:**

Name | Type |
------ | ------ |
`...args` | InputArgs |

___

###  getOtherReserveAddresses

• **getOtherReserveAddresses**: *function* = proxyCall(this.contract.methods.getOtherReserveAddresses)

*Defined in [packages/sdk/contractkit/src/wrappers/Reserve.ts:115](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/Reserve.ts#L115)*

#### Type declaration:

▸ (...`args`: InputArgs): *Promise‹Output›*

**Parameters:**

Name | Type |
------ | ------ |
`...args` | InputArgs |

___

###  getReservePlanqBalance

• **getReservePlanqBalance**: *function* = this.getReservePlanqBalance

*Defined in [packages/sdk/contractkit/src/wrappers/Reserve.ts:90](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/Reserve.ts#L90)*

**`notice`** Returns the amount of PLQ included in the reserve

**`returns`** The PLQ amount included in the reserve.

#### Type declaration:

▸ (...`args`: InputArgs): *Promise‹Output›*

**Parameters:**

Name | Type |
------ | ------ |
`...args` | InputArgs |

___

###  getReservePlanqBalance

• **getReservePlanqBalance**: *function* = proxyCall(
    this.contract.methods.getReservePlanqBalance,
    undefined,
    valueToBigNumber
  )

*Defined in [packages/sdk/contractkit/src/wrappers/Reserve.ts:80](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/Reserve.ts#L80)*

**`alias`** {getReservePlanqBalance}

#### Type declaration:

▸ (...`args`: InputArgs): *Promise‹Output›*

**Parameters:**

Name | Type |
------ | ------ |
`...args` | InputArgs |

___

###  getUnfrozenBalance

• **getUnfrozenBalance**: *function* = proxyCall(
    this.contract.methods.getUnfrozenBalance,
    undefined,
    valueToBigNumber
  )

*Defined in [packages/sdk/contractkit/src/wrappers/Reserve.ts:97](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/Reserve.ts#L97)*

**`notice`** Returns the amount of unfrozen PLQ in the Reserve contract.

**`see`** {getUnfrozenReservePlanqBalance}

**`returns`** amount in wei

#### Type declaration:

▸ (...`args`: InputArgs): *Promise‹Output›*

**Parameters:**

Name | Type |
------ | ------ |
`...args` | InputArgs |

___

###  getUnfrozenReservePlanqBalance

• **getUnfrozenReservePlanqBalance**: *function* = proxyCall(
    this.contract.methods.getUnfrozenReservePlanqBalance,
    undefined,
    valueToBigNumber
  )

*Defined in [packages/sdk/contractkit/src/wrappers/Reserve.ts:109](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/Reserve.ts#L109)*

**`notice`** Returns the amount of unfrozen PLQ included in the reserve
 contract and in other reserve addresses.

**`see`** {getUnfrozenBalance}

**`returns`** amount in wei

#### Type declaration:

▸ (...`args`: InputArgs): *Promise‹Output›*

**Parameters:**

Name | Type |
------ | ------ |
`...args` | InputArgs |

___

###  isOtherReserveAddress

• **isOtherReserveAddress**: *function* = proxyCall(this.contract.methods.isOtherReserveAddress)

*Defined in [packages/sdk/contractkit/src/wrappers/Reserve.ts:130](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/Reserve.ts#L130)*

#### Type declaration:

▸ (...`args`: InputArgs): *Promise‹Output›*

**Parameters:**

Name | Type |
------ | ------ |
`...args` | InputArgs |

___

###  isSpender

• **isSpender**: *function* = proxyCall(this.contract.methods.isSpender)

*Defined in [packages/sdk/contractkit/src/wrappers/Reserve.ts:38](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/Reserve.ts#L38)*

#### Type declaration:

▸ (`account`: string): *Promise‹boolean›*

**Parameters:**

Name | Type |
------ | ------ |
`account` | string |

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

###  tobinTaxStalenessThreshold

• **tobinTaxStalenessThreshold**: *function* = proxyCall(
    this.contract.methods.tobinTaxStalenessThreshold,
    undefined,
    valueToBigNumber
  )

*Defined in [packages/sdk/contractkit/src/wrappers/Reserve.ts:28](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/Reserve.ts#L28)*

Query Tobin tax staleness threshold parameter.

**`returns`** Current Tobin tax staleness threshold.

#### Type declaration:

▸ (...`args`: InputArgs): *Promise‹Output›*

**Parameters:**

Name | Type |
------ | ------ |
`...args` | InputArgs |

___

###  transferPlanq

• **transferPlanq**: *function* = proxySend(this.connection, this.contract.methods.transferPlanq)

*Defined in [packages/sdk/contractkit/src/wrappers/Reserve.ts:39](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/Reserve.ts#L39)*

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

###  getConfig

▸ **getConfig**(): *Promise‹[ReserveConfig](../interfaces/_wrappers_reserve_.reserveconfig.md)›*

*Defined in [packages/sdk/contractkit/src/wrappers/Reserve.ts:120](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/Reserve.ts#L120)*

Returns current configuration parameters.

**Returns:** *Promise‹[ReserveConfig](../interfaces/_wrappers_reserve_.reserveconfig.md)›*

___

###  getPastEvents

▸ **getPastEvents**(`event`: Events‹Reserve›, `options`: PastEventOptions): *Promise‹EventLog[]›*

*Inherited from [BaseWrapper](_wrappers_basewrapper_.basewrapper.md).[getPastEvents](_wrappers_basewrapper_.basewrapper.md#getpastevents)*

*Defined in [packages/sdk/contractkit/src/wrappers/BaseWrapper.ts:57](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/BaseWrapper.ts#L57)*

Contract getPastEvents

**Parameters:**

Name | Type |
------ | ------ |
`event` | Events‹Reserve› |
`options` | PastEventOptions |

**Returns:** *Promise‹EventLog[]›*

___

###  getSpenders

▸ **getSpenders**(): *Promise‹Address[]›*

*Defined in [packages/sdk/contractkit/src/wrappers/Reserve.ts:132](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/Reserve.ts#L132)*

**Returns:** *Promise‹Address[]›*

___

###  version

▸ **version**(): *Promise‹NonNullable‹T["methods"] extends object ? ContractVersion<> : never››*

*Inherited from [BaseWrapper](_wrappers_basewrapper_.basewrapper.md).[version](_wrappers_basewrapper_.basewrapper.md#version)*

*Defined in [packages/sdk/contractkit/src/wrappers/BaseWrapper.ts:41](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/BaseWrapper.ts#L41)*

**Returns:** *Promise‹NonNullable‹T["methods"] extends object ? ContractVersion<> : never››*
