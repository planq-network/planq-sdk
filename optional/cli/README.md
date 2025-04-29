# planqcli

Tool for interacting with the Planq Protocol.

## Installation

We are currently deploying the CLI with only Node.js v18.14.2 support.

To install globally, run:

```
npm install -g @planq-network/planqcli
```

If you have trouble installing globally (i.e. with the `-g` flag), try installing to a local directory instead with `npm install @planq-network/planqcli` and run with `npx planqcli`.

### Plugins

Additional plugins can be installed which make the CLI experience smoother. Currently, `planqcli` only supports installing plugins published on NPM within the `@planq-network/*` and `@clabs/*` scopes.

> ⚠️ **Warning**
>  
> Installing a 3rd party plugin can be dangerous! Please always be sure that you trust the plugin provider.

## Development

### Build

Use `yarn build:sdk <NETWORK>` to build the sdk for the target environment (CLI dependency).

Use `yarn build` to compile the CLI.

### Generate docs

Use `yarn docs` to populate `packages/docs` with generated documentation. Generated files should be checked in, and CI will fail if CLI modifications cause changes in the docs which were not checked in.

### Known build issues on Linux

> I'm getting the follow error: `Cannot find module '@planq-network/contractkit'`.

A possible solution is to build the monorepo manually.
Go to the `planq-sdk` root directory and

```bash
> yarn build
```

If all works well, navigate to `packages/cli`.

> I've got the cli built successfully but the running the `cli` yields: `Error: Returned values aren't valid, did it run Out of Gas?`.

When running the `cli` against a full node, this can mean that the contract artifacts are out of date.
Solution: switch to the `atlas` branch and build the `planq-sdk`.

Go to the `planq-sdk` root directory and

```bash
> git checkout atlas
> yarn
> yarn build
> cd packages/cli
> ./bin/run account:balance $PLQ_ACCOUNT_ADDRESS
```
