import { parse } from 'dotenv'
import { readFileSync, writeFileSync } from 'fs'
import { map, merge, reduce } from 'lodash'
import path from 'path'
import { PlanqEnvArgv, genericEnvFilePath, isValidPlanqEnv, monorepoRoot } from 'src/lib/env-utils'
import yargs from 'yargs'
export const command = 'fork-env <newEnvName>'

export const describe = 'command for forking an environment off the default .env file'

interface ForkEnvArgs extends PlanqEnvArgv {
  envVars: string
  newEnvName: string
}

export const builder = (args: yargs.Argv) => {
  return args
    .positional('newEnvName', {
      coerce: (newEnvName: string) => {
        if (isValidPlanqEnv(newEnvName)) {
          return newEnvName
        }

        throw new Error(`Invalid new env name: ${newEnvName}`)
      },
    })
    .option('envVars', {
      type: 'array',
      description: 'environment variables you want to override, with ENV_NAME=value',
      default: [],
      alias: 'e',
    })
}

export const handler = async (argv: ForkEnvArgs) => {
  const genericEnvFile = readFileSync(genericEnvFilePath)
  const defaultEnvVars = parse(genericEnvFile)

  const envVarsToOverride = reduce(map(argv.envVars, parse), merge, {})

  const mergedEnvVars = { ...defaultEnvVars, ...envVarsToOverride }
  const newEnvFile = map(mergedEnvVars, (value, key) => `${key}="${value}"`).join('\n')
  writeFileSync(path.resolve(monorepoRoot, `.env.${argv.newEnvName}`), newEnvFile)
}
