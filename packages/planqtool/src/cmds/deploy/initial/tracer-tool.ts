import { switchToClusterFromEnv } from 'src/lib/cluster'
import { execCmdWithExitOnFailure } from 'src/lib/cmd-utils'
import { isPlanqtoolHelmDryRun } from 'src/lib/helm_deploy'
import { installHelmChart } from 'src/lib/tracer-tool'
import yargs from 'yargs'
import { InitialArgv } from '../../deploy/initial'
export const command = 'tracer-tool'

export const describe = 'deploy tracer-tool'

interface TracerToolArgv extends InitialArgv {
  faucet: boolean
}

export const builder = (argv: yargs.Argv) => {
  return argv.option('faucet', {
    type: 'boolean',
    description: 'Whether to faucet test accounts before deployment or no',
    default: false,
  })
}

const FIRST_ACCOUNT = '0x4da58d267cd465b9313fdb19b120ec591d957ad2'
const SECOND_ACCOUNT = '0xc70947239385c2422866e20b6cafffa29157e4b3'

export const handler = async (argv: TracerToolArgv) => {
  await switchToClusterFromEnv(argv.planqEnv)

  if (!argv.faucet || isPlanqtoolHelmDryRun()) {
    console.info(`Skipping fauceting test accounts...`)
  } else {
    console.info(`Fauceting test accounts...`)
    await execCmdWithExitOnFailure(
      `yarn --cwd ${process.cwd()} run cli account faucet -e ${
        argv.planqEnv
      } --account ${FIRST_ACCOUNT}`
    )
    await execCmdWithExitOnFailure(
      `yarn --cwd ${process.cwd()} run cli account faucet -e ${
        argv.planqEnv
      } --account ${SECOND_ACCOUNT}`
    )
  }

  await installHelmChart(argv.planqEnv)
}
