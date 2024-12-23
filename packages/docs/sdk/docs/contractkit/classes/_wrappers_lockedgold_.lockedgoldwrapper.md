[@planq-network/contractkit](../README.md) › [Globals](../globals.md) › ["wrappers/LockedPlanq"](../modules/_wrappers_lockedplanq_.md) › [LockedPlanqWrapper](_wrappers_lockedplanq_.lockedplanqwrapper.md)

# Class: LockedPlanqWrapper

Contract for handling deposits needed for voting.

## Hierarchy

  ↳ [BaseWrapperForGoverning](_wrappers_basewrapperforgoverning_.basewrapperforgoverning.md)‹LockedPlanq›

  ↳ **LockedPlanqWrapper**

## Index

### Constructors

* [constructor](_wrappers_lockedplanq_.lockedplanqwrapper.md#constructor)

### Properties

* [_relock](_wrappers_lockedplanq_.lockedplanqwrapper.md#_relock)
* [eventTypes](_wrappers_lockedplanq_.lockedplanqwrapper.md#eventtypes)
* [events](_wrappers_lockedplanq_.lockedplanqwrapper.md#events)
* [getAccountNonvotingLockedPlanq](_wrappers_lockedplanq_.lockedplanqwrapper.md#getaccountnonvotinglockedplanq)
* [getAccountTotalLockedPlanq](_wrappers_lockedplanq_.lockedplanqwrapper.md#getaccounttotallockedplanq)
* [getTotalLockedPlanq](_wrappers_lockedplanq_.lockedplanqwrapper.md#gettotallockedplanq)
* [lock](_wrappers_lockedplanq_.lockedplanqwrapper.md#lock)
* [methodIds](_wrappers_lockedplanq_.lockedplanqwrapper.md#methodids)
* [unlock](_wrappers_lockedplanq_.lockedplanqwrapper.md#unlock)
* [withdraw](_wrappers_lockedplanq_.lockedplanqwrapper.md#withdraw)

### Accessors

* [address](_wrappers_lockedplanq_.lockedplanqwrapper.md#address)

### Methods

* [computeInitialParametersForSlashing](_wrappers_lockedplanq_.lockedplanqwrapper.md#computeinitialparametersforslashing)
* [computeParametersForSlashing](_wrappers_lockedplanq_.lockedplanqwrapper.md#computeparametersforslashing)
* [getAccountSummary](_wrappers_lockedplanq_.lockedplanqwrapper.md#getaccountsummary)
* [getAccountsSlashed](_wrappers_lockedplanq_.lockedplanqwrapper.md#getaccountsslashed)
* [getConfig](_wrappers_lockedplanq_.lockedplanqwrapper.md#getconfig)
* [getHumanReadableConfig](_wrappers_lockedplanq_.lockedplanqwrapper.md#gethumanreadableconfig)
* [getPastEvents](_wrappers_lockedplanq_.lockedplanqwrapper.md#getpastevents)
* [getPendingWithdrawals](_wrappers_lockedplanq_.lockedplanqwrapper.md#getpendingwithdrawals)
* [getPendingWithdrawalsTotalValue](_wrappers_lockedplanq_.lockedplanqwrapper.md#getpendingwithdrawalstotalvalue)
* [relock](_wrappers_lockedplanq_.lockedplanqwrapper.md#relock)
* [version](_wrappers_lockedplanq_.lockedplanqwrapper.md#version)

## Constructors

###  constructor

\+ **new LockedPlanqWrapper**(`connection`: Connection, `contract`: LockedPlanq, `contracts`: ContractWrappersForVotingAndRules): *[LockedPlanqWrapper](_wrappers_lockedplanq_.lockedplanqwrapper.md)*

*Inherited from [ValidatorsWrapper](_wrappers_validators_.validatorswrapper.md).[constructor](_wrappers_validators_.validatorswrapper.md#constructor)*

*Overrides [BaseWrapper](_wrappers_basewrapper_.basewrapper.md).[constructor](_wrappers_basewrapper_.basewrapper.md#constructor)*

*Defined in [packages/sdk/contractkit/src/wrappers/BaseWrapperForGoverning.ts:20](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/BaseWrapperForGoverning.ts#L20)*

**Parameters:**

Name | Type |
------ | ------ |
`connection` | Connection |
`contract` | LockedPlanq |
`contracts` | ContractWrappersForVotingAndRules |

**Returns:** *[LockedPlanqWrapper](_wrappers_lockedplanq_.lockedplanqwrapper.md)*

## Properties

###  _relock

• **_relock**: *function* = proxySend(
    this.connection,
    this.contract.methods.relock,
    tupleParser(valueToString, valueToString)
  )

*Defined in [packages/sdk/contractkit/src/wrappers/LockedPlanq.ts:145](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/LockedPlanq.ts#L145)*

Relocks planq that has been unlocked but not withdrawn.

**`param`** The index of the pending withdrawal to relock from.

**`param`** The value to relock from the specified pending withdrawal.

#### Type declaration:

▸ (`index`: number, `value`: BigNumber.Value): *PlanqTransactionObject‹void›*

**Parameters:**

Name | Type |
------ | ------ |
`index` | number |
`value` | BigNumber.Value |

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

• **events**: *LockedPlanq["events"]* = this.contract.events

*Inherited from [BaseWrapper](_wrappers_basewrapper_.basewrapper.md).[events](_wrappers_basewrapper_.basewrapper.md#events)*

*Defined in [packages/sdk/contractkit/src/wrappers/BaseWrapper.ts:61](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/BaseWrapper.ts#L61)*

___

###  getAccountNonvotingLockedPlanq

• **getAccountNonvotingLockedPlanq**: *function* = proxyCall(
    this.contract.methods.getAccountNonvotingLockedPlanq,
    undefined,
    valueToBigNumber
  )

*Defined in [packages/sdk/contractkit/src/wrappers/LockedPlanq.ts:178](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/LockedPlanq.ts#L178)*

Returns the total amount of non-voting locked planq for an account.

**`param`** The account.

**`returns`** The total amount of non-voting locked planq for an account.

#### Type declaration:

▸ (...`args`: InputArgs): *Promise‹Output›*

**Parameters:**

Name | Type |
------ | ------ |
`...args` | InputArgs |

___

###  getAccountTotalLockedPlanq

• **getAccountTotalLockedPlanq**: *function* = proxyCall(
    this.contract.methods.getAccountTotalLockedPlanq,
    undefined,
    valueToBigNumber
  )

*Defined in [packages/sdk/contractkit/src/wrappers/LockedPlanq.ts:156](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/LockedPlanq.ts#L156)*

Returns the total amount of locked planq for an account.

**`param`** The account.

**`returns`** The total amount of locked planq for an account.

#### Type declaration:

▸ (...`args`: InputArgs): *Promise‹Output›*

**Parameters:**

Name | Type |
------ | ------ |
`...args` | InputArgs |

___

###  getTotalLockedPlanq

• **getTotalLockedPlanq**: *function* = proxyCall(
    this.contract.methods.getTotalLockedPlanq,
    undefined,
    valueToBigNumber
  )

*Defined in [packages/sdk/contractkit/src/wrappers/LockedPlanq.ts:167](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/LockedPlanq.ts#L167)*

Returns the total amount of locked planq in the system. Note that this does not include
  planq that has been unlocked but not yet withdrawn.

**`returns`** The total amount of locked planq in the system.

#### Type declaration:

▸ (...`args`: InputArgs): *Promise‹Output›*

**Parameters:**

Name | Type |
------ | ------ |
`...args` | InputArgs |

___

###  lock

• **lock**: *function* = proxySend(this.connection, this.contract.methods.lock)

*Defined in [packages/sdk/contractkit/src/wrappers/LockedPlanq.ts:81](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/LockedPlanq.ts#L81)*

Locks planq to be used for voting.
The planq to be locked, must be specified as the `tx.value`

#### Type declaration:

▸ (...`args`: InputArgs): *PlanqTransactionObject‹Output›*

**Parameters:**

Name | Type |
------ | ------ |
`...args` | InputArgs |

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

###  unlock

• **unlock**: *function* = proxySend(
    this.connection,
    this.contract.methods.unlock,
    tupleParser(valueToString)
  )

*Defined in [packages/sdk/contractkit/src/wrappers/LockedPlanq.ts:87](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/LockedPlanq.ts#L87)*

Unlocks planq that becomes withdrawable after the unlocking period.

**`param`** The amount of planq to unlock.

#### Type declaration:

▸ (`value`: BigNumber.Value): *PlanqTransactionObject‹void›*

**Parameters:**

Name | Type |
------ | ------ |
`value` | BigNumber.Value |

___

###  withdraw

• **withdraw**: *function* = proxySend(
    this.connection,
    this.contract.methods.withdraw
  )

*Defined in [packages/sdk/contractkit/src/wrappers/LockedPlanq.ts:72](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/LockedPlanq.ts#L72)*

Withdraws a planq that has been unlocked after the unlocking period has passed.

**`param`** The index of the pending withdrawal to withdraw.

#### Type declaration:

▸ (`index`: number): *PlanqTransactionObject‹void›*

**Parameters:**

Name | Type |
------ | ------ |
`index` | number |

## Accessors

###  address

• **get address**(): *string*

*Inherited from [BaseWrapper](_wrappers_basewrapper_.basewrapper.md).[address](_wrappers_basewrapper_.basewrapper.md#address)*

*Defined in [packages/sdk/contractkit/src/wrappers/BaseWrapper.ts:37](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/BaseWrapper.ts#L37)*

Contract address

**Returns:** *string*

## Methods

###  computeInitialParametersForSlashing

▸ **computeInitialParametersForSlashing**(`account`: string, `penalty`: BigNumber): *Promise‹object›*

*Defined in [packages/sdk/contractkit/src/wrappers/LockedPlanq.ts:266](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/LockedPlanq.ts#L266)*

Computes parameters for slashing `penalty` from `account`.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`account` | string | The account to slash. |
`penalty` | BigNumber | The amount to slash as penalty. |

**Returns:** *Promise‹object›*

List of (group, voting planq) to decrement from `account`.

___

###  computeParametersForSlashing

▸ **computeParametersForSlashing**(`account`: string, `penalty`: BigNumber, `groups`: AddressListItem[]): *Promise‹object›*

*Defined in [packages/sdk/contractkit/src/wrappers/LockedPlanq.ts:273](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/LockedPlanq.ts#L273)*

**Parameters:**

Name | Type |
------ | ------ |
`account` | string |
`penalty` | BigNumber |
`groups` | AddressListItem[] |

**Returns:** *Promise‹object›*

___

###  getAccountSummary

▸ **getAccountSummary**(`account`: string): *Promise‹AccountSummary›*

*Defined in [packages/sdk/contractkit/src/wrappers/LockedPlanq.ts:206](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/LockedPlanq.ts#L206)*

**Parameters:**

Name | Type |
------ | ------ |
`account` | string |

**Returns:** *Promise‹AccountSummary›*

___

###  getAccountsSlashed

▸ **getAccountsSlashed**(`epochNumber`: number): *Promise‹[AccountSlashed](../interfaces/_wrappers_lockedplanq_.accountslashed.md)[]›*

*Defined in [packages/sdk/contractkit/src/wrappers/LockedPlanq.ts:243](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/LockedPlanq.ts#L243)*

Retrieves AccountSlashed for epochNumber.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`epochNumber` | number | The epoch to retrieve AccountSlashed at.  |

**Returns:** *Promise‹[AccountSlashed](../interfaces/_wrappers_lockedplanq_.accountslashed.md)[]›*

___

###  getConfig

▸ **getConfig**(): *Promise‹[LockedPlanqConfig](../interfaces/_wrappers_lockedplanq_.lockedplanqconfig.md)›*

*Defined in [packages/sdk/contractkit/src/wrappers/LockedPlanq.ts:187](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/LockedPlanq.ts#L187)*

Returns current configuration parameters.

**Returns:** *Promise‹[LockedPlanqConfig](../interfaces/_wrappers_lockedplanq_.lockedplanqconfig.md)›*

___

###  getHumanReadableConfig

▸ **getHumanReadableConfig**(): *Promise‹object›*

*Defined in [packages/sdk/contractkit/src/wrappers/LockedPlanq.ts:198](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/LockedPlanq.ts#L198)*

**`dev`** Returns human readable configuration of the lockedplanq contract

**Returns:** *Promise‹object›*

LockedPlanqConfig object

___

###  getPastEvents

▸ **getPastEvents**(`event`: Events‹LockedPlanq›, `options`: PastEventOptions): *Promise‹EventLog[]›*

*Inherited from [BaseWrapper](_wrappers_basewrapper_.basewrapper.md).[getPastEvents](_wrappers_basewrapper_.basewrapper.md#getpastevents)*

*Defined in [packages/sdk/contractkit/src/wrappers/BaseWrapper.ts:57](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/BaseWrapper.ts#L57)*

Contract getPastEvents

**Parameters:**

Name | Type |
------ | ------ |
`event` | Events‹LockedPlanq› |
`options` | PastEventOptions |

**Returns:** *Promise‹EventLog[]›*

___

###  getPendingWithdrawals

▸ **getPendingWithdrawals**(`account`: string): *Promise‹[PendingWithdrawal](../interfaces/_wrappers_lockedplanq_.pendingwithdrawal.md)[]›*

*Defined in [packages/sdk/contractkit/src/wrappers/LockedPlanq.ts:227](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/LockedPlanq.ts#L227)*

Returns the pending withdrawals from unlocked planq for an account.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`account` | string | The address of the account. |

**Returns:** *Promise‹[PendingWithdrawal](../interfaces/_wrappers_lockedplanq_.pendingwithdrawal.md)[]›*

The value and timestamp for each pending withdrawal.

___

###  getPendingWithdrawalsTotalValue

▸ **getPendingWithdrawalsTotalValue**(`account`: Address): *Promise‹BigNumber‹››*

*Defined in [packages/sdk/contractkit/src/wrappers/LockedPlanq.ts:93](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/LockedPlanq.ts#L93)*

**Parameters:**

Name | Type |
------ | ------ |
`account` | Address |

**Returns:** *Promise‹BigNumber‹››*

___

###  relock

▸ **relock**(`account`: Address, `value`: BigNumber.Value): *Promise‹Array‹PlanqTransactionObject‹void›››*

*Defined in [packages/sdk/contractkit/src/wrappers/LockedPlanq.ts:105](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/LockedPlanq.ts#L105)*

Relocks planq that has been unlocked but not withdrawn.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`account` | Address | - |
`value` | BigNumber.Value | The value to relock from pending withdrawals.  |

**Returns:** *Promise‹Array‹PlanqTransactionObject‹void›››*

___

###  version

▸ **version**(): *Promise‹NonNullable‹T["methods"] extends object ? ContractVersion<> : never››*

*Inherited from [BaseWrapper](_wrappers_basewrapper_.basewrapper.md).[version](_wrappers_basewrapper_.basewrapper.md#version)*

*Defined in [packages/sdk/contractkit/src/wrappers/BaseWrapper.ts:41](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/wrappers/BaseWrapper.ts#L41)*

**Returns:** *Promise‹NonNullable‹T["methods"] extends object ? ContractVersion<> : never››*
