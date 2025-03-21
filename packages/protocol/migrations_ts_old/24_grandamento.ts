/* tslint:disable:no-console */

import { PlanqContractName } from '@planq-network/protocol/lib/registry-utils'
import {
  deploymentForCoreContract,
  getDeployedProxiedContract,
} from '@planq-network/protocol/lib/web3-utils'
import { config } from '@planq-network/protocol/migrationsConfig'
import { toFixed } from '@planq-network/utils/lib/fixidity'
import { GrandaMentoInstance, ReserveInstance } from 'types/mento'
import { ASTONIC_PACKAGE } from '../contractPackages'
import { ArtifactsSingleton } from '../lib/artifactsSingleton'

const initializeArgs = async (): Promise<any[]> => {
  return [
    config.registry.predeployedProxyAddress,
    config.grandaMento.approver,
    toFixed(config.grandaMento.maxApprovalExchangeRateChange).toString(),
    toFixed(config.grandaMento.spread).toString(),
    config.grandaMento.vetoPeriodSeconds,
  ]
}

module.exports = deploymentForCoreContract<GrandaMentoInstance>(
  web3,
  artifacts,
  PlanqContractName.GrandaMento,
  initializeArgs,
  async (grandaMento: GrandaMentoInstance) => {
    // Add as a spender of the Reserve
    const reserve: ReserveInstance = await getDeployedProxiedContract<ReserveInstance>(
      'Reserve',
      ArtifactsSingleton.getInstance(ASTONIC_PACKAGE)
    )
    await reserve.addExchangeSpender(grandaMento.address)

    for (const stableToken of Object.keys(config.grandaMento.stableTokenExchangeLimits)) {
      const { min, max } = config.grandaMento.stableTokenExchangeLimits[stableToken]
      await grandaMento.setStableTokenExchangeLimits(stableToken, min, max)
    }
  },
  ASTONIC_PACKAGE
)
