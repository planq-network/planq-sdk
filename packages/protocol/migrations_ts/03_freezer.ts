/* tslint:disable:no-console */
import { PlanqContractName } from '@planq-network/protocol/lib/registry-utils'
import { deploymentForCoreContract } from '@planq-network/protocol/lib/web3-utils'
import { FreezerInstance } from 'types'

const initializeArgs = async (): Promise<any[]> => {
  return []
}

module.exports = deploymentForCoreContract<FreezerInstance>(
  web3,
  artifacts,
  PlanqContractName.Freezer,
  initializeArgs
)
