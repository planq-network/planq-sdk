import { switchToClusterFromEnv } from 'src/lib/cluster'
import {
  isPlanqtoolHelmDryRun,
  resetAndUpgradeHelmChart,
  upgradeHelmChart,
  upgradeStaticIPs,
} from 'src/lib/helm_deploy'
import {
  uploadEnvFileToGoogleStorage,
  uploadTestnetStaticNodesToGoogleStorage,
} from 'src/lib/testnet-utils'
import yargs from 'yargs'
import { UpgradeArgv } from '../../deploy/upgrade'

export const command = 'testnet'
export const describe = 'upgrade an existing deploy of the testnet package'

type TestnetArgv = UpgradeArgv & {
  reset: boolean
  useExistingGenesis: boolean
}

export const builder = (argv: yargs.Argv) => {
  return argv
    .option('reset', {
      describe: 'deletes any chain data in persistent volume claims',
      default: false,
      type: 'boolean',
    })
    .option('useExistingGenesis', {
      type: 'boolean',
      description: 'Instead of generating a new genesis, use an existing genesis in GCS',
      default: false,
    })
}

export const handler = async (argv: TestnetArgv) => {
  await switchToClusterFromEnv(argv.planqEnv)

  await upgradeStaticIPs(argv.planqEnv)

  if (argv.reset === true) {
    await resetAndUpgradeHelmChart(argv.planqEnv, argv.useExistingGenesis)
  } else {
    await upgradeHelmChart(argv.planqEnv, argv.useExistingGenesis)
  }
  if (!isPlanqtoolHelmDryRun()) {
    await uploadTestnetStaticNodesToGoogleStorage(argv.planqEnv)
    await uploadEnvFileToGoogleStorage(argv.planqEnv)
  }
}
