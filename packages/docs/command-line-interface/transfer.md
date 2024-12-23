# `planqcli transfer`

Transfer PLQ and Planq Dollars


## `planqcli transfer:planq`

Transfer PLQ to a specified address. (Note: this is the equivalent of the old transfer:planq)

```
Transfer PLQ to a specified address. (Note: this is the equivalent of the old transfer:planq)

USAGE
  $ planqcli transfer:celo

OPTIONS
  --comment=comment                                  Transfer comment
  --from=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  (required) Address of the sender
  --globalHelp                                       View all available global flags
  --to=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d    (required) Address of the receiver

  --value=value                                      (required) Amount to transfer (in
                                                     wei)

EXAMPLE
  planq --from 0xa0Af2E71cECc248f4a7fD606F203467B500Dd53B --to
  0x5409ed021d9299bf6814279a6a1411a7e866a631 --value 10000000000000000000
```

_See code: [src/commands/transfer/planq.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/transfer/planq.ts)_

## `planqcli transfer:dollars`

Transfer Planq Dollars (pUSD) to a specified address.

```
Transfer Planq Dollars (pUSD) to a specified address.

USAGE
  $ planqcli transfer:dollars

OPTIONS
  --comment=comment                                  Transfer comment
  --from=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  (required) Address of the sender
  --globalHelp                                       View all available global flags
  --to=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d    (required) Address of the receiver

  --value=value                                      (required) Amount to transfer (in
                                                     wei)

EXAMPLE
  dollars --from 0xa0Af2E71cECc248f4a7fD606F203467B500Dd53B --to
  0x5409ed021d9299bf6814279a6a1411a7e866a631 --value 1000000000000000000
```

_See code: [src/commands/transfer/dollars.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/transfer/dollars.ts)_

## `planqcli transfer:erc20`

Transfer ERC20 to a specified address

```
Transfer ERC20 to a specified address

USAGE
  $ planqcli transfer:erc20

OPTIONS
  --erc20Address=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  (required) Custom erc20 to
                                                             check it's balance too

  --from=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d          (required) Address of the
                                                             sender

  --globalHelp                                               View all available global
                                                             flags

  --to=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d            (required) Address of the
                                                             receiver

  --value=value                                              (required) Amount to
                                                             transfer (in wei)

EXAMPLE
  erc20 --erc20Address 0x765DE816845861e75A25fCA122bb6898B8B1282a --from
  0xa0Af2E71cECc248f4a7fD606F203467B500Dd53B --to
  0x5409ed021d9299bf6814279a6a1411a7e866a631 --value 10000000000000000000
```

_See code: [src/commands/transfer/erc20.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/transfer/erc20.ts)_

## `planqcli transfer:euros`

Transfer Planq Euros (pEUR) to a specified address.

```
Transfer Planq Euros (pEUR) to a specified address.

USAGE
  $ planqcli transfer:euros

OPTIONS
  --comment=comment                                  Transfer comment
  --from=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  (required) Address of the sender
  --globalHelp                                       View all available global flags
  --to=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d    (required) Address of the receiver

  --value=value                                      (required) Amount to transfer (in
                                                     wei)

EXAMPLE
  euros --from 0xa0Af2E71cECc248f4a7fD606F203467B500Dd53B --to
  0x5409ed021d9299bf6814279a6a1411a7e866a631 --value 1000000000000000000
```

_See code: [src/commands/transfer/euros.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/transfer/euros.ts)_

## `planqcli transfer:planq`

Transfer PLQ to a specified address. _DEPRECATION WARNING_ Use the "transfer:planq" command instead

```
Transfer PLQ to a specified address. *DEPRECATION WARNING* Use the "transfer:planq" command instead

USAGE
  $ planqcli transfer:planq

OPTIONS
  --comment=comment                                  Transfer comment
  --from=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  (required) Address of the sender
  --globalHelp                                       View all available global flags
  --to=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d    (required) Address of the receiver

  --value=value                                      (required) Amount to transfer (in
                                                     wei)

EXAMPLE
  planq --from 0xa0Af2E71cECc248f4a7fD606F203467B500Dd53B --to
  0x5409ed021d9299bf6814279a6a1411a7e866a631 --value 10000000000000000000
```

_See code: [src/commands/transfer/planq.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/transfer/planq.ts)_

## `planqcli transfer:reals`

Transfer Planq Brazilian Real (pREAL) to a specified address.

```
Transfer Planq Brazilian Real (pREAL) to a specified address.

USAGE
  $ planqcli transfer:reals

OPTIONS
  --comment=comment                                  Transfer comment
  --from=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  (required) Address of the sender
  --globalHelp                                       View all available global flags
  --to=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d    (required) Address of the receiver

  --value=value                                      (required) Amount to transfer (in
                                                     wei)

EXAMPLE
  reals --from 0xa0Af2E71cECc248f4a7fD606F203467B500Dd53B --to
  0x5409ed021d9299bf6814279a6a1411a7e866a631 --value 1000000000000000000
```

_See code: [src/commands/transfer/reals.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/transfer/reals.ts)_

## `planqcli transfer:stable`

Transfer a stable token to a specified address.

```
Transfer a stable token to a specified address.

USAGE
  $ planqcli transfer:stable

OPTIONS
  --comment=comment                                  Transfer comment
  --from=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  (required) Address of the sender
  --globalHelp                                       View all available global flags
  --stableToken=(pUSD|pusd|pEUR|peur|pREAL|preal)    Name of the stable to be transfered
  --to=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d    (required) Address of the receiver

  --value=value                                      (required) Amount to transfer (in
                                                     wei)

EXAMPLE
  stable --from 0xa0Af2E71cECc248f4a7fD606F203467B500Dd53B --to
  0x5409ed021d9299bf6814279a6a1411a7e866a631 --value 1000000000000000000 --stableToken
  cStableTokenSymbol
```

_See code: [src/commands/transfer/stable.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/transfer/stable.ts)_
