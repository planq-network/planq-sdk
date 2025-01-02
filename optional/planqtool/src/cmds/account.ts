import { addPlanqEnvMiddleware, PlanqEnvArgv } from 'src/lib/env-utils'
import yargs from 'yargs'

export const command = 'account <accountCommand>'

export const describe = 'commands for inviting, fauceting, looking up accounts and users'

export type AccountArgv = PlanqEnvArgv

export const builder = (argv: yargs.Argv) => {
  return addPlanqEnvMiddleware(argv).commandDir('account', { extensions: ['ts'] })
}
export const handler = () => {
  // empty
}
