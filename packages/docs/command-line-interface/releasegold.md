# `planqcli releaseplanq`

View and manage Release Planq contracts


## `planqcli releaseplanq:authorize`

Authorize an alternative key to be used for a given action (Vote, Validate, Attest) on behalf of the ReleasePlanq instance contract.

```
Authorize an alternative key to be used for a given action (Vote, Validate, Attest) on behalf of the ReleasePlanq instance contract.

USAGE
  $ planqcli releaseplanq:authorize

OPTIONS
  --blsKey=0x                                            The BLS public key that the
                                                         validator is using for
                                                         consensus, should pass proof of
                                                         possession. 96 bytes.

  --blsPop=0x                                            The BLS public key
                                                         proof-of-possession, which
                                                         consists of a signature on the
                                                         account address. 48 bytes.

  --contract=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  (required) Address of the
                                                         ReleasePlanq Contract

  --globalHelp                                           View all available global flags

  --role=vote|validator|attestation                      (required)

  --signature=0x                                         (required) Signature (a.k.a.
                                                         proof-of-possession) of the
                                                         signer key

  --signer=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d    (required) The signer key that
                                                         is to be used for voting
                                                         through the ReleasePlanq
                                                         instance

EXAMPLES
  authorize --contract 0x5409ED021D9299bf6814279A6A1411A7e866A631 --role vote --signer
  0x6ecbe1db9ef729cbe972c83fb886247691fb6beb --signature
  0x1b9fca4bbb5bfb1dbe69ef1cddbd9b4202dcb6b134c5170611e1e36ecfa468d7b46c85328d504934fce6
  c2a1571603a50ae224d2b32685e84d4d1a1eebad8452eb

  authorize --contract 0x5409ED021D9299bf6814279A6A1411A7e866A631 --role validator
  --signer 0x6ecbe1db9ef729cbe972c83fb886247691fb6beb --signature
  0x1b9fca4bbb5bfb1dbe69ef1cddbd9b4202dcb6b134c5170611e1e36ecfa468d7b46c85328d504934fce6
  c2a1571603a50ae224d2b32685e84d4d1a1eebad8452eb --blsKey
  0x4fa3f67fc913878b068d1fa1cdddc54913d3bf988dbe5a36a20fa888f20d4894c408a6773f3d7bde1115
  4f2a3076b700d345a42fd25a0e5e83f4db5586ac7979ac2053cd95d8f2efd3e959571ceccaa743e02cf4be
  3f5d7aaddb0b06fc9aff00 --blsPop
  0xcdb77255037eb68897cd487fdd85388cbda448f617f874449d4b11588b0b7ad8ddc20d9bb450b513bb35
  664ea3923900

  authorize --contract 0x5409ED021D9299bf6814279A6A1411A7e866A631 --role attestation
  --signer 0x6ecbe1db9ef729cbe972c83fb886247691fb6beb --signature
  0x1b9fca4bbb5bfb1dbe69ef1cddbd9b4202dcb6b134c5170611e1e36ecfa468d7b46c85328d504934fce6
  c2a1571603a50ae224d2b32685e84d4d1a1eebad8452eb
```

_See code: [src/commands/releaseplanq/authorize.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/releaseplanq/authorize.ts)_

## `planqcli releaseplanq:create-account`

Creates a new account for the ReleasePlanq instance

```
Creates a new account for the ReleasePlanq instance

USAGE
  $ planqcli releaseplanq:create-account

OPTIONS
  --contract=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  (required) Address of the
                                                         ReleasePlanq Contract

  --globalHelp                                           View all available global flags

EXAMPLE
  create-account --contract 0x5409ED021D9299bf6814279A6A1411A7e866A631
```

_See code: [src/commands/releaseplanq/create-account.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/releaseplanq/create-account.ts)_

## `planqcli releaseplanq:locked-planq`

Perform actions [lock, unlock, withdraw] on PLQ that has been locked via the provided ReleasePlanq contract.

```
Perform actions [lock, unlock, withdraw] on PLQ that has been locked via the provided ReleasePlanq contract.

USAGE
  $ planqcli releaseplanq:locked-planq

OPTIONS
  -a, --action=lock|unlock|withdraw                      (required) Action to perform on
                                                         contract's planq

  --contract=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  (required) Address of the
                                                         ReleasePlanq Contract

  --globalHelp                                           View all available global flags

  --value=10000000000000000000000                        (required) Amount of planq to
                                                         perform `action` with

  --yes                                                  Answer yes to prompt

EXAMPLES
  locked-planq --contract 0xCcc8a47BE435F1590809337BB14081b256Ae26A8 --action lock
  --value 10000000000000000000000

  locked-planq --contract 0xCcc8a47BE435F1590809337BB14081b256Ae26A8 --action unlock
  --value 10000000000000000000000

  locked-planq --contract 0xCcc8a47BE435F1590809337BB14081b256Ae26A8 --action withdraw
  --value 10000000000000000000000
```

_See code: [src/commands/releaseplanq/locked-planq.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/releaseplanq/locked-planq.ts)_

## `planqcli releaseplanq:refund-and-finalize`

Refund the given contract's balance to the appopriate parties and destroy the contact. Can only be called by the release owner of revocable ReleasePlanq instances.

```
Refund the given contract's balance to the appopriate parties and destroy the contact. Can only be called by the release owner of revocable ReleasePlanq instances.

USAGE
  $ planqcli releaseplanq:refund-and-finalize

OPTIONS
  --contract=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  (required) Address of the
                                                         ReleasePlanq Contract

  --globalHelp                                           View all available global flags

EXAMPLE
  refund-and-finalize --contract 0x5409ED021D9299bf6814279A6A1411A7e866A631
```

_See code: [src/commands/releaseplanq/refund-and-finalize.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/releaseplanq/refund-and-finalize.ts)_

## `planqcli releaseplanq:revoke`

Revoke the given contract instance. Once revoked, any Locked Planq can be unlocked by the release owner. The beneficiary will then be able to withdraw any released Planq that had yet to be withdrawn, and the remainder can be transferred by the release owner to the refund address. Note that not all ReleasePlanq instances are revokable.

```
Revoke the given contract instance. Once revoked, any Locked Planq can be unlocked by the release owner. The beneficiary will then be able to withdraw any released Planq that had yet to be withdrawn, and the remainder can be transferred by the release owner to the refund address. Note that not all ReleasePlanq instances are revokable.

USAGE
  $ planqcli releaseplanq:revoke

OPTIONS
  --contract=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  (required) Address of the
                                                         ReleasePlanq Contract

  --globalHelp                                           View all available global flags

  --yesreally                                            Override prompt to set
                                                         liquidity (be careful!)

EXAMPLE
  revoke --contract 0x5409ED021D9299bf6814279A6A1411A7e866A631
```

_See code: [src/commands/releaseplanq/revoke.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/releaseplanq/revoke.ts)_

## `planqcli releaseplanq:revoke-votes`

Revokes `votes` for the given contract's account from the given group's account

```
Revokes `votes` for the given contract's account from the given group's account

USAGE
  $ planqcli releaseplanq:revoke-votes

OPTIONS
  --allGroups                                            Revoke all votes from all
                                                         groups

  --allVotes                                             Revoke all votes

  --contract=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  (required) Address of the
                                                         ReleasePlanq Contract

  --globalHelp                                           View all available global flags

  --group=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d     Address of the group to revoke
                                                         votes from

  --votes=votes                                          The number of votes to revoke

EXAMPLES
  revoke-votes --contract 0x47e172F6CfB6c7D01C1574fa3E2Be7CC73269D95 --group
  0x5409ED021D9299bf6814279A6A1411A7e866A631 --votes 100

  revoke-votes --contract 0x47e172F6CfB6c7D01C1574fa3E2Be7CC73269D95 --allVotes
  --allGroups
```

_See code: [src/commands/releaseplanq/revoke-votes.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/releaseplanq/revoke-votes.ts)_

## `planqcli releaseplanq:set-account`

Set account properties of the ReleasePlanq instance account such as name, data encryption key, and the metadata URL

```
Set account properties of the ReleasePlanq instance account such as name, data encryption key, and the metadata URL

USAGE
  $ planqcli releaseplanq:set-account

OPTIONS
  -p, --property=name|dataEncryptionKey|metaURL          (required) Property type to set

  -v, --value=value                                      (required) Property value to
                                                         set

  --contract=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  (required) Address of the
                                                         ReleasePlanq Contract

  --globalHelp                                           View all available global flags

EXAMPLES
  set-account --contract 0x5719118266779B58D0f9519383A4A27aA7b829E5 --property name
  --value mywallet

  set-account --contract 0x5719118266779B58D0f9519383A4A27aA7b829E5 --property
  dataEncryptionKey --value
  0x041bb96e35f9f4b71ca8de561fff55a249ddf9d13ab582bdd09a09e75da68ae4cd0ab7038030f41b2374
  98b4d76387ae878dc8d98fd6f6db2c15362d1a3bf11216

  set-account --contract 0x5719118266779B58D0f9519383A4A27aA7b829E5 --property metaURL
  --value www.test.com
```

_See code: [src/commands/releaseplanq/set-account.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/releaseplanq/set-account.ts)_

## `planqcli releaseplanq:set-account-wallet-address`

Set the ReleasePlanq contract account's wallet address

```
Set the ReleasePlanq contract account's wallet address

USAGE
  $ planqcli releaseplanq:set-account-wallet-address

OPTIONS
  --contract=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d
      (required) Address of the ReleasePlanq Contract

  --globalHelp
      View all available global flags

  --pop=pop
      ECDSA PoP for signer over contract's account

  --walletAddress=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d
      (required) Address of wallet to set for contract's account and signer of PoP. 0x0 if
      owner wants payers to contact them directly.

EXAMPLE
  set-account-wallet-address --contract 0x5409ED021D9299bf6814279A6A1411A7e866A631
  --walletAddress 0xE36Ea790bc9d7AB70C55260C66D52b1eca985f84 --pop
  0x1b3e611d05e46753c43444cdc55c2cc3d95c54da0eba2464a8cc8cb01bd57ae8bb3d82a0e293ca97e581
  3e7fb9b624127f42ef0871d025d8a56fe2f8f08117e25b
```

_See code: [src/commands/releaseplanq/set-account-wallet-address.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/releaseplanq/set-account-wallet-address.ts)_

## `planqcli releaseplanq:set-beneficiary`

Set the beneficiary of the ReleasePlanq contract. This command is gated via a multi-sig, so this is expected to be called twice: once by the contract's beneficiary and once by the contract's releaseOwner. Once both addresses call this command with the same parameters, the tx will execute.

```
Set the beneficiary of the ReleasePlanq contract. This command is gated via a multi-sig, so this is expected to be called twice: once by the contract's beneficiary and once by the contract's releaseOwner. Once both addresses call this command with the same parameters, the tx will execute.

USAGE
  $ planqcli releaseplanq:set-beneficiary

OPTIONS
  --beneficiary=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  (required) Address of the
                                                            new beneficiary

  --contract=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d     (required) Address of the
                                                            ReleasePlanq Contract

  --from=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d         (required) Address to submit
                                                            multisig transaction from
                                                            (one of the owners)

  --globalHelp                                              View all available global
                                                            flags

  --yesreally                                               Override prompt to set new
                                                            beneficiary (be careful!)

EXAMPLE
  set-beneficiary --contract 0x5409ED021D9299bf6814279A6A1411A7e866A631 --from
  0xE36Ea790bc9d7AB70C55260C66D52b1eca985f84 --beneficiary
  0x6Ecbe1DB9EF729CBe972C83Fb886247691Fb6beb
```

_See code: [src/commands/releaseplanq/set-beneficiary.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/releaseplanq/set-beneficiary.ts)_

## `planqcli releaseplanq:set-can-expire`

Set the canExpire flag for the given ReleasePlanq contract

```
Set the canExpire flag for the given ReleasePlanq contract

USAGE
  $ planqcli releaseplanq:set-can-expire

OPTIONS
  --contract=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  (required) Address of the
                                                         ReleasePlanq Contract

  --globalHelp                                           View all available global flags

  --value=(true|false|True|False)                        (required) canExpire value

  --yesreally                                            Override prompt to set
                                                         expiration flag (be careful!)

EXAMPLE
  set-can-expire --contract 0x5409ED021D9299bf6814279A6A1411A7e866A631 --value true
```

_See code: [src/commands/releaseplanq/set-can-expire.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/releaseplanq/set-can-expire.ts)_

## `planqcli releaseplanq:set-liquidity-provision`

Set the liquidity provision to true, allowing the beneficiary to withdraw released planq.

```
Set the liquidity provision to true, allowing the beneficiary to withdraw released planq.

USAGE
  $ planqcli releaseplanq:set-liquidity-provision

OPTIONS
  --contract=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  (required) Address of the
                                                         ReleasePlanq Contract

  --globalHelp                                           View all available global flags

  --yesreally                                            Override prompt to set
                                                         liquidity (be careful!)

EXAMPLE
  set-liquidity-provision --contract 0x5409ED021D9299bf6814279A6A1411A7e866A631
```

_See code: [src/commands/releaseplanq/set-liquidity-provision.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/releaseplanq/set-liquidity-provision.ts)_

## `planqcli releaseplanq:set-max-distribution`

Set the maximum distribution of planq for the given contract

```
Set the maximum distribution of planq for the given contract

USAGE
  $ planqcli releaseplanq:set-max-distribution

OPTIONS
  --contract=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  (required) Address of the
                                                         ReleasePlanq Contract

  --distributionRatio=distributionRatio                  (required) Amount in range [0,
                                                         1000] (3 significant figures)
                                                         indicating % of total balance
                                                         available for distribution.

  --globalHelp                                           View all available global flags

  --yesreally                                            Override prompt to set new
                                                         maximum distribution (be
                                                         careful!)

EXAMPLE
  set-max-distribution --contract 0x5409ED021D9299bf6814279A6A1411A7e866A631
  --distributionRatio 1000
```

_See code: [src/commands/releaseplanq/set-max-distribution.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/releaseplanq/set-max-distribution.ts)_

## `planqcli releaseplanq:show`

Show info on a ReleasePlanq instance contract.

```
Show info on a ReleasePlanq instance contract.

USAGE
  $ planqcli releaseplanq:show

OPTIONS
  --contract=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  (required) Address of the
                                                         ReleasePlanq Contract

  --globalHelp                                           View all available global flags

EXAMPLE
  show --contract 0x47e172F6CfB6c7D01C1574fa3E2Be7CC73269D95
```

_See code: [src/commands/releaseplanq/show.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/releaseplanq/show.ts)_

## `planqcli releaseplanq:transfer-dollars`

Transfer Planq Dollars from the given contract address. Dollars may be accrued to the ReleasePlanq contract via validator epoch rewards.

```
Transfer Planq Dollars from the given contract address. Dollars may be accrued to the ReleasePlanq contract via validator epoch rewards.

USAGE
  $ planqcli releaseplanq:transfer-dollars

OPTIONS
  --contract=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  (required) Address of the
                                                         ReleasePlanq Contract

  --globalHelp                                           View all available global flags

  --to=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d        (required) Address of the
                                                         recipient of Planq Dollars
                                                         transfer

  --value=10000000000000000000000                        (required) Value (in Wei) of
                                                         Planq Dollars to transfer

EXAMPLE
  transfer-dollars --contract 0x5409ED021D9299bf6814279A6A1411A7e866A631 --to
  0x6Ecbe1DB9EF729CBe972C83Fb886247691Fb6beb --value 10000000000000000000000
```

_See code: [src/commands/releaseplanq/transfer-dollars.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/releaseplanq/transfer-dollars.ts)_

## `planqcli releaseplanq:withdraw`

Withdraws `value` released planq to the beneficiary address. Fails if `value` worth of planq has not been released yet.

```
Withdraws `value` released planq to the beneficiary address. Fails if `value` worth of planq has not been released yet.

USAGE
  $ planqcli releaseplanq:withdraw

OPTIONS
  --contract=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  (required) Address of the
                                                         ReleasePlanq Contract

  --globalHelp                                           View all available global flags

  --value=10000000000000000000000                        (required) Amount of released
                                                         planq (in wei) to withdraw

EXAMPLE
  withdraw --contract 0x5409ED021D9299bf6814279A6A1411A7e866A631 --value
  10000000000000000000000
```

_See code: [src/commands/releaseplanq/withdraw.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/releaseplanq/withdraw.ts)_
