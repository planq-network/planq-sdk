import { addPlanqEnvMiddleware, PlanqEnvArgv } from 'src/lib/env-utils'
import yargs from 'yargs'

export const command = 'deploy <deployMethod> <deployPackage>'

export const describe = 'commands for deployment of various packages in the monorepo'

export type DeployArgv = PlanqEnvArgv

export const builder = (argv: yargs.Argv) => {
  return addPlanqEnvMiddleware(argv).commandDir('deploy', { extensions: ['ts'] })
}
export const handler = () => {
  // empty
}
