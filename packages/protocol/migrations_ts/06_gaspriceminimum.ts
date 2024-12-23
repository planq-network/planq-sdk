/* tslint:disable:no-console */
import { PlanqContractName } from '@planq-network/protocol/lib/registry-utils'
import { deploymentForCoreContract } from '@planq-network/protocol/lib/web3-utils'
import { config } from '@planq-network/protocol/migrationsConfig'
import { toFixed } from '@planq-network/utils/lib/fixidity'
import { GasPriceMinimumInstance } from 'types'

const initializeArgs = async (): Promise<any[]> => {
  return [
    config.registry.predeployedProxyAddress,
    config.gasPriceMinimum.minimumFloor,
    toFixed(config.gasPriceMinimum.targetDensity).toString(),
    toFixed(config.gasPriceMinimum.adjustmentSpeed).toString(),
  ]
}

module.exports = deploymentForCoreContract<GasPriceMinimumInstance>(
  web3,
  artifacts,
  PlanqContractName.GasPriceMinimum,
  initializeArgs
)
