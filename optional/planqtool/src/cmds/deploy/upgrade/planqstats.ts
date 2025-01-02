import { installHelmChart, removeHelmRelease, upgradeHelmChart } from 'src/lib/planqstats'
import { switchToClusterFromEnv } from 'src/lib/cluster'
import yargs from 'yargs'
import { UpgradeArgv } from '../upgrade'

export const command = 'planqstats'

export const describe = 'upgrade the planqstats package'

type PlanqstatsArgv = UpgradeArgv & {
  reset: boolean
}

export const builder = (argv: yargs.Argv) => {
  return argv.option('reset', {
    description: 'Destroy & redeploy the planqstats package',
    default: false,
    type: 'boolean',
  })
}

export const handler = async (argv: PlanqstatsArgv) => {
  await switchToClusterFromEnv(argv.planqEnv)

  if (argv.reset === true) {
    await removeHelmRelease(argv.planqEnv)
    await installHelmChart(argv.planqEnv)
  } else {
    await upgradeHelmChart(argv.planqEnv)
  }
}
