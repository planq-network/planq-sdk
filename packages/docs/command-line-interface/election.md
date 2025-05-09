# `planqcli election`

Participate in and view the state of Validator Elections


## `planqcli election:activate`

Activate pending votes in validator elections to begin earning rewards. To earn rewards as a voter, it is required to activate your pending votes at some point after the end of the epoch in which they were made.

```
Activate pending votes in validator elections to begin earning rewards. To earn rewards as a voter, it is required to activate your pending votes at some point after the end of the epoch in which they were made.

USAGE
  $ planqcli election:activate

OPTIONS
  --from=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  (required) Voter's address
  --globalHelp                                       View all available global flags

  --wait                                             Wait until all pending votes can be
                                                     activated

EXAMPLES
  activate --from 0x4443d0349e8b3075cba511a0a87796597602a0f1

  activate --from 0x4443d0349e8b3075cba511a0a87796597602a0f1 --wait
```

_See code: [src/commands/election/activate.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/election/activate.ts)_

## `planqcli election:current`

Outputs the set of validators currently participating in BFT to create blocks. An election is run to select the validator set at the end of every epoch.

```
Outputs the set of validators currently participating in BFT to create blocks. An election is run to select the validator set at the end of every epoch.

USAGE
  $ planqcli election:current

OPTIONS
  -x, --extended          show extra columns
  --columns=columns       only show provided columns (comma-separated)
  --csv                   output is csv format [alias: --output=csv]
  --filter=filter         filter property by partial string matching, ex: name=foo
  --globalHelp            View all available global flags
  --no-header             hide table header from output
  --no-truncate           do not truncate output to fit screen
  --output=csv|json|yaml  output in a more machine friendly format
  --sort=sort             property to sort by (prepend '-' for descending)

  --valset                Show currently used signers from valset (by default the
                          authorized validator signers are shown). Useful for checking
                          if keys have been rotated.
```

_See code: [src/commands/election/current.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/election/current.ts)_

## `planqcli election:list`

Prints the list of validator groups, the number of votes they have received, the number of additional votes they are able to receive, and whether or not they are eligible to elect validators.

```
Prints the list of validator groups, the number of votes they have received, the number of additional votes they are able to receive, and whether or not they are eligible to elect validators.

USAGE
  $ planqcli election:list

OPTIONS
  -x, --extended          show extra columns
  --columns=columns       only show provided columns (comma-separated)
  --csv                   output is csv format [alias: --output=csv]
  --filter=filter         filter property by partial string matching, ex: name=foo
  --globalHelp            View all available global flags
  --no-header             hide table header from output
  --no-truncate           do not truncate output to fit screen
  --output=csv|json|yaml  output in a more machine friendly format
  --sort=sort             property to sort by (prepend '-' for descending)

EXAMPLE
  list
```

_See code: [src/commands/election/list.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/election/list.ts)_

## `planqcli election:revoke`

Revoke votes for a Validator Group in validator elections.

```
Revoke votes for a Validator Group in validator elections.

USAGE
  $ planqcli election:revoke

OPTIONS
  --for=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d   (required) ValidatorGroup's address
  --from=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  (required) Voter's address
  --globalHelp                                       View all available global flags
  --value=value                                      (required) Value of votes to revoke

EXAMPLE
  revoke --from 0x4443d0349e8b3075cba511a0a87796597602a0f1 --for
  0x932fee04521f5fcb21949041bf161917da3f588b, --value 1000000
```

_See code: [src/commands/election/revoke.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/election/revoke.ts)_

## `planqcli election:run`

Runs a "mock" election and prints out the validators that would be elected if the epoch ended right now.

```
Runs a "mock" election and prints out the validators that would be elected if the epoch ended right now.

USAGE
  $ planqcli election:run

OPTIONS
  -x, --extended          show extra columns
  --columns=columns       only show provided columns (comma-separated)
  --csv                   output is csv format [alias: --output=csv]
  --filter=filter         filter property by partial string matching, ex: name=foo
  --globalHelp            View all available global flags
  --no-header             hide table header from output
  --no-truncate           do not truncate output to fit screen
  --output=csv|json|yaml  output in a more machine friendly format
  --sort=sort             property to sort by (prepend '-' for descending)
```

_See code: [src/commands/election/run.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/election/run.ts)_

## `planqcli election:show ADDRESS`

Show election information about a voter or registered Validator Group

```
Show election information about a voter or registered Validator Group

USAGE
  $ planqcli election:show ADDRESS

ARGUMENTS
  ADDRESS  Voter or Validator Groups's address

OPTIONS
  --globalHelp  View all available global flags
  --group       Show information about a group running in Validator elections
  --voter       Show information about an account voting in Validator elections

EXAMPLES
  show 0x97f7333c51897469E8D98E7af8653aAb468050a3 --voter

  show 0x97f7333c51897469E8D98E7af8653aAb468050a3 --group
```

_See code: [src/commands/election/show.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/election/show.ts)_

## `planqcli election:vote`

Vote for a Validator Group in validator elections.

```
Vote for a Validator Group in validator elections.

USAGE
  $ planqcli election:vote

OPTIONS
  --for=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d   (required) ValidatorGroup's address
  --from=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  (required) Voter's address
  --globalHelp                                       View all available global flags

  --value=value                                      (required) Amount of Planq used to
                                                     vote for group

EXAMPLE
  vote --from 0x4443d0349e8b3075cba511a0a87796597602a0f1 --for
  0x932fee04521f5fcb21949041bf161917da3f588b, --value 1000000
```

_See code: [src/commands/election/vote.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/election/vote.ts)_
