import { createClusterIfNotExists, switchToClusterFromEnv } from 'src/lib/cluster'
import { exitIfPlanqtoolHelmDryRun } from 'src/lib/helm_deploy'
import { removeHelmRelease } from 'src/lib/leaderboard'
import { DestroyArgv } from '../../deploy/destroy'

export const command = 'leaderboard'

export const describe = 'destroy the leaderboard package'

export const builder = {}

export const handler = async (argv: DestroyArgv) => {
  exitIfPlanqtoolHelmDryRun()
  await createClusterIfNotExists()
  await switchToClusterFromEnv(argv.planqEnv)

  await removeHelmRelease(argv.planqEnv)
}
