[@planq-network/network-utils](../README.md) › ["genesis-block-utils"](../modules/_genesis_block_utils_.md) › [GenesisBlockUtils](_genesis_block_utils_.genesisblockutils.md)

# Class: GenesisBlockUtils

## Hierarchy

* **GenesisBlockUtils**

## Index

### Methods

* [getChainIdFromGenesis](_genesis_block_utils_.genesisblockutils.md#static-getchainidfromgenesis)
* [getGenesisBlockAsync](_genesis_block_utils_.genesisblockutils.md#static-getgenesisblockasync)

## Methods

### `Static` getChainIdFromGenesis

▸ **getChainIdFromGenesis**(`genesis`: string): *number*

*Defined in [genesis-block-utils.ts:22](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/network-utils/src/genesis-block-utils.ts#L22)*

**Parameters:**

Name | Type |
------ | ------ |
`genesis` | string |

**Returns:** *number*

___

### `Static` getGenesisBlockAsync

▸ **getGenesisBlockAsync**(`networkName`: string): *Promise‹string›*

*Defined in [genesis-block-utils.ts:14](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/network-utils/src/genesis-block-utils.ts#L14)*

Fetches the genesis block (as JSON data) from Google Storage.
If the network is not working, the method will reject the returned promise
along with the response data from Google api.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`networkName` | string | Name of the network to fetch genesis block for  |

**Returns:** *Promise‹string›*
