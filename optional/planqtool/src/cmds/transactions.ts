import { addPlanqEnvMiddleware, PlanqEnvArgv } from 'src/lib/env-utils'
import { Argv } from 'yargs'

export const command = 'transactions <command>'

export const describe = 'commands for reading transaction data'

export type TransactionsArgv = PlanqEnvArgv

export function builder(argv: Argv) {
  return addPlanqEnvMiddleware(argv).commandDir('transactions', { extensions: ['ts'] })
}

export function handler() {
  // empty
}
