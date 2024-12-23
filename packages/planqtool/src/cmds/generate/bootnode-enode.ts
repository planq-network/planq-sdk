/* tslint:disable no-console */
import { addPlanqEnvMiddleware, PlanqEnvArgv } from 'src/lib/env-utils'
import { getBootnodeEnode } from 'src/lib/geth'
import yargs from 'yargs'

export const command = 'bootnode-enode'

export const describe = 'command for the bootnode enode address for an environment'

export const builder = (argv: yargs.Argv) => addPlanqEnvMiddleware(argv)

export const handler = async (argv: PlanqEnvArgv) => {
  console.info(await getBootnodeEnode(argv.planqEnv))
}
