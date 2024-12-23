import { PlanqContractName } from '@planq-network/protocol/lib/registry-utils'
import { deploymentForCoreContract } from '@planq-network/protocol/lib/web3-utils'
import { config } from '@planq-network/protocol/migrationsConfig'
import { LockedPlanqInstance } from 'types'

module.exports = deploymentForCoreContract<LockedPlanqInstance>(
  web3,
  artifacts,
  PlanqContractName.LockedPlanq,
  async () => [config.registry.predeployedProxyAddress, config.lockedPlanq.unlockingPeriod]
)
