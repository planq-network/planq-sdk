import { PlanqContractName } from '@planq-network/protocol/lib/registry-utils'
import { deploymentForCoreContract } from '@planq-network/protocol/lib/web3-utils'
import { FederatedAttestationsInstance } from 'types'

const initializeArgs = async () => {
  return []
}

module.exports = deploymentForCoreContract<FederatedAttestationsInstance>(
  web3,
  artifacts,
  PlanqContractName.FederatedAttestations,
  initializeArgs
)
