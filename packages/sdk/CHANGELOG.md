# Changelog
All notable changes to the [Planq SDK](https://docs.planq.network/developer-guide/sdk-code-reference) will be documented in this file.

This package will follow the release process outlined [here](https://docs.planq.network/community/release-process).


Bug Fixes
-  one-line summary - [#](link PR)

Other Changes
-  one-line summary - [#](link PR)
-  migrated @planq-network/wallet-walletconnect from planq/planq-sdk to planq/use-contractkit


## Development (not published yet)

Breaking Changes:

Deleted dappkit following the [clabs announcement](https://forum.celo.org/t/sunsetting-dappkit/5336).

### **[2.0.0]**

See [Upgrade Guide](https://docs.planq.network/developer-guide/contractkit/migrating-to-contractkit-v2)

Breaking Changes

for detail info see [#9127](https://github.com/planq-network/planq-sdk/pull/9127)

- @planq-network/contractkit
  - AccountsWrapper.authorizeValidatorSigner now requires a ValidatorWrapper as third param
  - kit is now longer required when constructing WrapperCache, AddressRegistry, Contract Wrappers
  - proxySend now takes a Connection rather than a Kit

- @planq-network/utils

  - Removes phone and country related functions from utils. Now in [phone-utils](https://github.com/planq-network/planq-sdk/pull/8987)

  - comment encryption, bls and mneumonic functions moved to @planq-network/cryptographic-utils


Features

- All Packages Now marked as Side Effect: false

- Bundle Sized Reduced 45%

- Adds the @planq-network/encrypted-backup package - [#8896] [#9348] [#9413] [#9434]

[#8896]: https://github.com/planq-network/planq-sdk/pull/8896
[#9348]: https://github.com/planq-network/planq-sdk/pull/9348
[#9413]: https://github.com/planq-network/planq-sdk/pull/9413
[#9434]: https://github.com/planq-network/planq-sdk/pull/9434

Bug Fixes / Package Updates

- Upgrades bls12377, bip32,



## Published

### **[1.5.0]**
Features
- Adds aREAL support to contract kit [#9040](https://github.com/planq-network/planq-sdk/pull/9040)

### **[1.4.2]**
Bug Fixes
-  Fixes wallet connect issue in @planq-network/wallet-walletconnect


### **[1.2.2]** -- 2021-07-08
Features
- new package: JS keystore support [#8096](https://github.com/planq-network/planq-sdk/pull/8096)
- Add euro in the currencies enum [#7786](https://github.com/planq-network/planq-sdk/pull/7786)
- CIP10 contracts changes [#5913](https://github.com/planq-network/planq-sdk/pull/5913)
- Use Node 12 [#7851](https://github.com/planq-network/planq-sdk/pull/7851)
- Add token address support to oracle commands [#8010](https://github.com/planq-network/planq-sdk/pull/8010)
- Add manual personal_decrypt flow to WalletConnect CLI client [#8037](https://github.com/planq-network/planq-sdk/pull/8037)
- Account utilities for normalization and heuristic based correction of mnemonic phrases [#8034] (https://github.com/planq-network/planq-sdk/pull/8034)
- Add getBlockHeader utilities to connect package [#8213](https://github.com/planq-network/planq-sdk/pull/8213)
- Granda Mento smart contract implementation [#8129](https://github.com/planq-network/planq-sdk/pull/8129)

Bug Fixes
- Fix governance:build-proposal bigNumber bug [#8028](https://github.com/planq-network/planq-sdk/pull/8028)
- Remove ERC20 from core contracts [#8212](https://github.com/planq-network/planq-sdk/pull/8212)

Other Changes
- planqcli: transfer:erc20 and balance commands [#7753](https://github.com/planq-network/planq-sdk/pull/7753)
- Tutorial: Integrating WalletConnect into your DApp [#7802](https://github.com/planq-network/planq-sdk/pull/7802)
- chore: remove @umpirsky/country-list package to save space [#7895](https://github.com/planq-network/planq-sdk/pull/7895)
- Add script for running + testing eth_signTypedData [#7951](https://github.com/planq-network/planq-sdk/pull/7951)
- Bump walletConnect version [#8012](https://github.com/planq-network/planq-sdk/pull/8012)
- Upgrade vulnerable dependencies [#8073](https://github.com/planq-network/planq-sdk/pull/8073)
- Add more params to status endpoint [#8125](https://github.com/planq-network/planq-sdk/pull/8125)
- Add check for phrase length in mnemonic phrase correction [#8146](https://github.com/planq-network/planq-sdk/pull/8146)
- JS Keystore Docs (with updated file structure) [#8185](https://github.com/planq-network/planq-sdk/pull/8185)

### **[1.2.1]** (only utils and base) -- 2021-04-22

Other Changes
-  Unified web3 version (1.3.5) to reduce bundle size


### **[1.2.0]** -- 2021-04-22
Features
- aEUR ContractKit support - [#7257](https://github.com/planq-network/planq-sdk/pull/7257)
- CK works with StableTokens not yet deployed - [#7524](https://github.com/planq-network/planq-sdk/pull/7524)
- Decode Governance.setConstitution proposals - [#7415](https://github.com/planq-network/planq-sdk/pull/7415)
- Adds timeout functions to sdk/base package - [#7617](https://github.com/planq-network/planq-sdk/pull/7617)

Bug Fixes
- Dappkit fixes - [#7385](https://github.com/planq-network/planq-sdk/pull/7385), [#7658](https://github.com/planq-network/planq-sdk/pull/7658)
- WalletConnect improvements - [#7507](https://github.com/planq-network/planq-sdk/pull/7507), [#7645](https://github.com/planq-network/planq-sdk/pull/7645)
- Fix Governance.getProposalStage - [#7326](https://github.com/planq-network/planq-sdk/pull/7326)

Other Changes
- Update @planq-network/utils to allow AccountAuthResponseSuccess to include pepper - [#7546](https://github.com/planq-network/planq-sdk/pull/7546)
- Updated ledger blob to support aEUR - [#7531](https://github.com/planq-network/planq-sdk/pull/7531)
- Bump web3 from 1.3.4 to 1.3.5 - [#7684](https://github.com/planq-network/planq-sdk/pull/7684)

### **[1.1.0]** -- 2021-03-23
Features
- Implementation of a WalletConnect compatible wallet - [#7122](https://github.com/planq-network/planq-sdk/pull/7122)
- Add dappkit-web functionality - [#7328](https://github.com/planq-network/planq-sdk/pull/7328)
- Adds Reserve unfrozen balance methods - [#7103](https://github.com/planq-network/planq-sdk/pull/7103)
- Merge branch 'release/celo-core-contracts/3' - [#7183](https://github.com/planq-network/planq-sdk/pull/7183)
- Improve granularity of governance tooling information - [#6475](https://github.com/planq-network/planq-sdk/pull/6475)
- Upload/Download Profile Data with CIP8 - [#6604](https://github.com/planq-network/planq-sdk/pull/6604)
- CIP8 name access via the CLI - [#6855](https://github.com/planq-network/planq-sdk/pull/6855)
- Allow DEK to be a CIP8 signer - [#7467](https://github.com/planq-network/planq-sdk/pull/7467)

Bug Fixes
- Fixed references to planqToken in README - [#7189](https://github.com/planq-network/planq-sdk/pull/7189)
- Update proposals.ts - [#7275](https://github.com/planq-network/planq-sdk/pull/7275)
- Functions to invalidate the contracts cache - [#7203](https://github.com/planq-network/planq-sdk/pull/7203)
- fix `rewards:show` - [#7325](https://github.com/planq-network/planq-sdk/pull/7325)
- In `getReservePlanqBalance`, dont alias itself - [#7334](https://github.com/planq-network/planq-sdk/pull/7334)
- Fix check for unregistered contracts - [#7319](https://github.com/planq-network/planq-sdk/pull/7319)
- Fix no approval case for `governance:approver` information - [#7478](https://github.com/planq-network/planq-sdk/pull/7478)

Other Changes
- Makes the grace period variable governable - [#6987](https://github.com/planq-network/planq-sdk/pull/6987)
- added cleaning command to dappKit - [#7205](https://github.com/planq-network/planq-sdk/pull/7205)
- Support Portuguese mnemonics - [#7220](https://github.com/planq-network/planq-sdk/pull/7220)
- Remove wallet code from the monorepo - [#7232](https://github.com/planq-network/planq-sdk/pull/7232)
- Small fixes in the proposal process for aEUR/Release 3 - [#7184](https://github.com/planq-network/planq-sdk/pull/7184)
- Improve dappkit example in README - [#7346](https://github.com/planq-network/planq-sdk/pull/7346)
- Add instructions for Eth recovery with planqwallet.app in documentation - [#7350](https://github.com/planq-network/planq-sdk/pull/7350)
- Fix packages vulnerabilities - [#7476](https://github.com/planq-network/planq-sdk/pull/7476)


### **[1.0.2]** -- 2021-02-16
Features
- Show owner in `releaseplanq:show` - [#6608](https://github.com/planq-network/planq-sdk/pull/6608)
- Metadata HTTPS Monitoring in `identity:current-attestation-services` - [#6806](https://github.com/planq-network/planq-sdk/pull/6806)
- Determine signing algorithm based on key type for Azure HSM - [#6010](https://github.com/planq-network/planq-sdk/pull/6010)

Bug Fixes
- Fix 8 digit codes for mainnet - [#6663](https://github.com/planq-network/planq-sdk/pull/6663)
- Fix Azure HSM Wallet PublicKey to Address conversion - [#6829](https://github.com/planq-network/planq-sdk/pull/6829)
- Shouldn't import from src folder in peer package - [#7073](https://github.com/planq-network/planq-sdk/pull/7073)
- Fix wallets-test [#7094](https://github.com/planq-network/planq-sdk/pull/7094)

Other Changes
- Small Docs Fixes related to CK1 release - [#6576](https://github.com/planq-network/planq-sdk/pull/6576)
- Simplify SortedOracles API by allowing consumers to report to arbitrary Addresses - [#6898](https://github.com/planq-network/planq-sdk/pull/6898)
- Updated DappKit README.md - [#6957](https://github.com/planq-network/planq-sdk/pull/6957)


### **[1.0.1]** -- 2021-01-20
Features
- Moved into SDK directory, and made compatible with SDK modularization changes - [#4790](https://github.com/planq-network/planq-sdk/pull/4790)
- Added ability to specify per token expiry in sorted oracles - [#6125](https://github.com/planq-network/planq-sdk/pull/6125)
- Adds metrics to ODIS - [#5749](https://github.com/planq-network/planq-sdk/pull/5749)
- ODIS Client Update - [#5621](https://github.com/planq-network/planq-sdk/pull/5621)]
- Extend SortedOraclesWrapper to support reporting for arbitrary currency pairs - [#6401](https://github.com/planq-network/planq-sdk/pull/6401)
- IP712 signature over attestation security code - [#6209](https://github.com/planq-network/planq-sdk/pull/6209)
- Enable 8 digit code verification and ignore attestation services below 1.1.0 - [#6437](https://github.com/planq-network/planq-sdk/pull/6437)
- Handle revert flag from web3 for contract calls - [#6515](https://github.com/planq-network/planq-sdk/pull/6515)
- CIP-21: Governable LookbackWindow Smart Contract changes - [#4747](https://github.com/planq-network/planq-sdk/pull/4747)

Bug Fixes
- Reverted PR #5709, "Add AUSD transfer to MTW" - [#5982](https://github.com/planq-network/planq-sdk/pull/5982)
- Removes unnecessary check in vote function - [#6056](https://github.com/planq-network/planq-sdk/pull/6056)
- Treat null receipt in Connection.getTransactionReceipt - [#6178](https://github.com/planq-network/planq-sdk/pull/6178)
- Add id field to eth_sign and eth_signTypedData calls - [#6264](https://github.com/planq-network/planq-sdk/pull/6264)
- Pin our version of secp256k1 - [#6432](https://github.com/planq-network/planq-sdk/pull/6432)
- Updated ContractKit's README.md [#6450](https://github.com/planq-network/planq-sdk/pull/6450)
- Fix @ledgerhq package version in CK and CLI  - [#6496](https://github.com/planq-network/planq-sdk/pull/6496)

Other Changes
- Added ability to withdraw attestation rewards via CLI - [#6176](https://github.com/planq-network/planq-sdk/pull/6176)
- Autogenerated documentation for all new sdk packages - [#6199](https://github.com/planq-network/planq-sdk/pull/6199)
- Update homepage and repository for sdk packages in documentation - [#5998](https://github.com/planq-network/planq-sdk/pull/5998)
- Add Portuguese in wallet - [#5945](https://github.com/planq-network/planq-sdk/pull/5945)
- Mnemonic validation flexibility within Valora - [#6372](https://github.com/planq-network/planq-sdk/pull/6372)
- Show the international format when displaying phone numbers in Valora [#6350](https://github.com/planq-network/planq-sdk/pull/6350)
- Modified version of #6474: Fix dependencies to work on standalone installations and in environments without Git [#6516](https://github.com/planq-network/planq-sdk/pull/6516)

_Note: Changes before and including 1.0.0 are not documented_
