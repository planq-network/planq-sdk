import { DestroyArgv } from 'src/cmds/deploy/destroy'
import { addContextMiddleware, ContextArgv, switchToContextCluster } from 'src/lib/context-utils'
import { removeFullNodeChart } from 'src/lib/fullnodes'
import { delinkSAForWorkloadIdentity, removeKubectlAnnotateKSA } from 'src/lib/gcloud_utils'
import { exitIfPlanqtoolHelmDryRun } from 'src/lib/helm_deploy'

export const command = 'fullnodes'

export const describe = 'deploy full-nodes in a particular context'

type FullNodeDestroyArgv = DestroyArgv & ContextArgv

export const builder = addContextMiddleware

export const handler = async (argv: FullNodeDestroyArgv) => {
  exitIfPlanqtoolHelmDryRun()
  await switchToContextCluster(argv.planqEnv, argv.context)
  await removeFullNodeChart(argv.planqEnv, argv.context)
  await removeKubectlAnnotateKSA(argv.planqEnv, argv.context)
  await delinkSAForWorkloadIdentity(argv.planqEnv, argv.context)
}
