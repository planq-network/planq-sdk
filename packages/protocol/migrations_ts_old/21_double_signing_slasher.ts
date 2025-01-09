import { PlanqContractName } from '@planq-network/protocol/lib/registry-utils'
import {
  deploymentForCoreContract,
  getDeployedProxiedContract,
} from '@planq-network/protocol/lib/web3-utils'
import { config } from '@planq-network/protocol/migrationsConfig'
import { DoubleSigningSlasherInstance, LockedPlanqInstance } from 'types'

const initializeArgs = async (_: string): Promise<any[]> => {
  return [
    config.registry.predeployedProxyAddress,
    config.doubleSigningSlasher.penalty,
    config.doubleSigningSlasher.reward,
  ]
}

module.exports = deploymentForCoreContract<DoubleSigningSlasherInstance>(
  web3,
  artifacts,
  PlanqContractName.DoubleSigningSlasher,
  initializeArgs,
  async () => {
    console.info('Adding DoubleSigningSlasher contract as slasher.')
    const lockedPlanq: LockedPlanqInstance = await getDeployedProxiedContract<LockedPlanqInstance>(
      'LockedPlanq',
      artifacts
    )
    await lockedPlanq.addSlasher(PlanqContractName.DoubleSigningSlasher)
  }
)
