import { PlanqContractName } from '@planq-network/protocol/lib/registry-utils'
import { deploymentForCoreContract } from '@planq-network/protocol/lib/web3-utils'
import { EscrowInstance } from 'types'

module.exports = deploymentForCoreContract<EscrowInstance>(
  web3,
  artifacts,
  PlanqContractName.Escrow,
  async () => []
)
