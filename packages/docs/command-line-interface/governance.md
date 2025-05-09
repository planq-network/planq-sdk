# `planqcli governance`

Interact with on-chain governance proposals and hotfixes


## `planqcli governance:build-proposal`

Interactively build a governance proposal

```
Interactively build a governance proposal

USAGE
  $ planqcli governance:build-proposal

OPTIONS
  --afterExecutingID=afterExecutingID              Governance proposal identifier which
                                                   will be executed prior to proposal
                                                   being built

  --afterExecutingProposal=afterExecutingProposal  Path to proposal which will be
                                                   executed prior to proposal being
                                                   built

  --globalHelp                                     View all available global flags

  --output=output                                  [default: proposalTransactions.json]
                                                   Path to output

EXAMPLE
  build-proposal --output ./transactions.json
```

_See code: [src/commands/governance/build-proposal.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/governance/build-proposal.ts)_

## `planqcli governance:dequeue`

Try to dequeue governance proposal

```
Try to dequeue governance proposal

USAGE
  $ planqcli governance:dequeue

OPTIONS
  --from=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  (required) From address
  --globalHelp                                       View all available global flags

EXAMPLE
  dequeue --from 0x5409ed021d9299bf6814279a6a1411a7e866a631
```

_See code: [src/commands/governance/dequeue.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/governance/dequeue.ts)_

## `planqcli governance:execute`

Execute a passing governance proposal

```
Execute a passing governance proposal

USAGE
  $ planqcli governance:execute

OPTIONS
  --from=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  (required) Executor's address
  --globalHelp                                       View all available global flags

  --proposalID=proposalID                            (required) UUID of proposal to
                                                     execute

EXAMPLE
  execute --proposalID 99 --from 0x5409ed021d9299bf6814279a6a1411a7e866a631
```

_See code: [src/commands/governance/execute.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/governance/execute.ts)_

## `planqcli governance:executehotfix`

Execute a governance hotfix prepared for the current epoch

```
Execute a governance hotfix prepared for the current epoch

USAGE
  $ planqcli governance:executehotfix

OPTIONS
  --from=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  (required) Executors's address
  --globalHelp                                       View all available global flags

  --jsonTransactions=jsonTransactions                (required) Path to json
                                                     transactions

  --salt=salt                                        (required) Secret salt associated
                                                     with hotfix

EXAMPLE
  executehotfix --jsonTransactions ./transactions.json --salt
  0x614dccb5ac13cba47c2430bdee7829bb8c8f3603a8ace22e7680d317b39e3658 --from
  0x5409ed021d9299bf6814279a6a1411a7e866a631
```

_See code: [src/commands/governance/executehotfix.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/governance/executehotfix.ts)_

## `planqcli governance:hashhotfix`

Hash a governance hotfix specified by JSON and a salt

```
Hash a governance hotfix specified by JSON and a salt

USAGE
  $ planqcli governance:hashhotfix

OPTIONS
  --force                              Skip execution check
  --globalHelp                         View all available global flags

  --jsonTransactions=jsonTransactions  (required) Path to json transactions of the
                                       hotfix

  --salt=salt                          (required) Secret salt associated with hotfix

EXAMPLE
  hashhotfix --jsonTransactions ./transactions.json --salt
  0x614dccb5ac13cba47c2430bdee7829bb8c8f3603a8ace22e7680d317b39e3658
```

_See code: [src/commands/governance/hashhotfix.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/governance/hashhotfix.ts)_

## `planqcli governance:list`

List live governance proposals (queued and ongoing)

```
List live governance proposals (queued and ongoing)

USAGE
  $ planqcli governance:list

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

_See code: [src/commands/governance/list.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/governance/list.ts)_

## `planqcli governance:preparehotfix`

Prepare a governance hotfix for execution in the current epoch

```
Prepare a governance hotfix for execution in the current epoch

USAGE
  $ planqcli governance:preparehotfix

OPTIONS
  --from=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  (required) Preparer's address
  --globalHelp                                       View all available global flags

  --hash=hash                                        (required) Hash of hotfix
                                                     transactions

EXAMPLE
  preparehotfix --hash
  0x614dccb5ac13cba47c2430bdee7829bb8c8f3603a8ace22e7680d317b39e3658 --from
  0x5409ed021d9299bf6814279a6a1411a7e866a631
```

_See code: [src/commands/governance/preparehotfix.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/governance/preparehotfix.ts)_

## `planqcli governance:propose`

Submit a governance proposal

```
Submit a governance proposal

USAGE
  $ planqcli governance:propose

OPTIONS
  --afterExecutingID=afterExecutingID                Governance proposal identifier
                                                     which will be executed prior to
                                                     proposal

  --afterExecutingProposal=afterExecutingProposal    Path to proposal which will be
                                                     executed prior to proposal

  --deposit=deposit                                  (required) Amount of Planq to attach
                                                     to proposal

  --descriptionURL=descriptionURL                    (required) A URL where further
                                                     information about the proposal can
                                                     be viewed

  --force                                            Skip execution check

  --from=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  (required) Proposer's address

  --globalHelp                                       View all available global flags

  --jsonTransactions=jsonTransactions                (required) Path to json
                                                     transactions

EXAMPLE
  propose --jsonTransactions ./transactions.json --deposit 10000 --from
  0x5409ed021d9299bf6814279a6a1411a7e866a631 --descriptionURL
  https://gist.github.com/yorhodes/46430eacb8ed2f73f7bf79bef9d58a33
```

_See code: [src/commands/governance/propose.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/governance/propose.ts)_

## `planqcli governance:revokeupvote`

Revoke upvotes for queued governance proposals

```
Revoke upvotes for queued governance proposals

USAGE
  $ planqcli governance:revokeupvote

OPTIONS
  --from=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  (required) Upvoter's address
  --globalHelp                                       View all available global flags

EXAMPLE
  revokeupvote --from 0x5409ed021d9299bf6814279a6a1411a7e866a631
```

_See code: [src/commands/governance/revokeupvote.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/governance/revokeupvote.ts)_

## `planqcli governance:show`

Show information about a governance proposal, hotfix, or account.

```
Show information about a governance proposal, hotfix, or account.

USAGE
  $ planqcli governance:show

OPTIONS
  --account=account                                Address of account or voter

  --afterExecutingID=afterExecutingID              Governance proposal identifier which
                                                   will be executed prior to proposal

  --afterExecutingProposal=afterExecutingProposal  Path to proposal which will be
                                                   executed prior to proposal

  --globalHelp                                     View all available global flags

  --hotfix=hotfix                                  Hash of hotfix proposal

  --jsonTransactions=jsonTransactions              Output proposal JSON to provided file

  --nonwhitelisters                                If set, displays validators that have
                                                   not whitelisted the hotfix.

  --notwhitelisted                                 List validators who have not
                                                   whitelisted the specified hotfix

  --proposalID=proposalID                          UUID of proposal to view

  --raw                                            Display proposal in raw bytes format

  --whitelisters                                   If set, displays validators that have
                                                   whitelisted the hotfix.

ALIASES
  $ planqcli governance:show
  $ planqcli governance:showhotfix
  $ planqcli governance:showaccount
  $ planqcli governance:view
  $ planqcli governance:viewhotfix
  $ planqcli governance:viewaccount

EXAMPLES
  show --proposalID 99

  show --proposalID 99 --raw

  show --hotfix 0x614dccb5ac13cba47c2430bdee7829bb8c8f3603a8ace22e7680d317b39e3658

  show --hotfix 0x614dccb5ac13cba47c2430bdee7829bb8c8f3603a8ace22e7680d317b39e3658
  --whitelisters

  show --hotfix 0x614dccb5ac13cba47c2430bdee7829bb8c8f3603a8ace22e7680d317b39e3658
  --nonwhitelisters

  show --account 0x47e172f6cfb6c7d01c1574fa3e2be7cc73269d95
```

_See code: [src/commands/governance/show.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/governance/show.ts)_

## `planqcli governance:upvote`

Upvote a queued governance proposal

```
Upvote a queued governance proposal

USAGE
  $ planqcli governance:upvote

OPTIONS
  --from=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  (required) Upvoter's address
  --globalHelp                                       View all available global flags

  --proposalID=proposalID                            (required) UUID of proposal to
                                                     upvote

EXAMPLE
  upvote --proposalID 99 --from 0x5409ed021d9299bf6814279a6a1411a7e866a631
```

_See code: [src/commands/governance/upvote.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/governance/upvote.ts)_

## `planqcli governance:vote`

Vote on an approved governance proposal

```
Vote on an approved governance proposal

USAGE
  $ planqcli governance:vote

OPTIONS
  --from=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  (required) Voter's address
  --globalHelp                                       View all available global flags

  --proposalID=proposalID                            (required) UUID of proposal to vote
                                                     on

  --value=(Abstain|No|Yes)                           (required) Vote

EXAMPLE
  vote --proposalID 99 --value Yes --from 0x5409ed021d9299bf6814279a6a1411a7e866a631
```

_See code: [src/commands/governance/vote.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/governance/vote.ts)_

## `planqcli governance:votePartially`

Vote partially on an approved governance proposal

```
Vote partially on an approved governance proposal

USAGE
  $ planqcli governance:votePartially

OPTIONS
  --abstain=abstain                                  Abstain votes
  --from=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  (required) Voter's address
  --globalHelp                                       View all available global flags
  --no=no                                            No votes

  --proposalID=proposalID                            (required) UUID of proposal to vote
                                                     on

  --yes=yes                                          Yes votes

EXAMPLE
  vote-partially --proposalID 99 --yes 10 --no 20 --from
  0x5409ed021d9299bf6814279a6a1411a7e866a631
```

_See code: [src/commands/governance/votePartially.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/governance/votePartially.ts)_

## `planqcli governance:whitelisthotfix`

Whitelist a governance hotfix

```
Whitelist a governance hotfix

USAGE
  $ planqcli governance:whitelisthotfix

OPTIONS
  --from=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  (required) Whitelister's address
  --globalHelp                                       View all available global flags

  --hash=hash                                        (required) Hash of hotfix
                                                     transactions

EXAMPLE
  whitelisthotfix --hash
  0x614dccb5ac13cba47c2430bdee7829bb8c8f3603a8ace22e7680d317b39e3658 --from
  0x5409ed021d9299bf6814279a6a1411a7e866a631
```

_See code: [src/commands/governance/whitelisthotfix.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/governance/whitelisthotfix.ts)_

## `planqcli governance:withdraw`

Withdraw refunded governance proposal deposits.

```
Withdraw refunded governance proposal deposits.

USAGE
  $ planqcli governance:withdraw

OPTIONS
  --from=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  (required) Proposer's address
  --globalHelp                                       View all available global flags

EXAMPLE
  withdraw --from 0x5409ed021d9299bf6814279a6a1411a7e866a631
```

_See code: [src/commands/governance/withdraw.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/governance/withdraw.ts)_
