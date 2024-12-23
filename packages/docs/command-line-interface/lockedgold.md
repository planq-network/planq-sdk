# `planqcli lockedplanq`

View and manage locked PLQ


## `planqcli lockedplanq:lock`

Locks PLQ to be used in governance and validator elections.

```
Locks PLQ to be used in governance and validator elections.

USAGE
  $ planqcli lockedplanq:lock

OPTIONS
  --from=from    (required)
  --globalHelp   View all available global flags
  --value=value  (required) The unit amount of PLQ

EXAMPLE
  lock --from 0x47e172F6CfB6c7D01C1574fa3E2Be7CC73269D95 --value 10000000000000000000000
```

_See code: [src/commands/lockedplanq/lock.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/lockedplanq/lock.ts)_

## `planqcli lockedplanq:show ACCOUNT`

Show Locked Planq information for a given account. This includes the total amount of locked planq, the amount being used for voting in Validator Elections, the Locked Planq balance this account is required to maintain due to a registered Validator or Validator Group, and any pending withdrawals that have been initiated via "lockedplanq:unlock".

```
Show Locked Planq information for a given account. This includes the total amount of locked planq, the amount being used for voting in Validator Elections, the Locked Planq balance this account is required to maintain due to a registered Validator or Validator Group, and any pending withdrawals that have been initiated via "lockedplanq:unlock".

USAGE
  $ planqcli lockedplanq:show ACCOUNT

OPTIONS
  --globalHelp  View all available global flags

EXAMPLE
  show 0x5409ed021d9299bf6814279a6a1411a7e866a631
```

_See code: [src/commands/lockedplanq/show.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/lockedplanq/show.ts)_

## `planqcli lockedplanq:unlock`

Unlocks PLQ, which can be withdrawn after the unlocking period. Unlocked planq will appear as a "pending withdrawal" until the unlocking period is over, after which it can be withdrawn via "lockedplanq:withdraw".

```
Unlocks PLQ, which can be withdrawn after the unlocking period. Unlocked planq will appear as a "pending withdrawal" until the unlocking period is over, after which it can be withdrawn via "lockedplanq:withdraw".

USAGE
  $ planqcli lockedplanq:unlock

OPTIONS
  --from=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  (required) Account Address
  --globalHelp                                       View all available global flags
  --value=value                                      (required) The unit amount of PLQ

EXAMPLE
  unlock --from 0x47e172F6CfB6c7D01C1574fa3E2Be7CC73269D95 --value 500000000
```

_See code: [src/commands/lockedplanq/unlock.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/lockedplanq/unlock.ts)_

## `planqcli lockedplanq:withdraw`

Withdraw any pending withdrawals created via "lockedplanq:unlock" that have become available.

```
Withdraw any pending withdrawals created via "lockedplanq:unlock" that have become available.

USAGE
  $ planqcli lockedplanq:withdraw

OPTIONS
  --from=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  (required) Account Address
  --globalHelp                                       View all available global flags

EXAMPLE
  withdraw --from 0x47e172F6CfB6c7D01C1574fa3E2Be7CC73269D95
```

_See code: [src/commands/lockedplanq/withdraw.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/lockedplanq/withdraw.ts)_
