/* tslint:disable no-console */
import { addPlanqEnvMiddleware, PlanqEnvArgv } from 'src/lib/env-utils'
import {
  coerceMnemonicAccountType,
  getAddressFromEnv,
  MNEMONIC_ACCOUNT_TYPE_CHOICES,
} from 'src/lib/generate_utils'
import yargs from 'yargs'

export const command = 'address-from-env'

export const describe = 'command for fetching addresses as specified by the current environment'

interface AccountAddressArgv extends PlanqEnvArgv {
  index: number
  accountType: string
}

export const builder = (argv: yargs.Argv) => {
  return addPlanqEnvMiddleware(
    argv
      .option('index', {
        alias: 'i',
        type: 'number',
        description: 'account index',
        demand: 'Please specifiy account index',
      })
      .option('accountType', {
        alias: 'a',
        type: 'string',
        choices: MNEMONIC_ACCOUNT_TYPE_CHOICES,
        description: 'account type',
        demand: 'Please specifiy account type',
        required: true,
      })
  )
}

export const handler = async (argv: PlanqEnvArgv & AccountAddressArgv) => {
  const validatorAddress = getAddressFromEnv(
    coerceMnemonicAccountType(argv.accountType),
    argv.index
  )
  console.info(validatorAddress)
}
