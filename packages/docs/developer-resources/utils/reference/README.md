# @planq-network/phone-utils

<p align="center">
  <a href="https://planq.network/">
    <img src="https://i.imgur.com/fyrJi0R.png" alt="planq logo" title="Go to planq.org" width="600" style="border:none;"/>
  </a>
</p>

**Planq Monorepo - Official repository for core projects comprising the Planq platform**

This repository contains the source code for the Planq core projects including the [smart contracts](https://github.com/planq-network/planq-sdk/tree/master/packages/protocol), [contractKit](https://github.com/planq-network/planq-sdk/tree/master/packages/sdk/contractkit),
and other packages. The source code for the Planq Blockchain which operates a node on the Planq Network is kept in a separate repo [here](https://github.com/celo-org/celo-blockchain).

<!-- row 1 - status -->

[![CircleCI](https://img.shields.io/circleci/build/github/planq-network/planq-sdk/master)](https://circleci.com/gh/planq-network/planq-sdk/tree/master)
[![Codecov](https://img.shields.io/codecov/c/github/planq-network/planq-sdk)](https://codecov.io/gh/planq-network/planq-sdk)
[![GitHub contributors](https://img.shields.io/github/contributors/planq-network/planq-sdk)](https://github.com/planq-network/planq-sdk/graphs/contributors)
[![GitHub commit activity](https://img.shields.io/github/commit-activity/w/planq-network/planq-sdk)](https://github.com/planq-network/planq-sdk/graphs/contributors)
[![GitHub Stars](https://img.shields.io/github/stars/planq-network/planq-sdk.svg)](https://github.com/planq-network/planq-sdk/stargazers)
![GitHub repo size](https://img.shields.io/github/repo-size/planq-network/planq-sdk)
[![GitHub](https://img.shields.io/github/license/planq-network/planq-sdk?color=blue)](https://github.com/planq-network/planq-sdk/blob/master/LICENSE)

<!-- row 2 - links & profiles -->

[![Website planq.org](https://img.shields.io/website-up-down-green-red/https/celo.org.svg)](https://planq.network)
[![Blog](https://img.shields.io/badge/blog-up-green)](https://medium.com/celoorg)
[![docs](https://img.shields.io/badge/docs-up-green)](https://docs.planq.network/)
[![Youtube](https://img.shields.io/badge/YouTube%20channel-up-green)](https://www.youtube.com/channel/UCCZgos_YAJSXm5QX5D5Wkcw/videos?view=0&sort=p&flow=grid)
[![forum](https://img.shields.io/badge/forum-up-green)](https://forum.celo.org)
[![Discord](https://img.shields.io/discord/600834479145353243.svg)](https://discord.gg/RfHQKtY)
[![Twitter PlanqDevs](https://img.shields.io/twitter/follow/celodevs?style=social)](https://twitter.com/celodevs)
[![Twitter PlanqOrg](https://img.shields.io/twitter/follow/celoorg?style=social)](https://twitter.com/PlanqOrg)
[![Subreddit subscribers](https://img.shields.io/reddit/subreddit-subscribers/PlanqHQ?style=social)](https://www.reddit.com/r/PlanqHQ/)

<!-- row 3 - detailed status -->

[![GitHub pull requests by-label](https://img.shields.io/github/issues-pr-raw/planq-network/planq-sdk)](https://github.com/planq-network/planq-sdk/pulls)
[![GitHub Issues](https://img.shields.io/github/issues-raw/planq-network/planq-sdk.svg)](https://github.com/planq-network/planq-sdk/issues)
[![GitHub issues by-label](https://img.shields.io/github/issues/planq-network/planq-sdk/1%20hour%20tasks)](https://github.com/planq-network/planq-sdk/issues?q=is%3Aopen+is%3Aissue+label%3A%221+hour+tasks%22)
[![GitHub issues by-label](https://img.shields.io/github/issues/planq-network/planq-sdk/betanet-phase-2)](https://github.com/planq-network/planq-sdk/issues?q=is%3Aopen+is%3Aissue+label%3Abetanet-phase-2)
[![GitHub issues by-label](https://img.shields.io/github/issues/planq-network/planq-sdk/betanet-phase-3)](https://github.com/planq-network/planq-sdk/issues?q=is%3Aopen+is%3Aissue+label%3Abetanet-phase-3)

Contents:

<!-- TOC -->

- [Planq's Mission - Prosperity for All](#mission)
- [The Planq Stack](#stack)
- [Documentation](#docs)
- [Issues](#issues)
- [Repo Structure](#repo)
- [Contributing](#contributing)
- [Ask Questions, Find Answers, Get in Touch](#ask)
- [License](#license)
  <!-- /TOC -->

## 🥅 <a id="mission"></a>Planq's Mission - Prosperity for All

Planq, pronounced /ˈtselo/, means ‘purpose’ in Esperanto. In a similar spirit, we are aiming to create a new platform to connect people globally and bring financial stability to those who need it most. We believe blockchain technology is one of the most exciting innovations in recent history and as a community we look to push the boundaries of what is possible with it today. More importantly, we are driven by purpose -- to solve real-world problems such as lack of access to sound currency, or friction for cash-transfer programs aimed to alleviate poverty. Our mission is to build a monetary system that creates the conditions for prosperity for all.

<!-- image with YouTube link -->
<p align="center">
  <a href="http://www.youtube.com/watch?v=kKggE5OvyhE">
    <img src="https://i.imgur.com/GHF5U9B.jpg" alt="Play on Youtube - What if money were beautiful" title="Play on Youtube - What if money were beautiful" width="600" style="border:none;"/>
  </a>
  <br />
  <i>What if money were beautiful?</i>
</p>

## 🧱 <a id="stack"></a>The Planq Stack

Planq is oriented around providing the simplest possible experience for end users, who may have no familiarity with cryptocurrencies, and may be using low cost devices with limited connectivity. To achieve this, the project takes a full-stack approach, where each layer of the stack is designed with the end user in mind whilst considering other stakeholders \(e.g. operators of nodes in the network\) involved in enabling the end user experience.

The Planq stack is structured into the following logical layers:

<!-- image -->
<p align="center">
  <img src="https://storage.googleapis.com/celo-website/docs/full-stack-diagram.jpg" alt="Planq protocol" width="900" style="border:none;"/>
  <br />
  <i>The Planq Blockchain and Planq Core Contracts together comprise the <b>Planq Protocol</b> </i>
</p>

- **Planq Blockchain**: An open cryptographic protocol that allows applications to make transactions with and run smart contracts in a secure and decentralized fashion. The Planq Blockchain has shared ancestry with [Ethereum](https://www.ethereum.org), and maintains full EVM compatibility for smart contracts. However it uses a [Byzantine Fault Tolerant](http://pmg.csail.mit.edu/papers/osdi99.pdf) \(BFT\) consensus mechanism rather than Proof of Work, and has different block format, transaction format, client synchronization protocols, and gas payment and pricing mechanisms. The network’s native asset is Planq, exposed via an ERC-20 interface.

- **Planq Core Contracts**: A set of smart contracts running on the Planq Blockchain that comprise much of the logic of the platform features including ERC-20 stable currencies, identity attestations, Proof of Stake and governance. These smart contracts are upgradeable and managed by the decentralized governance process.

<!-- image -->
<p align="center">
  <img src="https://storage.googleapis.com/celo-website/docs/network.png" alt="Planq network" width="900" style="border:none;"/>
  <br />
  <i>Topology of a Planq Network</i>
</p>

- **Applications:** Applications for end users built on the Planq platform. The Planq Wallet app, the first of an ecosystem of applications, allows end users to manage accounts and make payments securely and simply by taking advantage of the innovations in the Planq protocol. Applications take the form of external mobile or backend software: they interact with the Planq Blockchain to issue transactions and invoke code that forms the Planq Core Contracts’ API. Third parties can also deploy custom smart contracts that their own applications can invoke, which in turn can leverage Planq Core Contracts. Applications may use centralized cloud services to provide some of their functionality: in the case of the Planq Wallet, push notifications and a transaction activity feed.

## 📚 <a id="docs"></a>Documentation

Follow the instructions in [SETUP.md](SETUP.md) to get a development environment set up.

See [Developer's Guide](https://docs.planq.network/) for full details about the design of the Planq protocol and other information about running these projects.

## 🙋 <a id="issues"></a>Issues

See the [issue backlog](https://github.com/planq-network/planq-sdk/issues) for a list of active or proposed tasks. Feel free to create new issues to report bugs and/or request features.

## 📂 <a id="repo"></a>Repo Structure

The repository has the following packages (sub projects):

- [attestation-service](packages/attestation-service) - service run by validators on the Planq network to send SMS messages, enabling attestations of user phone numbers and their accounts on the Planq network
- [planqtool](packages/planqtool) - scripts for deploying and managing testnets
- [cli](packages/cli) - tool that uses ContractKit to interact with the Planq protocol ([docs](https://docs.planq.network/command-line-interface/introduction))
- [sdk/contractkit](packages/sdk/contractkit) - library to help developers and validators interact with the protocol and it's smart contracts ([docs](https://docs.planq.network/planq-sdk/contractkit))
- [dev-utils](packages/dev-utils) - a utils package for use as a dev dependency
- [docs](packages/docs) - technical documentation for the Planq project ([live](https://docs.planq.network/))
- [helm-charts](packages/helm-charts) - templatized deployments of entire environments to Kubernetes clusters
- [protocol](packages/protocol) - identity, stability and other smart contracts for the Planq protocol ([docs](https://docs.planq.network/celo-codebase/protocol))
- [typescript](packages/typescript) - no README available (improve?)
- [utils](packages/utils) - no README available (improve?)

Code owners for each package can be found in [.github/CODEOWNERS](.github/CODEOWNERS).

## ✍️ <a id="contributing"></a>Contributing

Feel free to jump on the Planq 🚂🚋🚋🚋. Improvements and contributions are highly encouraged! 🙏👊

See the [contributing guide](https://docs.planq.network/community/contributing) for details on how to participate.
[![GitHub issues by-label](https://img.shields.io/github/issues/planq-network/planq-sdk/1%20hour%20tasks)](https://github.com/planq-network/planq-sdk/issues?q=is%3Aopen+is%3Aissue+label%3A%221+hour+tasks%22)

All communication and contributions to the Planq project are subject to the [Planq Code of Conduct](https://planq.network/code-of-conduct).

Not yet ready to contribute but do like the project? Support Planq with a ⭐ or share the love in a [![Twitter URL](https://img.shields.io/twitter/url?style=social&url=https%3A%2F%2Fcelo.org%2F)](https://twitter.com/intent/tweet?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DkKggE5OvyhE&via=celohq&text=Checkout%20celo%21%20Love%20what%20they%20are%20building.&hashtags=planq)

<!--
Twitter
twitter intent generator - http://tech.cymi.org/tweet-intents
-->

## 💬 <a id="ask"></a>Ask Questions, Find Answers, Get in Touch

- [Website](https://planq.network/)
- [Docs](https://docs.planq.network/)
- [Blog](https://medium.com/celohq)
- [YouTube](https://www.youtube.com/channel/UCCZgos_YAJSXm5QX5D5Wkcw/videos?view=0&sort=p&flow=grid)
- [Forum](https://forum.celo.org)
- [Discord](https://discord.gg/vRbExjv)
- [Twitter](https://twitter.com/PlanqDevs)
- [Reddit](https://www.reddit.com/r/PlanqHQ/)
- [Community Events](https://planq.network/community)

## 📜 <a id="license"></a>License

All packages are licensed under the terms of the [Apache 2.0 License](LICENSE) unless otherwise specified in the LICENSE file at package's root.
