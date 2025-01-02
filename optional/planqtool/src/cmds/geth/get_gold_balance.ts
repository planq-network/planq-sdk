import { execCmdWithExitOnFailure } from 'src/lib/cmd-utils'
import { addPlanqEnvMiddleware } from 'src/lib/env-utils'
import { addPlanqGethMiddleware, ensure0x } from 'src/lib/utils'
import yargs from 'yargs'
import { GethArgv } from '../geth'

export const command = 'get planq balance'

export const describe = 'command for initializing geth'

interface GetPlanqBalanceArgv extends GethArgv {
  account: string
}

export const builder = (argv: yargs.Argv) => {
  return addPlanqGethMiddleware(addPlanqEnvMiddleware(argv)).option('account', {
    type: 'string',
    description: 'Account to get balance for',
    default: null,
  })
}

const invalidArgumentExit = (argumentName?: string, errorMessage?: string) => {
  console.error(`Invalid argument ${argumentName}: ${errorMessage}`)
  process.exit(1)
}

export const handler = async (argv: GetPlanqBalanceArgv) => {
  const gethBinary = `${argv.gethDir}/build/bin/geth`
  const datadir = argv.dataDir
  let account = argv.account

  if (account === null || account.length === 0) {
    invalidArgumentExit(account, 'Account must be provided')
    // This return is required to prevent false lint errors in the code following this line
    return
  }
  account = ensure0x(account)
  if (account.length !== 42) {
    invalidArgumentExit(account, 'Account must be 40 hex-chars')
  }

  const jsCmd = `eth.getBalance\('${account}'\)`
  const returnValues = await execGethJsCmd(gethBinary, datadir, jsCmd)
  console.info('Planq balance: ' + returnValues[0])
}

export const execGethJsCmd = (gethBinary: string, datadir: string, jsCmd: string) => {
  return execCmdWithExitOnFailure(`${gethBinary} -datadir "${datadir}" attach --exec "${jsCmd}"`)
}
