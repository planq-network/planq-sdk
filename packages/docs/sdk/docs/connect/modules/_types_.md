[@planq-network/connect](../README.md) › [Globals](../globals.md) › ["types"](_types_.md)

# Module: "types"

## Index

### References

* [Block](_types_.md#block)
* [BlockHeader](_types_.md#blockheader)
* [BlockNumber](_types_.md#blocknumber)
* [Contract](_types_.md#contract)
* [ContractSendMethod](_types_.md#contractsendmethod)
* [EventLog](_types_.md#eventlog)
* [Log](_types_.md#log)
* [PastEventOptions](_types_.md#pasteventoptions)
* [PromiEvent](_types_.md#promievent)
* [Sign](_types_.md#sign)
* [Syncing](_types_.md#syncing)

### Interfaces

* [PlanqParams](../interfaces/_types_.planqparams.md)
* [PlanqTxObject](../interfaces/_types_.planqtxobject.md)
* [EncodedTransaction](../interfaces/_types_.encodedtransaction.md)
* [JsonRpcPayload](../interfaces/_types_.jsonrpcpayload.md)
* [JsonRpcResponse](../interfaces/_types_.jsonrpcresponse.md)
* [Provider](../interfaces/_types_.provider.md)
* [RLPEncodedTx](../interfaces/_types_.rlpencodedtx.md)

### Type aliases

* [Address](_types_.md#address)
* [Callback](_types_.md#callback)
* [PlanqTx](_types_.md#planqtx)
* [PlanqTxPending](_types_.md#planqtxpending)
* [PlanqTxReceipt](_types_.md#planqtxreceipt)

## References

###  Block

• **Block**:

___

###  BlockHeader

• **BlockHeader**:

___

###  BlockNumber

• **BlockNumber**:

___

###  Contract

• **Contract**:

___

###  ContractSendMethod

• **ContractSendMethod**:

___

###  EventLog

• **EventLog**:

___

###  Log

• **Log**:

___

###  PastEventOptions

• **PastEventOptions**:

___

###  PromiEvent

• **PromiEvent**:

___

###  Sign

• **Sign**:

___

###  Syncing

• **Syncing**:

## Type aliases

###  Address

Ƭ **Address**: *string*

*Defined in [types.ts:4](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/connect/src/types.ts#L4)*

___

###  Callback

Ƭ **Callback**: *function*

*Defined in [types.ts:49](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/connect/src/types.ts#L49)*

#### Type declaration:

▸ (`error`: Error | null, `result?`: T): *void*

**Parameters:**

Name | Type |
------ | ------ |
`error` | Error &#124; null |
`result?` | T |

___

###  PlanqTx

Ƭ **PlanqTx**: *TransactionConfig & Partial‹[PlanqParams](../interfaces/_types_.planqparams.md)›*

*Defined in [types.ts:12](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/connect/src/types.ts#L12)*

___

###  PlanqTxPending

Ƭ **PlanqTxPending**: *Transaction & Partial‹[PlanqParams](../interfaces/_types_.planqparams.md)›*

*Defined in [types.ts:46](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/connect/src/types.ts#L46)*

___

###  PlanqTxReceipt

Ƭ **PlanqTxReceipt**: *TransactionReceipt & Partial‹[PlanqParams](../interfaces/_types_.planqparams.md)›*

*Defined in [types.ts:47](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/connect/src/types.ts#L47)*
