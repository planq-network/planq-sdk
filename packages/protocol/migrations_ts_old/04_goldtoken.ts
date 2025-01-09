/* tslint:disable:no-console */
import { PlanqContractName } from '@planq-network/protocol/lib/registry-utils'
import {
  deploymentForCoreContract,
  getDeployedProxiedContract,
} from '@planq-network/protocol/lib/web3-utils'
import { config } from '@planq-network/protocol/migrationsConfig'
import { FreezerInstance, PlanqTokenInstance } from 'types'

const initializeArgs = async () => {
  return [config.registry.predeployedProxyAddress]
}

module.exports = deploymentForCoreContract<PlanqTokenInstance>(
  web3,
  artifacts,
  PlanqContractName.PlanqToken,
  initializeArgs,
  async (planqToken: PlanqTokenInstance) => {
    if (config.planqToken.frozen) {
      const freezer: FreezerInstance = await getDeployedProxiedContract<FreezerInstance>(
        'Freezer',
        artifacts
      )
      await freezer.freeze(planqToken.address)
    }
  }
)
