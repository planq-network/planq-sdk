# `planqcli exchange`

Exchange Planq Dollars and PLQ via the stability mechanism


## `planqcli exchange:planq`

Exchange PLQ for StableTokens via the stability mechanism. (Note: this is the equivalent of the old exchange:planq)

```
Exchange PLQ for StableTokens via the stability mechanism. (Note: this is the equivalent of the old exchange:planq)

USAGE
  $ planqcli exchange:celo

OPTIONS
  --forAtLeast=10000000000000000000000               [default: 0] Optional, the minimum
                                                     value of StableTokens to receive in
                                                     return

  --from=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  (required) The address with PLQ to
                                                     exchange

  --globalHelp                                       View all available global flags

  --stableToken=(pUSD|pusd|pEUR|peur|pREAL|preal)    [default: pUSD] Name of the stable
                                                     to receive

  --value=10000000000000000000000                    (required) The value of PLQ to
                                                     exchange for a StableToken

EXAMPLES
  planq --value 5000000000000 --from 0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d

  planq --value 5000000000000 --forAtLeast 100000000000000 --from
  0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d --stableToken cStableTokenSymbol
```

_See code: [src/commands/exchange/planq.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/exchange/planq.ts)_

## `planqcli exchange:dollars`

Exchange Planq Dollars for PLQ via the stability mechanism

```
Exchange Planq Dollars for PLQ via the stability mechanism

USAGE
  $ planqcli exchange:dollars

OPTIONS
  --forAtLeast=10000000000000000000000               [default: 0] Optional, the minimum
                                                     value of PLQ to receive in return

  --from=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  (required) The address with Planq
                                                     Dollars to exchange

  --globalHelp                                       View all available global flags

  --value=10000000000000000000000                    (required) The value of Planq
                                                     Dollars to exchange for PLQ

EXAMPLES
  dollars --value 10000000000000 --from 0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d

  dollars --value 10000000000000 --forAtLeast 50000000000000 --from
  0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d
```

_See code: [src/commands/exchange/dollars.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/exchange/dollars.ts)_

## `planqcli exchange:euros`

Exchange Planq Euros for PLQ via the stability mechanism

```
Exchange Planq Euros for PLQ via the stability mechanism

USAGE
  $ planqcli exchange:euros

OPTIONS
  --forAtLeast=10000000000000000000000               [default: 0] Optional, the minimum
                                                     value of PLQ to receive in return

  --from=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  (required) The address with Planq
                                                     Euros to exchange

  --globalHelp                                       View all available global flags

  --value=10000000000000000000000                    (required) The value of Planq Euros
                                                     to exchange for PLQ

EXAMPLES
  euros --value 10000000000000 --from 0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d

  euros --value 10000000000000 --forAtLeast 50000000000000 --from
  0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d
```

_See code: [src/commands/exchange/euros.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/exchange/euros.ts)_

## `planqcli exchange:planq`

Exchange PLQ for StableTokens via the stability mechanism. _DEPRECATION WARNING_ Use the "exchange:planq" command instead

```
Exchange PLQ for StableTokens via the stability mechanism. *DEPRECATION WARNING* Use the "exchange:planq" command instead

USAGE
  $ planqcli exchange:planq

OPTIONS
  --forAtLeast=10000000000000000000000               [default: 0] Optional, the minimum
                                                     value of StableTokens to receive in
                                                     return

  --from=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  (required) The address with PLQ to
                                                     exchange

  --globalHelp                                       View all available global flags

  --stableToken=(pUSD|pusd|pEUR|peur|pREAL|preal)    [default: pUSD] Name of the stable
                                                     to receive

  --value=10000000000000000000000                    (required) The value of PLQ to
                                                     exchange for a StableToken

EXAMPLES
  planq --value 5000000000000 --from 0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d

  planq --value 5000000000000 --forAtLeast 100000000000000 --from
  0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d --stableToken pUSD
```

_See code: [src/commands/exchange/planq.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/exchange/planq.ts)_

## `planqcli exchange:reals`

Exchange Planq Brazilian Real (pREAL) for PLQ via the stability mechanism

```
Exchange Planq Brazilian Real (pREAL) for PLQ via the stability mechanism

USAGE
  $ planqcli exchange:reals

OPTIONS
  --forAtLeast=10000000000000000000000               [default: 0] Optional, the minimum
                                                     value of PLQ to receive in return

  --from=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  (required) The address with Planq
                                                     Brazilian Real to exchange

  --globalHelp                                       View all available global flags

  --value=10000000000000000000000                    (required) The value of Planq
                                                     Brazilian Real to exchange for PLQ

EXAMPLES
  reals --value 10000000000000 --from 0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d

  reals --value 10000000000000 --forAtLeast 50000000000000 --from
  0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d
```

_See code: [src/commands/exchange/reals.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/exchange/reals.ts)_

## `planqcli exchange:show`

Show the current exchange rates offered by the Exchange

```
Show the current exchange rates offered by the Exchange

USAGE
  $ planqcli exchange:show

OPTIONS
  --amount=amount  [default: 1000000000000000000] Amount of the token being exchanged to
                   report rates for

  --globalHelp     View all available global flags

EXAMPLE
  list
```

_See code: [src/commands/exchange/show.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/exchange/show.ts)_

## `planqcli exchange:stable`

Exchange Stable Token for PLQ via the stability mechanism

```
Exchange Stable Token for PLQ via the stability mechanism

USAGE
  $ planqcli exchange:stable

OPTIONS
  --forAtLeast=10000000000000000000000               [default: 0] Optional, the minimum
                                                     value of PLQ to receive in return

  --from=0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d  (required) The address with the
                                                     Stable Token to exchange

  --globalHelp                                       View all available global flags

  --stableToken=(pUSD|pusd|pEUR|peur|pREAL|preal)    Name of the stable token to be
                                                     transfered

  --value=10000000000000000000000                    (required) The value of Stable
                                                     Tokens to exchange for PLQ

EXAMPLES
  stable --value 10000000000000 --from 0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d
  --stableToken cStableTokenSymbol

  stable --value 10000000000000 --forAtLeast 50000000000000 --from
  0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d --stableToken cStableTokenSymbol
```

_See code: [src/commands/exchange/stable.ts](https://github.com/planq-network/planq-sdk/tree/master/packages/cli/src/commands/exchange/stable.ts)_
