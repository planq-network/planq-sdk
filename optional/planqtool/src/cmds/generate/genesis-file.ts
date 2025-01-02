import { addPlanqEnvMiddleware, PlanqEnvArgv } from 'src/lib/env-utils'
import { generateGenesisFromEnv } from 'src/lib/generate_utils'
import yargs from 'yargs'

export const command = 'genesis-file'

export const describe = 'command for creating the genesis file by the current environment'

type GenesisFileArgv = PlanqEnvArgv

export const builder = (argv: yargs.Argv) => {
  return addPlanqEnvMiddleware(argv)
}

export const handler = async (_argv: GenesisFileArgv) => {
  const genesisFile = generateGenesisFromEnv()
  console.info(genesisFile)
}
