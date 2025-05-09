# Protocols

Smart contracts for the Planq protocols, including identity and stability.

## License

The contents of this package are licensed under the terms of the GNU Lesser Public License V3

### Initial deployment

See the the [testnet helm chart README](../helm-charts/testnet/README.md) for how to expose the RPC endpoint.

Then, to deploy contracts to a network run:

```bash
yarn run init-network -n NETWORK
```

This will deploy the contracts to the network specified in `truffle-config.js` and save the artifacts to `build/NETWORK`.
If your network was deployed with `helm`, you will probably set `NETWORK` the same as your `NAME` (which sets `NAMESPACE_NAME` and `RELEASE_NAME`). For more clarity on these names, also see the [testnet helm chart README](../helm-charts/testnet/README.md)

### Migrations

If a new contract needs to be deployed, create a migration file in the `migrations/` directory, prefixing it with the successor of the highest current migration number.

To apply any new migrations to a network, run:

```bash
yarn run migrate -n NETWORK
```

### Accounts

To give an account some planq, wrapped planq, and stable token, run:

```bash
yarn run faucet -n NETWORK -a ACCOUNT_ADDRESS
```

You can check balances by running:

```bash
yarn run get-balances -n NETWORK -a ACCOUNT_ADDRESS
```

You can run 'onlyOwner' methods via the [MultiSig](contracts/common/MultiSig.sol) by running:

```bash
yarn run govern -n NETWORK -c "stableToken.setMinter(0x1234)"
```

### Build artifacts

When interacting with one of our Kubernetes-deployed networks, you can download the build artifacts to a local directory using:

```bash
yarn run download-artifacts -n NAME
```

You must run this before interacting with one of these networks to have the build artifacts available locally.

If you changed the build artifacts (e.g. by running the `init-network`, `migrate`, or `upgrade` script), upload the new build artifacts with:

```bash
yarn run upload-artifacts -n NAME
```

By default, `NAME` will be set as `RELEASE_NAME`, `NAMESPACE_NAME`, `TESTNET_NAME` which you should have used with the same name in prior instructions. If you used separate names for the above, you can customize the run with the `-r -n -t` flags respectively.

### Console

To start a truffle console run:
```
yarn console -f -n rc1
```

Options:
- "-f" for Forno mode, otherwise there needs to be a node running at localhost:8585
- "-n <network>" possible values are: "rc1", "atlas", "baklava"

All compiled assets from `build/contracts` are injected in scope so for example you can do:

```
truffle(rc1)> let exchange = await ExchangeEUR.at("0xE383394B913d7302c49F794C7d3243c429d53D1d")
```
To instantiate a contract at a known address, and then interact with it:

```
truffle(rc1)> exchange.getBuyAndSellBuckets(true)
Result {
  '0': <BN: 744b931719b5411d57c3>,
  '1': <BN: 17105bfef1e6943fd144> }

```

Or you can use ContractKit:

```
truffle(rc1)> let kit = require('@planq-network/contractkit').newKitFromWeb3(web3)
truffle(rc1)> let exchange = await kit.contracts.getExchange()
```

### Testing

To test the smart contracts, run:

```bash
yarn run test
```

Adding the optional `--gas` flag will print out a report of contract gas usage.


To test a single smart contract, run:
```bash
yarn run test ${contract name}
```
Adding the optional `--gas` flag will print out a report of contract gas usage.

For quick test iterations run:
```bash
yarn run quicktest
```

or for a single contract:
```bash
yarn run quicktest ${contract name}
```

For `quicktest` to work correctly a contract's migration dependencies have to be uncommented in `scripts/bash/backupmigrations.sh`.

Compared to the normal test command, quicktest will:
1. Not run the pretest script of building solidity (will still be run as part of truffle test) and compiling typescript. This works because truffle can run typescript "natively".
2. Only migrate selected migrations as set in `backupmigrations.sh` (you'll likely need at least one compilation step since truffle seems to only run compiled migrations)


