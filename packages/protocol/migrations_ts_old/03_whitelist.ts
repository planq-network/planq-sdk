import { PlanqContractName } from '@planq-network/protocol/lib/registry-utils'
import { deploymentForCoreContract } from '@planq-network/protocol/lib/web3-utils'
import { FeeCurrencyWhitelistInstance } from 'types'

module.exports = deploymentForCoreContract<FeeCurrencyWhitelistInstance>(
  web3,
  artifacts,
  PlanqContractName.FeeCurrencyWhitelist
)
