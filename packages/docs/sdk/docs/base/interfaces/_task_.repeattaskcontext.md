[@planq-network/base](../README.md) › ["task"](../modules/_task_.md) › [RepeatTaskContext](_task_.repeattaskcontext.md)

# Interface: RepeatTaskContext

## Hierarchy

* **RepeatTaskContext**

## Index

### Properties

* [executionNumber](_task_.repeattaskcontext.md#executionnumber)

### Methods

* [stopTask](_task_.repeattaskcontext.md#stoptask)

## Properties

###  executionNumber

• **executionNumber**: *number*

*Defined in [packages/sdk/base/src/task.ts:45](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/base/src/task.ts#L45)*

Number of times the task has been executed (starts in 1)

## Methods

###  stopTask

▸ **stopTask**(): *void*

*Defined in [packages/sdk/base/src/task.ts:47](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/base/src/task.ts#L47)*

Flag task to be stopped. Might not be inmediate

**Returns:** *void*
