import { InitialArgv } from 'src/cmds/deploy/initial'
import { addContextMiddleware, ContextArgv, switchToContextCluster } from 'src/lib/context-utils'
import { exitIfPlanqtoolHelmDryRun } from 'src/lib/helm_deploy'
import { installHelmChart } from 'src/lib/komenci'
import yargs from 'yargs'

export const command = 'komenci'

export const describe = 'deploy the komenci for the specified network'

type KomenciInitialArgv = InitialArgv &
  ContextArgv & {
    useForno: boolean
  }

export const builder = (argv: yargs.Argv) => {
  return addContextMiddleware(argv).option('useForno', {
    description: 'Uses forno for RPCs from the komenci clients',
    default: false,
    type: 'boolean',
  })
}

export const handler = async (argv: KomenciInitialArgv) => {
  // Do not allow --helmdryrun because komenciIdentityHelmParameters function. It could be refactored to allow
  exitIfPlanqtoolHelmDryRun()
  await switchToContextCluster(argv.planqEnv, argv.context)
  await installHelmChart(argv.planqEnv, argv.context, argv.useForno)
}
