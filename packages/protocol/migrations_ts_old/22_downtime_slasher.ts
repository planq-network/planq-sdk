import { PlanqContractName } from '@planq-network/protocol/lib/registry-utils'
import {
  deploymentForCoreContract,
  getDeployedProxiedContract,
} from '@planq-network/protocol/lib/web3-utils'
import { config } from '@planq-network/protocol/migrationsConfig'
import { DowntimeSlasherInstance, LockedPlanqInstance } from 'types'

const initializeArgs = async (_: string): Promise<any[]> => {
  return [
    config.registry.predeployedProxyAddress,
    config.downtimeSlasher.penalty,
    config.downtimeSlasher.reward,
    config.downtimeSlasher.slashableDowntime,
  ]
}

module.exports = deploymentForCoreContract<DowntimeSlasherInstance>(
  web3,
  artifacts,
  PlanqContractName.DowntimeSlasher,
  initializeArgs,
  async () => {
    console.info('Adding DowntimeSlasher contract as slasher.')
    const lockedPlanq: LockedPlanqInstance = await getDeployedProxiedContract<LockedPlanqInstance>(
      'LockedPlanq',
      artifacts
    )
    await lockedPlanq.addSlasher(PlanqContractName.DowntimeSlasher)
  }
)
