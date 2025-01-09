import { PlanqContractName } from '@planq-network/protocol/lib/registry-utils'
import {
  deploymentForCoreContract,
  getDeployedProxiedContract,
} from '@planq-network/protocol/lib/web3-utils'
import { AccountsInstance, RegistryInstance } from 'types'

const initializeArgs = async (): Promise<[string]> => {
  const registry: RegistryInstance = await getDeployedProxiedContract<RegistryInstance>(
    'Registry',
    artifacts
  )
  return [registry.address]
}

module.exports = deploymentForCoreContract<AccountsInstance>(
  web3,
  artifacts,
  PlanqContractName.Accounts,
  initializeArgs,
  async (accounts: AccountsInstance) => {
    await accounts.setEip712DomainSeparator()
  }
)
