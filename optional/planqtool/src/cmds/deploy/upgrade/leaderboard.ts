import { UpgradeArgv } from 'src/cmds/deploy/upgrade'
import { createClusterIfNotExists, switchToClusterFromEnv } from 'src/lib/cluster'
import { isPlanqtoolHelmDryRun } from 'src/lib/helm_deploy'
import { installHelmChart, removeHelmRelease, upgradeHelmChart } from 'src/lib/leaderboard'
import yargs from 'yargs'

export const command = 'leaderboard'

export const describe = 'upgrade the leaderboard package'

type LeaderboardArgv = UpgradeArgv & {
  reset: boolean
}

export const builder = (argv: yargs.Argv) => {
  return argv.option('reset', {
    description: 'Destroy & redeploy the leaderboard package',
    default: false,
    type: 'boolean',
  })
}

export const handler = async (argv: LeaderboardArgv) => {
  if (!isPlanqtoolHelmDryRun()) {
    await createClusterIfNotExists()
  }
  await switchToClusterFromEnv(argv.planqEnv)

  if (argv.reset === true && !isPlanqtoolHelmDryRun()) {
    await removeHelmRelease(argv.planqEnv)
    await installHelmChart(argv.planqEnv)
  } else {
    await upgradeHelmChart(argv.planqEnv)
  }
}
