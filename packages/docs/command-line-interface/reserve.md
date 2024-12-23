# `planqcli reserve`

Shows information about reserve


## `planqcli reserve:status`

Shows information about reserve

```
Shows information about reserve

USAGE
  $ planqcli reserve:status

OPTIONS
  --globalHelp  View all available global flags

EXAMPLE
  status
```

_See code: [src/commands/reserve/status.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/reserve/status.ts)_

## `planqcli reserve:transferplanq`

Transfers reserve planq to other reserve address

```
Transfers reserve planq to other reserve address

USAGE
  $ planqcli reserve:transferplanq

OPTIONS
  --from=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  (required) Spender's address
  --globalHelp                                       View all available global flags
  --to=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d    (required) Receiving address

  --useMultiSig                                      True means the request will be sent
                                                     through multisig.

  --value=value                                      (required) The unit amount of PLQ

EXAMPLES
  transferplanq --value 9000 --to 0x91c987bf62D25945dB517BDAa840A6c661374402 --from
  0x5409ed021d9299bf6814279a6a1411a7e866a631

  transferplanq --value 9000 --to 0x91c987bf62D25945dB517BDAa840A6c661374402 --from
  0x5409ed021d9299bf6814279a6a1411a7e866a631 --useMultiSig
```

_See code: [src/commands/reserve/transferplanq.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/reserve/transferplanq.ts)_
