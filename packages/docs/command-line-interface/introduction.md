---
description: >-
  This Command Line Interface allows users to interact with the Planq Protocol
  smart contracts.
---

# Introduction

## Getting Started

### **Optional**

- **Run a Planq node full node.** Commands will connect to a Planq node to execute most functionality. You can either use [Forno](../developer-resources/forno/README.md) (this is the easiest way) or run your own full node if you prefer. See the [Running a Full Node](../getting-started/running-a-full-node-in-mainnet.md) instructions for more details on running a full node.

### NPM Package

The Planq CLI is published as a node module on NPM. Assuming you have [npm](https://www.npmjs.com/get-npm) and [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) both installed, you can install the Planq CLI using the following command:

```bash
npm install -g @planq-network/planqcli
```

{% hint style="info" %}
We are currently deploying the CLI with only Node.js v18.14.2. If you are running a different version of Node.js, consider using [NVM](https://github.com/nvm-sh/nvm#installation-and-update) to manage your node versions. e.g. with: `nvm install 18.14.2 && nvm use 18.14.2`
{% endhint %}

{% hint style="info" %}
If you have trouble installing globally \(i.e. with the `-g` flag\), try installing to a local directory instead with `npm install @planq-network/planqcli` and run with `npx planqcli`.
{% endhint %}

### Overview

The tool is broken down into modules and commands with the following pattern:

```text
planqcli <module>:<command> <...args> <...flags?>
```

The `planqcli` tool assumes that users are running a node which they have access to signing transactions on, or have another mechanism for signing transactions (such as a Ledger wallet or supplying the private key as an argument to the command). See the documentation on the [config](config.md) module for information about how to set which node commands are sent to.

{% hint style="info" %}
**All balances of PLQ or Planq Dollars are expressed in units of 10^-18**
{% endhint %}

{% embed url="https://www.npmjs.com/package/@planq-network/planqcli" caption="" %}

### Using a Ledger Wallet

The Planq CLI supports using a [Ledger hardware wallet](../planq-holder-guide/ledger.md) to sign transactions.

### Plugins

Additional plugins can be installed which make the CLI experience smoother. Currently, `planqcli` only supports installing plugins published on NPM within the `@planq-network/*` and `@clabs/*` scopes.

{% hint style="danger" %}
Installing a 3rd party plugin can be _dangerous_! Please always be sure that you trust the plugin provider.
{% endhint %}

The autocomplete plugin adds an interactive autocomplete for `bash` and `zsh` shells. To enable the autocomplete plugin, follow the instructions provided at:

```text
planqcli autocomplete
```

The update warning plugin notifies the user if they are using an oudated version of the CLI. This plugin is enabled by default.
