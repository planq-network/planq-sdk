import { PlanqContractName } from '@planq-network/protocol/lib/registry-utils'
import { deploymentForCoreContract } from '@planq-network/protocol/lib/web3-utils'
import { OdisPaymentsInstance } from 'types'

const initializeArgs = async () => {
  return []
}

module.exports = deploymentForCoreContract<OdisPaymentsInstance>(
  web3,
  artifacts,
  PlanqContractName.OdisPayments,
  initializeArgs
)
