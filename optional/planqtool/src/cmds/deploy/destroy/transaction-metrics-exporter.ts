import { switchToClusterFromEnv } from 'src/lib/cluster'
import { exitIfPlanqtoolHelmDryRun } from 'src/lib/helm_deploy'
import { removeHelmRelease } from 'src/lib/transaction-metrics-exporter'
import { DestroyArgv } from '../../deploy/destroy'

export const command = 'transaction-metrics-exporter'

export const describe = 'destroy the transaction metrics exporter deploy'

export const builder = {}

export const handler = async (argv: DestroyArgv) => {
  exitIfPlanqtoolHelmDryRun()
  await switchToClusterFromEnv(argv.planqEnv)
  await removeHelmRelease(argv.planqEnv)
}
