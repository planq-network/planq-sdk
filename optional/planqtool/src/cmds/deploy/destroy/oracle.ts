import { flow } from 'lodash'
import { addContextMiddleware, ContextArgv, switchToContextCluster } from 'src/lib/context-utils'
import { exitIfPlanqtoolHelmDryRun } from 'src/lib/helm_deploy'
import { CurrencyPair } from 'src/lib/k8s-oracle/base'
import { addCurrencyPairMiddleware, getOracleDeployerForContext } from 'src/lib/oracle'
import yargs from 'yargs'
import { DestroyArgv } from '../../deploy/destroy'

export const command = 'oracle'

export const describe = 'destroy the oracle package'

type OracleDestroyArgv = DestroyArgv &
  ContextArgv & {
    currencyPair: CurrencyPair
  }

export const builder = (argv: yargs.Argv) => {
  return flow([addContextMiddleware, addCurrencyPairMiddleware])(argv)
}

export const handler = async (argv: OracleDestroyArgv) => {
  exitIfPlanqtoolHelmDryRun()
  const clusterManager = await switchToContextCluster(argv.planqEnv, argv.context)
  const deployer = getOracleDeployerForContext(
    argv.planqEnv,
    argv.context,
    argv.currencyPair,
    false, // doesn't matter if we are using forno as we are just going to remove the chart
    clusterManager
  )
  await deployer.removeChart()
}
