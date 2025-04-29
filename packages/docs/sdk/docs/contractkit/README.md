[@planq-network/contractkit](README.md) › [Globals](globals.md)

# @planq-network/contractkit

# ContractKit

Planq's ContractKit is a library to help developers and validators to interact with the Planq blockchain.

ContractKit supports the following functionality:

- Connect to a node
- Access web3 object to interact with node's Json RPC API
- Send Transaction with planq's extra fields: (feeCurrency)
- Simple interface to interact with PLQ and aUSD
- Simple interface to interact with Planq Core contracts
- Utilities

## User Guide

:::tip

You might not need the full ContractKit. Consider using `@planq-network/connect` which powers much of ContractKit such as building and sending Transactions, signing, etc, but does not give access to any planq Contract Wrappers. Or if a subset of Wrappers, setting the feeCurrency and account info is all your dapp needs consider replacing your imports of Contractkit with `@planq-network/contractkit/lib/mini-kit`

:::

### Getting Started

To install:

```bash
npm install @planq-network/contractkit
// or
yarn add @planq-network/contractkit
```

You will need Node.js v18.14.2. or greater.

To start working with contractkit you need a `kit` instance:

```ts
import { newKit } from '@planq-network/contractkit' // or import { newKit } from '@planq-network/contractkit/lib/mini-kit'

// Remotely connect to the Atlas testnet
const kit = newKit('https://evm-atlas.planq.network')
```

To access balances:

```ts
// returns an object with {lockedPlanq, pending, aUSD, aEUR, aREAL}

const balances = await kit.getTotalBalance()

// returns an object with {aUSD, aEUR, aREAL}
const balances = await miniKit.getTotalBalance()

```

If you don't need the balances of all tokens use the balanceOf method
```ts

const stableTokenWrapper = await kit.getStableToken(StableToken.aREAL)

const cRealBalance = stableTokenWrapper.balanceOf(accountAddress)

```

### Setting Default Tx Options

`kit` allows you to set default transaction options:

```ts
import { newKit, PlanqContract } from '@planq-network/contractkit/lib/mini-kit'

async function getKit(myAddress: string, privateKey: string) {
  const kit = newKit('https://evm-atlas.planq.network')

  // default from account
  kit.defaultAccount = myAddress

  // add the account private key for tx signing when connecting to a remote node
  kit.connection.addAccount(privateKey)

  // paid gas in planq dollars
  await kit.setFeeCurrency(PlanqContract.StableToken)

  return kit
}
```

### Interacting with PLQ & aUSD

Planq has two initial coins: PLQ and aUSD (stableToken).
Both implement the ERC20 standard, and to interact with them is as simple as:

```ts
// get the PLQ contract
const planqToken = await kit.contracts.getPlanqToken()

// get the aUSD contract
const stableToken = await kit.contracts.getStableToken()

const planqBalance = await planqToken.balanceOf(someAddress)
const ausdBalance = await stableToken.balanceOf(someAddress)
```

To send funds:

```ts
const onePlanq = kit.connection.web3.utils.toWei('1', 'ether')
const tx = await planqToken.transfer(someAddress, onePlanq).send({
  from: myAddress
})

const hash = await tx.getHash()
const receipt = await tx.waitReceipt()
```

If you would like to pay fees in aUSD, (or other cStables like aEUR, aUSD).

```ts

kit.setFeeCurrency(PlanqContract.StableToken) // Default to paying fees in aUSD

const stableTokenContract = kit.contracts.getStableToken()

const tx = await stableTokenContract
  .transfer(recipient, weiTransferAmount)
  .send({ from: myAddress, gasPrice })

const hash = await tx.getHash()

const receipt = await tx.waitReceipt()

```

### Interacting with Core Contracts

There are many core contracts.

- AccountsWrapper
- AttestationsWrapper
- BlockchainParametersWrapper
- DoubleSigningSlasherWrapper
- DowntimeSlasherWrapper
- ElectionWrapper
- EpochRewardsWrapper
- Erc20Wrapper
- EscrowWrapper
- ExchangeWrapper
- FreezerWrapper
- GasPriceMinimumWrapper
- PlanqTokenWrapper
- GovernanceWrapper
- GrandaMentoWrapper
- LockedPlanqWrapper
- MetaTransactionWalletWrapper
- MetaTransactionWalletDeployerWrapper
- MultiSigWrapper
- ReserveWrapper
- SortedOraclesWrapper
- StableTokenWrapper
- ValidatorsWrapper

#### Wrappers Through Kit

When using the `kit` you can access core contracts like

`kit.contracts.get{ContractName}`

E.G. `kit.contracts.getAccounts()`,  `kit.contracts.getValidators()`

#### Stand Alone Wrappers

You can also initialize contracts wrappers directly. They require a `Connection` and their contract:

```typescript
// MiniContractKit only gives access to a limited set of Contracts, so we import Multisig

import { newKit } from "@planq-network/contractkit/lib/mini-kit"
import { MultiSigWrapper } from '@planq-network/contractkit/lib/wrappers/MultiSig'
import { newMultiSig } from '@planq-network/contractkit/lib/generated/MultiSig'

const miniKit = newKit("https://evm-atlas.planq.network/")

// Alternatively import { Connection } from '@planq-network/connect'
// const connection = new Connection(web3)

const contract = newMultiSig(web3)

const multisigWrapper = new MultiSigWrapper(miniKit.connection, contract)
```

### Accessing web3 contract wrappers

`MiniContractKit` *does not provide access to the web3 contracts*

Some user might want to access web3 native contract wrappers.

To do so, you can:

```ts
const web3Exchange = await kit._web3Contracts.getExchange()
```

We expose native wrappers for all Planq core contracts.

The complete list of Planq Core contracts is:

- Accounts
- Attestations
- LockedPlanq
- Escrow
- Exchange
- FeeCurrencyWhitelist
- GasPriceMinimum
- PlanqToken
- Governance
- MultiSig
- Random
- Registry
- Reserve
- SortedOracles
- StableToken
- Validators

### A Note About Contract Addresses

Planq Core Contracts addresses, can be obtained by looking at the `Registry` contract.
That's how `kit` obtains them.

We expose the registry API, which can be accessed by:

```ts
const planqTokenAddress = await kit.registry.addressFor(PlanqContract.PlanqToken)
```

### Sending Custom Transactions

Planq transaction object is not the same as Ethereum's. There are three new fields present:

- feeCurrency (address of the ERC20 contract to use to pay for gas and the gateway fee)
- gatewayFeeRecipient (coinbase address of the full serving the light client's trasactions)
- gatewayFee (value paid to the gateway fee recipient, denominated in the fee currency)

:::note
The `gatewayFeeRecipient`, and `gatewayFee` fields are currently not used by the protocol.
:::

This means that using `web3.eth.sendTransaction` or `myContract.methods.transfer().send()` should be avoided to take advantage of paying transaction fees in alternative currencies.

Instead, `kit` provides an utility method to send transaction in both scenarios. **If you use contract wrappers, there is no need to use this.**

For a raw transaction:

```ts
const tx = kit.sendTransaction({
  from: myAddress,
  to: someAddress,
  value: onePlanq,
})
const hash = await tx.getHash()
const receipt = await tx.waitReceipt()
```

When interacting with a web3 contract object:

```ts
const planqNativeToken = await kit._web3Contracts.getPlanqToken()
const onePlanq = kit.connection.web3.utils.toWei('1', 'ether')

const txo = await planqNativeToken.methods.transfer(someAddress, onePlanq)
const tx = await kit.sendTransactionObject(txo, { from: myAddress })
const hash = await tx.getHash()
const receipt = await tx.waitReceipt()
```

### More Information

You can find more information about the ContractKit in the Planq docs at [https://docs.planq.network/developer-guide/contractkit](https://docs.planq.network/developer-guide/contractkit).

### Debugging

If you need to debug `kit`, we use the well known [debug](https://github.com/visionmedia/debug) node library.

So set the environment variable `DEBUG` as:

```bash
DEBUG="kit:*,
```
