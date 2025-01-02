import { sleep } from '@planq-network/utils/lib/async'
import { exitIfPlanqtoolHelmDryRun } from 'src/lib/helm_deploy'
import yargs from 'yargs'
import { UpgradeArgv } from '../../deploy/upgrade'
import { handler as contractsHandler } from '../initial/contracts'
import { handler as planqstatsHandler } from './planqstats'
import { handler as testnetHandler } from './testnet'

export const command = 'all'

export const describe = 'upgrades a typical deploy'

type AllArgv = UpgradeArgv & {
  reset: boolean
  useExistingGenesis: boolean
  skipFaucetting: boolean
  tag: string
  suffix: string
}

export const builder = (argv: yargs.Argv) => {
  return argv
    .option('reset', {
      describe: 'indicates a reset',
      default: false,
      type: 'boolean',
    })
    .option('useExistingGenesis', {
      type: 'boolean',
      description: 'Instead of generating a new genesis, use an existing genesis in GCS',
      default: false,
    })
    .option('skipFaucetting', {
      describe: 'skips allocation of pUSD to any oracle or bot accounts',
      default: false,
      type: 'boolean',
    })
    .option('tag', {
      type: 'string',
      description: 'Docker image tag to deploy',
      default: '',
    })
    .option('suffix', {
      type: 'string',
      description: 'Instance suffix',
      default: '',
    })
}

export const handler = async (argv: AllArgv) => {
  exitIfPlanqtoolHelmDryRun()
  console.info('Deploy the testnet')
  await testnetHandler(argv)
  console.info('Deploy planqstats')
  await planqstatsHandler(argv)

  if (argv.reset === true) {
    console.info('Sleeping for 5 minutes to let pods come up')
    await sleep(300000)
    console.info('Deploy contracts')
    await contractsHandler(argv)
  }
}
