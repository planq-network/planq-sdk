import { removeHelmRelease } from 'src/lib/planqstats'
import { switchToClusterFromEnv } from 'src/lib/cluster'
import { exitIfPlanqtoolHelmDryRun } from 'src/lib/helm_deploy'
import { DestroyArgv } from '../destroy'

export const command = 'planqstats'

export const describe = 'destroy the planqstats package'

export const builder = {}

export const handler = async (argv: DestroyArgv) => {
  exitIfPlanqtoolHelmDryRun()
  await switchToClusterFromEnv(argv.planqEnv)

  await removeHelmRelease(argv.planqEnv)
}
