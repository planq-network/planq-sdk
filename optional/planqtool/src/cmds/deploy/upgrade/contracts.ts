import { downloadArtifacts, uploadArtifacts } from 'src/lib/artifacts'
import { switchToClusterFromEnv } from 'src/lib/cluster'
import { execCmd } from 'src/lib/cmd-utils'
import { exitIfPlanqtoolHelmDryRun } from 'src/lib/helm_deploy'
import { migrationOverrides, truffleOverrides } from 'src/lib/migration-utils'
import { portForwardAnd } from 'src/lib/port_forward'
import yargs from 'yargs'
import { UpgradeArgv } from '../../deploy/upgrade'

export const command = 'contracts'

export const describe = 'upgrade the planq smart contracts'

type ContractsArgv = UpgradeArgv & {
  skipFaucetting: boolean
}

export const builder = (argv: yargs.Argv) => {
  return argv.option('skipFaucetting', {
    describe: 'skips allocation of pUSD to any oracle or bot accounts',
    default: false,
    type: 'boolean',
  })
}

export const handler = async (argv: ContractsArgv) => {
  exitIfPlanqtoolHelmDryRun()
  await switchToClusterFromEnv(argv.planqEnv)

  console.info(`Upgrading smart contracts on ${argv.planqEnv}`)
  const cb = async () => {
    await execCmd(
      `yarn --cwd ../protocol run migrate -n ${argv.planqEnv} -c '${JSON.stringify(
        truffleOverrides()
      )}' -m '${JSON.stringify(await migrationOverrides(!argv.skipFaucetting))}'`
    )
  }

  try {
    await downloadArtifacts(argv.planqEnv)
    await portForwardAnd(argv.planqEnv, cb)
    await uploadArtifacts(argv.planqEnv)
    process.exit(0)
  } catch (error) {
    console.error(`Unable to upgrade smart contracts on ${argv.planqEnv}`)
    console.error(error)
    process.exit(1)
  }
}
