import { PlanqContractName } from '@planq-network/protocol/lib/registry-utils'
import {
  deploymentForCoreContract,
  getDeployedProxiedContract,
} from '@planq-network/protocol/lib/web3-utils'
import { config } from '@planq-network/protocol/migrationsConfig'
import { GovernanceSlasherInstance, LockedPlanqInstance } from 'types'

const initializeArgs = async (_: string): Promise<any[]> => {
  return [config.registry.predeployedProxyAddress]
}

module.exports = deploymentForCoreContract<GovernanceSlasherInstance>(
  web3,
  artifacts,
  PlanqContractName.GovernanceSlasher,
  initializeArgs,
  async () => {
    console.info('Adding GovernanceSlasher contract as slasher.')
    const lockedPlanq: LockedPlanqInstance = await getDeployedProxiedContract<LockedPlanqInstance>(
      'LockedPlanq',
      artifacts
    )
    await lockedPlanq.addSlasher(PlanqContractName.GovernanceSlasher)
  }
)
