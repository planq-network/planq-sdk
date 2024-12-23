import { PlanqContractName } from '@planq-network/protocol/lib/registry-utils'
import {
  deploymentForProxiedContract,
  transferOwnershipOfProxy,
} from '@planq-network/protocol/lib/web3-utils'
import { config } from '@planq-network/protocol/migrationsConfig'
import { GovernanceApproverMultiSigInstance } from 'types'

const initializeArgs = async (): Promise<any[]> => {
  return [
    config.governanceApproverMultiSig.signatories,
    config.governanceApproverMultiSig.numRequiredConfirmations,
    config.governanceApproverMultiSig.numInternalRequiredConfirmations,
  ]
}

module.exports = deploymentForProxiedContract<GovernanceApproverMultiSigInstance>(
  web3,
  artifacts,
  PlanqContractName.GovernanceApproverMultiSig,
  initializeArgs,
  async (governanceApproverMultiSig: GovernanceApproverMultiSigInstance) => {
    await transferOwnershipOfProxy(
      PlanqContractName.GovernanceApproverMultiSig,
      governanceApproverMultiSig.address,
      artifacts
    )
  }
)
