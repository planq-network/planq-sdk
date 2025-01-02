/* tslint:disable no-console */
import { newKit } from '@planq-network/contractkit'
import { switchToClusterFromEnv } from 'src/lib/cluster'
import { convertToContractDecimals } from 'src/lib/contract-utils'
import { addPlanqEnvMiddleware, PlanqEnvArgv, envVar, fetchEnv } from 'src/lib/env-utils'
import { AccountType, generateAddress } from 'src/lib/generate_utils'
import { getIndexForLoadTestThread } from 'src/lib/geth'
import { portForwardAnd } from 'src/lib/port_forward'
import yargs from 'yargs'

interface FaucetLoadTest extends PlanqEnvArgv {
  planq: number
  dollars: number
  replica_from: number
  replica_to: number
  threads_from: number
  threads_to: number
}

export const command = 'faucet-load-test'

export const describe = 'command for fauceting the addresses used for load testing'

export const builder = (argv: yargs.Argv) => {
  return addPlanqEnvMiddleware(
    argv
      .option('planq', {
        type: 'number',
        description: 'Planq amount to transfer',
        default: 10,
      })
      .option('dollars', {
        type: 'number',
        description: 'Planq Dollars amount to transfer',
        default: 10,
      })
      .option('replica_from', {
        type: 'number',
        description: 'Index count from',
        demandOption: 'Please specify a key index',
      })
      .option('replica_to', {
        type: 'number',
        description: 'Index count to',
        demandOption: 'Please specify a key index',
      })
      .option('threads_from', {
        type: 'number',
        description: 'Index of key to generate',
        demandOption: 'Please specify a key threads_from',
      })
      .option('threads_to', {
        type: 'number',
        description: 'Index of key to generate',
        demandOption: 'Please specify a key threads_to',
      })
  )
}

export const handler = async (argv: PlanqEnvArgv & FaucetLoadTest) => {
  await switchToClusterFromEnv(argv.planqEnv)
  const accountType = AccountType.LOAD_TESTING_ACCOUNT
  const mnemonic = fetchEnv(envVar.MNEMONIC)

  const cb = async () => {
    const kit = newKit('http://localhost:8545')
    const account = (await kit.web3.eth.getAccounts())[0]
    console.log(`Using account: ${account}`)
    kit.defaultAccount = account

    const [planqToken, stableToken] = await Promise.all([
      kit.contracts.getPlanqToken(),
      kit.contracts.getStableToken(),
    ])

    const [planqAmount, stableTokenAmount] = await Promise.all([
      convertToContractDecimals(argv.planq, planqToken),
      convertToContractDecimals(argv.dollars, stableToken),
    ])

    for (let podIndex = argv.replica_from; podIndex <= argv.replica_to; podIndex++) {
      for (let threadIndex = argv.threads_from; threadIndex <= argv.threads_to; threadIndex++) {
        const index = getIndexForLoadTestThread(podIndex, threadIndex)
        const address = generateAddress(mnemonic, accountType, index)
        console.log(`${index} --> Fauceting ${planqAmount.toFixed()} Planq to ${address}`)
        await planqToken.transfer(address, planqAmount.toFixed()).send()
        console.log(`${index} --> Fauceting ${stableTokenAmount.toFixed()} Dollars to ${address}`)
        await stableToken.transfer(address, stableTokenAmount.toFixed()).send()
      }
    }
  }

  try {
    await portForwardAnd(argv.planqEnv, cb)
    await cb
  } catch (error) {
    console.error(`Unable to faucet load-test accounts on ${argv.planqEnv}`)
    console.error(error)
    process.exit(1)
  }
}
