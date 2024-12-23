# `planqcli grandamento`

Cancels a Granda Mento exchange proposal


## `planqcli grandamento:cancel`

Cancels a Granda Mento exchange proposal

```
Cancels a Granda Mento exchange proposal

USAGE
  $ planqcli grandamento:cancel

OPTIONS
  --from=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  (required) The address allowed to
                                                     cancel the proposal

  --globalHelp                                       View all available global flags

  --proposalID=proposalID                            (required) UUID of proposal to view
```

_See code: [src/commands/grandamento/cancel.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/grandamento/cancel.ts)_

## `planqcli grandamento:execute`

Executes a Granda Mento exchange proposal

```
Executes a Granda Mento exchange proposal

USAGE
  $ planqcli grandamento:execute

OPTIONS
  --from=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  (required) The address to execute
                                                     the exchange proposal

  --globalHelp                                       View all available global flags

  --proposalID=proposalID                            (required) UUID of proposal to view
```

_See code: [src/commands/grandamento/execute.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/grandamento/execute.ts)_

## `planqcli grandamento:get-buy-amount`

Gets the buy amount for a prospective Granda Mento exchange

```
Gets the buy amount for a prospective Granda Mento exchange

USAGE
  $ planqcli grandamento:get-buy-amount

OPTIONS
  --globalHelp                                     View all available global flags
  --sellPlanq=(true|false)                          (required) Sell or buy PLQ

  --stableToken=(pUSD|pusd|pEUR|peur|pREAL|preal)  (required) [default: pUSD] Name of
                                                   the stable to receive or send

  --value=10000000000000000000000                  (required) The value of the tokens to
                                                   exchange
```

_See code: [src/commands/grandamento/get-buy-amount.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/grandamento/get-buy-amount.ts)_

## `planqcli grandamento:list`

List current active Granda Mento exchange proposals

```
List current active Granda Mento exchange proposals

USAGE
  $ planqcli grandamento:list

OPTIONS
  --globalHelp  View all available global flags
```

_See code: [src/commands/grandamento/list.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/grandamento/list.ts)_

## `planqcli grandamento:propose`

Proposes a Granda Mento exchange

```
Proposes a Granda Mento exchange

USAGE
  $ planqcli grandamento:propose

OPTIONS
  --from=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  (required) The address with tokens
                                                     to exchange

  --globalHelp                                       View all available global flags

  --sellPlanq=(true|false)                            (required) Sell or buy PLQ

  --stableToken=(pUSD|pusd|pEUR|peur|pREAL|preal)    (required) [default: pUSD] Name of
                                                     the stable to receive or send

  --value=10000000000000000000000                    (required) The value of the tokens
                                                     to exchange
```

_See code: [src/commands/grandamento/propose.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/grandamento/propose.ts)_

## `planqcli grandamento:show`

Shows details of a Granda Mento exchange proposal

```
Shows details of a Granda Mento exchange proposal

USAGE
  $ planqcli grandamento:show

OPTIONS
  --globalHelp             View all available global flags
  --proposalID=proposalID  (required) UUID of proposal to view
```

_See code: [src/commands/grandamento/show.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/grandamento/show.ts)_
