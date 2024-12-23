[@planq-network/contractkit](../README.md) › [Globals](../globals.md) › ["planq-tokens"](_planq_tokens_.md)

# Module: "planq-tokens"

## Index

### References

* [PlanqTokenType](_planq_tokens_.md#planqtokentype)
* [StableToken](_planq_tokens_.md#stabletoken)
* [Token](_planq_tokens_.md#token)

### Classes

* [PlanqTokens](../classes/_planq_tokens_.planqtokens.md)

### Interfaces

* [PlanqTokenInfo](../interfaces/_planq_tokens_.planqtokeninfo.md)
* [StableTokenInfo](../interfaces/_planq_tokens_.stabletokeninfo.md)

### Type aliases

* [PlanqTokenWrapper](_planq_tokens_.md#planqtokenwrapper)
* [EachPlanqToken](_planq_tokens_.md#eachplanqtoken)

### Functions

* [isStableTokenContract](_planq_tokens_.md#isstabletokencontract)

### Object literals

* [planqTokenInfos](_planq_tokens_.md#const-planqtokeninfos)
* [stableTokenInfos](_planq_tokens_.md#const-stabletokeninfos)

## References

###  PlanqTokenType

• **PlanqTokenType**:

___

###  StableToken

• **StableToken**:

___

###  Token

• **Token**:

## Type aliases

###  PlanqTokenWrapper

Ƭ **PlanqTokenWrapper**: *[PlanqTokenWrapper](../classes/_wrappers_planqtokenwrapper_.planqtokenwrapper.md) | [StableTokenWrapper](../classes/_wrappers_stabletokenwrapper_.stabletokenwrapper.md)*

*Defined in [packages/sdk/contractkit/src/planq-tokens.ts:14](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/planq-tokens.ts#L14)*

___

###  EachPlanqToken

Ƭ **EachPlanqToken**: *object*

*Defined in [packages/sdk/contractkit/src/planq-tokens.ts:10](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/planq-tokens.ts#L10)*

#### Type declaration:

## Functions

###  isStableTokenContract

▸ **isStableTokenContract**(`contract`: [PlanqContract](../enums/_base_.planqcontract.md)): *boolean*

*Defined in [packages/sdk/contractkit/src/planq-tokens.ts:275](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/planq-tokens.ts#L275)*

**Parameters:**

Name | Type |
------ | ------ |
`contract` | [PlanqContract](../enums/_base_.planqcontract.md) |

**Returns:** *boolean*

## Object literals

### `Const` planqTokenInfos

### ▪ **planqTokenInfos**: *object*

*Defined in [packages/sdk/contractkit/src/planq-tokens.ts:48](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/planq-tokens.ts#L48)*

Basic info for each supported planq token, including stable tokens

▪ **[Token.PLQ]**: *object*

*Defined in [packages/sdk/contractkit/src/planq-tokens.ts:51](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/planq-tokens.ts#L51)*

* **contract**: *[PlanqToken](../enums/_base_.planqcontract.md#planqtoken)* = PlanqContract.PlanqToken

* **symbol**: *PLQ* = Token.PLQ

___

### `Const` stableTokenInfos

### ▪ **stableTokenInfos**: *object*

*Defined in [packages/sdk/contractkit/src/planq-tokens.ts:27](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/planq-tokens.ts#L27)*

Basic info for each stable token

▪ **[StableToken.pEUR]**: *object*

*Defined in [packages/sdk/contractkit/src/planq-tokens.ts:35](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/planq-tokens.ts#L35)*

* **contract**: *[StableTokenEUR](../enums/_base_.planqcontract.md#stabletokeneur)* = PlanqContract.StableTokenEUR

* **exchangeContract**: *[ExchangeEUR](../enums/_base_.planqcontract.md#exchangeeur)* = PlanqContract.ExchangeEUR

* **symbol**: *pEUR* = StableToken.pEUR

▪ **[StableToken.pREAL]**: *object*

*Defined in [packages/sdk/contractkit/src/planq-tokens.ts:40](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/planq-tokens.ts#L40)*

* **contract**: *[StableTokenBRL](../enums/_base_.planqcontract.md#stabletokenbrl)* = PlanqContract.StableTokenBRL

* **exchangeContract**: *[ExchangeBRL](../enums/_base_.planqcontract.md#exchangebrl)* = PlanqContract.ExchangeBRL

* **symbol**: *pREAL* = StableToken.pREAL

▪ **[StableToken.pUSD]**: *object*

*Defined in [packages/sdk/contractkit/src/planq-tokens.ts:30](https://github.com/planq-network/planq-sdk/blob/master/packages/sdk/contractkit/src/planq-tokens.ts#L30)*

* **contract**: *[StableToken](../enums/_base_.planqcontract.md#stabletoken)* = PlanqContract.StableToken

* **exchangeContract**: *[Exchange](../enums/_base_.planqcontract.md#exchange)* = PlanqContract.Exchange

* **symbol**: *pUSD* = StableToken.pUSD
