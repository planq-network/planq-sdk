import { PlanqContractName } from '@planq-network/protocol/lib/registry-utils'
import { deploymentForCoreContract } from '@planq-network/protocol/lib/web3-utils'
import { config } from '@planq-network/protocol/migrationsConfig'
import { RandomInstance } from 'types'

const initializeArgs = async (_: string): Promise<any[]> => {
  return [config.random.randomnessBlockRetentionWindow]
}

module.exports = deploymentForCoreContract<RandomInstance>(
  web3,
  artifacts,
  PlanqContractName.Random,
  initializeArgs
)
