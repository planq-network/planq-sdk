/* tslint:disable:no-console */
import { PlanqContractName } from '@planq-network/protocol/lib/registry-utils'
import { deploymentForCoreContract } from '@planq-network/protocol/lib/web3-utils'
import { config } from '@planq-network/protocol/migrationsConfig'
import { toFixed } from '@planq-network/utils/lib/fixidity'
import { ElectionInstance } from 'types'

const initializeArgs = async (): Promise<any[]> => {
  return [
    config.registry.predeployedProxyAddress,
    config.election.minElectableValidators,
    config.election.maxElectableValidators,
    config.election.maxVotesPerAccount,
    toFixed(config.election.electabilityThreshold).toFixed(),
  ]
}

module.exports = deploymentForCoreContract<ElectionInstance>(
  web3,
  artifacts,
  PlanqContractName.Election,
  initializeArgs
)
