import { switchToClusterFromEnv } from 'src/lib/cluster'
import { exitIfPlanqtoolHelmDryRun } from 'src/lib/helm_deploy'
import { removeHelmRelease } from 'src/lib/mock-oracle'
import { DestroyArgv } from '../../deploy/destroy'

export const command = 'mock-oracle'

export const describe = 'destroy the mock oracle package'

export const builder = {}

export const handler = async (argv: DestroyArgv) => {
  exitIfPlanqtoolHelmDryRun()
  await switchToClusterFromEnv(argv.planqEnv)

  await removeHelmRelease(argv.planqEnv)
}
