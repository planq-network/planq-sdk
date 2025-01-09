import { PlanqContractName } from '@planq-network/protocol/lib/registry-utils'
import { deploymentForCoreContract } from '@planq-network/protocol/lib/web3-utils'
import { config } from '@planq-network/protocol/migrationsConfig'
import { BlockchainParametersInstance } from 'types'

const initializeArgs = async (_: string): Promise<any[]> => {
  return [
    config.blockchainParameters.gasForNonPlanqCurrencies,
    config.blockchainParameters.deploymentBlockGasLimit,
    config.blockchainParameters.uptimeLookbackWindow,
  ]
}

module.exports = deploymentForCoreContract<BlockchainParametersInstance>(
  web3,
  artifacts,
  PlanqContractName.BlockchainParameters,
  initializeArgs
)
