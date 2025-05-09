# `planqcli multisig`

Shows information about multi-sig contract


## `planqcli multisig:show ADDRESS`

Shows information about multi-sig contract

```
Shows information about multi-sig contract

USAGE
  $ planqcli multisig:show ADDRESS

OPTIONS
  --all         Show info about all transactions
  --globalHelp  View all available global flags
  --raw         Do not attempt to parse transactions
  --tx=tx       Show info for a transaction

EXAMPLES
  show 0x5409ed021d9299bf6814279a6a1411a7e866a631

  show 0x5409ed021d9299bf6814279a6a1411a7e866a631 --tx 3

  show 0x5409ed021d9299bf6814279a6a1411a7e866a631 --all --raw
```

_See code: [src/commands/multisig/show.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/multisig/show.ts)_

## `planqcli multisig:transfer ADDRESS`

Ability to approve PLQ transfers to and from multisig. Submit transaction or approve a matching existing transaction

```
Ability to approve PLQ transfers to and from multisig. Submit transaction or approve a matching existing transaction

USAGE
  $ planqcli multisig:transfer ADDRESS

OPTIONS
  --amount=amount                                      (required) Amount to transfer,
                                                       e.g. 10e18

  --from=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d    (required) Account transferring
                                                       value to the recipient

  --globalHelp                                         View all available global flags

  --sender=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  Identify sender if performing
                                                       transferFrom

  --to=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d      (required) Recipient of transfer

  --transferFrom                                       Perform transferFrom instead of
                                                       transfer in the ERC-20 interface

EXAMPLES
  transfer <multiSigAddr> --to 0x5409ed021d9299bf6814279a6a1411a7e866a631 --amount
  200000e18 --from 0x123abc

  transfer <multiSigAddr> --transferFrom --sender 0x123abc --to
  0x5409ed021d9299bf6814279a6a1411a7e866a631 --amount 200000e18 --from 0x123abc
```

_See code: [src/commands/multisig/transfer.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/multisig/transfer.ts)_
