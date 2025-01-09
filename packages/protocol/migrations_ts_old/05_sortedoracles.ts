/* tslint:disable:no-console */
import { PlanqContractName } from '@planq-network/protocol/lib/registry-utils'
import { deploymentForCoreContract } from '@planq-network/protocol/lib/web3-utils'
import { config } from '@planq-network/protocol/migrationsConfig'
import { SortedOraclesInstance } from 'types'

module.exports = deploymentForCoreContract<SortedOraclesInstance>(
  web3,
  artifacts,
  PlanqContractName.SortedOracles,
  async () => [config.oracles.reportExpiry]
)
