import { PlanqContractName } from '@planq-network/protocol/lib/registry-utils'
import {
  deploymentForProxiedContract,
  transferOwnershipOfProxy,
} from '@planq-network/protocol/lib/web3-utils'
import { config } from '@planq-network/protocol/migrationsConfig'
import { ReserveSpenderMultiSigInstance } from 'types/mento'
import { MENTO_PACKAGE } from '../contractPackages'
import { ArtifactsSingleton } from '../lib/artifactsSingleton'

const initializeArgs = async (): Promise<any[]> => {
  return [
    config.reserveSpenderMultiSig.signatories,
    config.reserveSpenderMultiSig.numRequiredConfirmations,
    config.reserveSpenderMultiSig.numInternalRequiredConfirmations,
  ]
}

module.exports = deploymentForProxiedContract<ReserveSpenderMultiSigInstance>(
  web3,
  artifacts,
  PlanqContractName.ReserveSpenderMultiSig,
  initializeArgs,
  async (reserveSpenderMultiSig: ReserveSpenderMultiSigInstance) => {
    await transferOwnershipOfProxy(
      PlanqContractName.ReserveSpenderMultiSig,
      reserveSpenderMultiSig.address,
      ArtifactsSingleton.getInstance(MENTO_PACKAGE)
    )
  },
  MENTO_PACKAGE
)
