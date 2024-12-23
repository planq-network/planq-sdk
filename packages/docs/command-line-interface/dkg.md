# `planqcli dkg`

Publish your locally computed DKG results to the blockchain


## `planqcli dkg:allowlist`

Allowlist an address in the DKG

```
Allowlist an address in the DKG

USAGE
  $ planqcli dkg:allowlist

OPTIONS
  --address=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  (required) DKG Contract Address
  --from=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d     (required) Address of the sender
  --globalHelp                                          View all available global flags

  --participantAddress=participantAddress               (required) Address of the
                                                        participant to allowlist
```

_See code: [src/commands/dkg/allowlist.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/dkg/allowlist.ts)_

## `planqcli dkg:deploy`

Deploys the DKG smart contract

```
Deploys the DKG smart contract

USAGE
  $ planqcli dkg:deploy

OPTIONS
  --from=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  (required) Address of the sender
  --globalHelp                                       View all available global flags

  --phaseDuration=phaseDuration                      (required) Duration of each DKG
                                                     phase in blocks

  --threshold=threshold                              (required) The threshold to use for
                                                     the DKG
```

_See code: [src/commands/dkg/deploy.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/dkg/deploy.ts)_

## `planqcli dkg:get`

Gets data from the contract to run the next phase

```
Gets data from the contract to run the next phase

USAGE
  $ planqcli dkg:get

OPTIONS
  --address=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d                 (required) DKG
                                                                       Contract Address

  --globalHelp                                                         View all
                                                                       available global
                                                                       flags

  --method=(shares|responses|justifications|participants|phase|group)  (required) Getter
                                                                       method to call
```

_See code: [src/commands/dkg/get.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/dkg/get.ts)_

## `planqcli dkg:publish`

Publishes data for each phase of the DKG

```
Publishes data for each phase of the DKG

USAGE
  $ planqcli dkg:publish

OPTIONS
  --address=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  (required) DKG Contract Address

  --data=data                                           (required) Path to the data
                                                        being published

  --from=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d     (required) Address of the sender

  --globalHelp                                          View all available global flags
```

_See code: [src/commands/dkg/publish.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/dkg/publish.ts)_

## `planqcli dkg:register`

Register a public key in the DKG

```
Register a public key in the DKG

USAGE
  $ planqcli dkg:register

OPTIONS
  --address=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  (required) DKG Contract Address
  --blsKey=blsKey                                       (required)
  --from=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d     (required) Address of the sender
  --globalHelp                                          View all available global flags
```

_See code: [src/commands/dkg/register.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/dkg/register.ts)_

## `planqcli dkg:start`

Starts the DKG

```
Starts the DKG

USAGE
  $ planqcli dkg:start

OPTIONS
  --address=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  (required) DKG Contract Address
  --from=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d     (required) Address of the sender
  --globalHelp                                          View all available global flags
```

_See code: [src/commands/dkg/start.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/dkg/start.ts)_
