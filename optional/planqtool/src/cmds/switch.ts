import { switchToClusterFromEnv } from 'src/lib/cluster'
import { addPlanqEnvMiddleware, PlanqEnvArgv } from 'src/lib/env-utils'
import yargs from 'yargs'

export const command = 'switch'

export const describe = 'command for switching to a particular environment'

// sets environment variables from .env
export const builder = (argv: yargs.Argv) => addPlanqEnvMiddleware(argv)

export const handler = async (argv: PlanqEnvArgv) => {
  await switchToClusterFromEnv(argv.planqEnv, false, true)
}
