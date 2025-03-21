import { flow } from 'lodash'
import { UpgradeArgv } from 'src/cmds/deploy/upgrade'
import { addContextMiddleware, ContextArgv, switchToContextCluster } from 'src/lib/context-utils'
import { CurrencyPair } from 'src/lib/k8s-oracle/base'
import {
  addCurrencyPairMiddleware,
  addUseFornoMiddleware,
  getOracleDeployerForContext,
} from 'src/lib/oracle'
import yargs from 'yargs'

export const command = 'oracle'

export const describe = 'upgrade the oracle(s) on an AKS cluster'

type OracleUpgradeArgv = UpgradeArgv &
  ContextArgv & {
    useForno: boolean
    currencyPair: CurrencyPair
  }

export const builder = (argv: yargs.Argv) => {
  return flow([addContextMiddleware, addCurrencyPairMiddleware, addUseFornoMiddleware])(argv)
}

export const handler = async (argv: OracleUpgradeArgv) => {
  const clusterManager = await switchToContextCluster(argv.planqEnv, argv.context)
  const deployer = getOracleDeployerForContext(
    argv.planqEnv,
    argv.context,
    argv.currencyPair,
    argv.useForno,
    clusterManager
  )
  await deployer.upgradeChart()
}
