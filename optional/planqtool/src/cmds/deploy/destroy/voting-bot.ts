import { switchToClusterFromEnv } from 'src/lib/cluster'
import { exitIfPlanqtoolHelmDryRun } from 'src/lib/helm_deploy'
import { removeHelmRelease } from 'src/lib/voting-bot'
import { DestroyArgv } from '../../deploy/destroy'

export const command = 'voting-bot'

export const describe = 'destroy the voting bot package'

export const builder = {}

export const handler = async (argv: DestroyArgv) => {
  exitIfPlanqtoolHelmDryRun()
  await switchToClusterFromEnv(argv.planqEnv)
  await removeHelmRelease(argv.planqEnv)
}
