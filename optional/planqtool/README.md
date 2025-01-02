# Planqtool

A useful tool for various scripts that we as an engineering team might run.
This is the only remaining version, in Typescript. There used to be a Python version too.
Hence the references to planqtooljs.

## Setup

```bash
# Install packages
yarn
```

If you want to use this tool from anywhere, add an alias to your ~/.bash_profile.

`alias planqtooljs=<YOUR_PATH_TO_MONOREPO>/packages/planqtool/bin/planqtooljs.sh`

## Usage

Running `planqtooljs` should give you the output like the following that let's you know what you can do:

```bash

planqtooljs <command>

Commands:
planqtooljs account <accountCommand>     commands for fauceting,
                                        looking up accounts and users
planqtooljs backup                       command for backing up a miner's
                                        persistent volume (PVC)
planqtooljs copy-contract-artifacts      command for copying contract
                                        artifacts in a format to be easily
                                        consumed by other (typescript)
                                        packages. It will use the ABI of a
                                        particular contract and swap the
                                        address for the address of the
                                        Proxy.
planqtooljs deploy <deployMethod>        commands for deployment of various
<deployPackage>                         packages in the monorepo
planqtooljs geth <command>               commands for geth
planqtooljs links <resource>             commands for various useful links
planqtooljs port-forward                 command for port-forwarding to a
                                        specific network
planqtooljs restore                      command for restoring a miner's
                                        persistent volume (PVC) from
                                        snapshot
planqtooljs switch                       command for switching to a
                                        particular environment
planqtooljs transactions <command>       commands for reading transaction
                                        data
Options:
--version     Show version number                                  [boolean]
--verbose     Whether to show a bunch of debugging output like stdout and
              stderr of shell commands            [boolean] [default: false]
--yesreally   Reply "yes" to prompts about changing staging/production
              (be careful!)                       [boolean] [default: false]
  --help        Show help                                            [boolean]
```

### How to Faucet an Account

Run this command:
`planqtooljs account faucet --planq-env <integration-or-your-testnet> --account <account-address> --planq 10 --dollar 10`

### How to Setup a Local Planq Blockchain Node

You might need to setup a local node for some reasons, therefore `planqtooljs` provides you with
a few useful commands to make running a node really easy.

- Clone [Planq Blockchain repo](https://github.com/planq-network/planq)
- Build `planqtooljs geth build --geth-dir <directory-where-you-cloned-geth-repo> -c`
- Init `planqtooljs geth init --geth-dir <directory-where-you-cloned-geth-repo> --data-dir <geth-data-dir> -e <env-name>`
- Run `planqtooljs geth run --geth-dir <directory-where-you-cloned-geth-repo> --data-dir <geth-data-dir> --sync-mode <full | fast | light | ultralight>`

### How to Deploy a Test Network to the Cloud

- Setup the environment variables: MNEMONIC, and GETH_ACCOUNT_SECRET.

- Deploy: `planqtooljs deploy initial testnet -e yourname`

- Get pods: `kubectl get pods -n yourname`

- Start shell: `kubectl exec -n podname -it podname /bin/sh`

- Tear down: `planqtooljs deploy destroy testnet -e yourname`

#### MacOS Setup

- Install Helm 3.4 or higher (available on Homebrew)
  To get past the Unidentified Developer error: open the directory containing helm, then ctrl-click helm and select Open then Open again. Repeat for tiller.
