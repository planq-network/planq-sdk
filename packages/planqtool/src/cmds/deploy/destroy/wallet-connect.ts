import { switchToClusterFromEnv } from 'src/lib/cluster'
import { exitIfPlanqtoolHelmDryRun } from 'src/lib/helm_deploy'
import { removeWalletConnect } from 'src/lib/wallet-connect'
import { DestroyArgv } from '../destroy'

export const command = 'walletconnect'

export const describe = 'deploy the walletconnect package'

export const builder = {}

export const handler = async (argv: DestroyArgv) => {
  exitIfPlanqtoolHelmDryRun()
  await switchToClusterFromEnv(argv.planqEnv)
  await removeWalletConnect()
}
