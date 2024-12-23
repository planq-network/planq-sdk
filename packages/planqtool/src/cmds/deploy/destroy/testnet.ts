import { switchToClusterFromEnv } from 'src/lib/cluster'
import { deleteFromCluster, deleteStaticIPs, exitIfPlanqtoolHelmDryRun } from 'src/lib/helm_deploy'
import { DestroyArgv } from '../../deploy/destroy'

export const command = 'testnet'
export const describe = 'destroy an existing deploy of the testnet package'

export const builder = {}

export const handler = async (argv: DestroyArgv) => {
  exitIfPlanqtoolHelmDryRun()

  await switchToClusterFromEnv(argv.planqEnv)

  await deleteFromCluster(argv.planqEnv)
  await deleteStaticIPs(argv.planqEnv)
}
