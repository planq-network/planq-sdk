import { switchToClusterFromEnv } from 'src/lib/cluster'
import { removeHelmRelease } from 'src/lib/eksportisto'
import { exitIfPlanqtoolHelmDryRun } from 'src/lib/helm_deploy'
import { DestroyArgv } from '../../deploy/destroy'

export const command = 'eksportisto'

export const describe = 'destroy the eksportisto deploy'

export const builder = {}

export const handler = async (argv: DestroyArgv) => {
  exitIfPlanqtoolHelmDryRun()
  await switchToClusterFromEnv(argv.planqEnv)
  await removeHelmRelease(argv.planqEnv)
}
