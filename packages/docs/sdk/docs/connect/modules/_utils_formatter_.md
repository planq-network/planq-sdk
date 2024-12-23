[@planq-network/connect](../README.md) › [Globals](../globals.md) › ["utils/formatter"](_utils_formatter_.md)

# Module: "utils/formatter"

## Index

### Functions

* [hexToNumber](_utils_formatter_.md#hextonumber)
* [inputAddressFormatter](_utils_formatter_.md#inputaddressformatter)
* [inputBlockNumberFormatter](_utils_formatter_.md#inputblocknumberformatter)
* [inputPlanqTxFormatter](_utils_formatter_.md#inputplanqtxformatter)
* [inputDefaultBlockNumberFormatter](_utils_formatter_.md#inputdefaultblocknumberformatter)
* [inputSignFormatter](_utils_formatter_.md#inputsignformatter)
* [outputBigNumberFormatter](_utils_formatter_.md#outputbignumberformatter)
* [outputBlockFormatter](_utils_formatter_.md#outputblockformatter)
* [outputBlockHeaderFormatter](_utils_formatter_.md#outputblockheaderformatter)
* [outputPlanqTxFormatter](_utils_formatter_.md#outputplanqtxformatter)
* [outputPlanqTxReceiptFormatter](_utils_formatter_.md#outputplanqtxreceiptformatter)
* [outputLogFormatter](_utils_formatter_.md#outputlogformatter)

## Functions

###  hexToNumber

▸ **hexToNumber**(`hex?`: undefined | string): *number | undefined*

*Defined in [utils/formatter.ts:171](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/connect/src/utils/formatter.ts#L171)*

**Parameters:**

Name | Type |
------ | ------ |
`hex?` | undefined &#124; string |

**Returns:** *number | undefined*

___

###  inputAddressFormatter

▸ **inputAddressFormatter**(`address?`: undefined | string): *string | undefined*

*Defined in [utils/formatter.ts:216](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/connect/src/utils/formatter.ts#L216)*

**Parameters:**

Name | Type |
------ | ------ |
`address?` | undefined &#124; string |

**Returns:** *string | undefined*

___

###  inputBlockNumberFormatter

▸ **inputBlockNumberFormatter**(`blockNumber`: [BlockNumber](_types_.md#blocknumber)): *undefined | string | number | BN‹› | BigNumber‹›*

*Defined in [utils/formatter.ts:117](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/connect/src/utils/formatter.ts#L117)*

**Parameters:**

Name | Type |
------ | ------ |
`blockNumber` | [BlockNumber](_types_.md#blocknumber) |

**Returns:** *undefined | string | number | BN‹› | BigNumber‹›*

___

###  inputPlanqTxFormatter

▸ **inputPlanqTxFormatter**(`tx`: [PlanqTx](_types_.md#planqtx)): *[PlanqTx](_types_.md#planqtx)*

*Defined in [utils/formatter.ts:19](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/connect/src/utils/formatter.ts#L19)*

Formats the input of a transaction and converts all values to HEX

**Parameters:**

Name | Type |
------ | ------ |
`tx` | [PlanqTx](_types_.md#planqtx) |

**Returns:** *[PlanqTx](_types_.md#planqtx)*

___

###  inputDefaultBlockNumberFormatter

▸ **inputDefaultBlockNumberFormatter**(`blockNumber`: [BlockNumber](_types_.md#blocknumber) | null | undefined): *undefined | string | number | BN‹› | BigNumber‹›*

*Defined in [utils/formatter.ts:109](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/connect/src/utils/formatter.ts#L109)*

**Parameters:**

Name | Type |
------ | ------ |
`blockNumber` | [BlockNumber](_types_.md#blocknumber) &#124; null &#124; undefined |

**Returns:** *undefined | string | number | BN‹› | BigNumber‹›*

___

###  inputSignFormatter

▸ **inputSignFormatter**(`data`: string): *string*

*Defined in [utils/formatter.ts:226](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/connect/src/utils/formatter.ts#L226)*

**Parameters:**

Name | Type |
------ | ------ |
`data` | string |

**Returns:** *string*

___

###  outputBigNumberFormatter

▸ **outputBigNumberFormatter**(`hex`: string): *string*

*Defined in [utils/formatter.ts:212](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/connect/src/utils/formatter.ts#L212)*

**Parameters:**

Name | Type |
------ | ------ |
`hex` | string |

**Returns:** *string*

___

###  outputBlockFormatter

▸ **outputBlockFormatter**(`block`: any): *Block*

*Defined in [utils/formatter.ts:150](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/connect/src/utils/formatter.ts#L150)*

**Parameters:**

Name | Type |
------ | ------ |
`block` | any |

**Returns:** *Block*

___

###  outputBlockHeaderFormatter

▸ **outputBlockHeaderFormatter**(`blockHeader`: any): *BlockHeader*

*Defined in [utils/formatter.ts:135](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/connect/src/utils/formatter.ts#L135)*

**Parameters:**

Name | Type |
------ | ------ |
`blockHeader` | any |

**Returns:** *BlockHeader*

___

###  outputPlanqTxFormatter

▸ **outputPlanqTxFormatter**(`tx`: any): *[PlanqTxPending](_types_.md#planqtxpending)*

*Defined in [utils/formatter.ts:46](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/connect/src/utils/formatter.ts#L46)*

**Parameters:**

Name | Type |
------ | ------ |
`tx` | any |

**Returns:** *[PlanqTxPending](_types_.md#planqtxpending)*

___

###  outputPlanqTxReceiptFormatter

▸ **outputPlanqTxReceiptFormatter**(`receipt`: any): *[PlanqTxReceipt](_types_.md#planqtxreceipt)*

*Defined in [utils/formatter.ts:80](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/connect/src/utils/formatter.ts#L80)*

**Parameters:**

Name | Type |
------ | ------ |
`receipt` | any |

**Returns:** *[PlanqTxReceipt](_types_.md#planqtxreceipt)*

___

###  outputLogFormatter

▸ **outputLogFormatter**(`log`: any): *Log*

*Defined in [utils/formatter.ts:178](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/connect/src/utils/formatter.ts#L178)*

**Parameters:**

Name | Type |
------ | ------ |
`log` | any |

**Returns:** *Log*
