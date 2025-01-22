# `planqcli config`

Configure CLI options which persist across commands


## `planqcli config:get`

Output network node configuration

```
Output network node configuration

USAGE
  $ planqcli config:get

OPTIONS
  --globalHelp  View all available global flags
```

_See code: [src/commands/config/get.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/config/get.ts)_

## `planqcli config:set`

Configure running node information for propogating transactions to network

```
Configure running node information for propogating transactions to network

USAGE
  $ planqcli config:set

OPTIONS
  -n, --node=node
      URL of the node to run commands against (defaults to 'http://localhost:8545')

  --gasCurrency=(auto|Auto|PLQ|planq|aUSD|ausd|aEUR|aeur|aREAL|areal)
      Use a specific gas currency for transaction fees (defaults to 'auto' which uses
      whatever feeCurrency is available)

  --globalHelp
      View all available global flags

EXAMPLES
  set --node ws://localhost:2500

  set --node <geth-location>/geth.ipc

  set --gasCurrency aUSD

  set --gasCurrency PLQ
```

_See code: [src/commands/config/set.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/config/set.ts)_
