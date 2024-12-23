[@planq-network/base](../README.md) › ["account"](_account_.md)

# Module: "account"

## Index

### Enumerations

* [MnemonicLanguages](../enums/_account_.mnemoniclanguages.md)
* [MnemonicStrength](../enums/_account_.mnemonicstrength.md)

### Interfaces

* [Bip39](../interfaces/_account_.bip39.md)

### Type aliases

* [RandomNumberGenerator](_account_.md#randomnumbergenerator)

### Variables

* [PLQ_DERIVATION_PATH_BASE](_account_.md#const-planq_derivation_path_base)

## Type aliases

###  RandomNumberGenerator

Ƭ **RandomNumberGenerator**: *function*

*Defined in [packages/sdk/base/src/account.ts:20](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/base/src/account.ts#L20)*

#### Type declaration:

▸ (`size`: number, `callback`: function): *void*

**Parameters:**

▪ **size**: *number*

▪ **callback**: *function*

▸ (`err`: [Error](../classes/_result_.rooterror.md#static-error) | null, `buf`: Buffer): *void*

**Parameters:**

Name | Type |
------ | ------ |
`err` | [Error](../classes/_result_.rooterror.md#static-error) &#124; null |
`buf` | Buffer |

## Variables

### `Const` PLQ_DERIVATION_PATH_BASE

• **PLQ_DERIVATION_PATH_BASE**: *"m/44'/60'/0'"* = "m/44'/60'/0'"

*Defined in [packages/sdk/base/src/account.ts:1](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/base/src/account.ts#L1)*
