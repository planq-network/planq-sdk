import { createClusterIfNotExists, setupCluster, switchToClusterFromEnv } from 'src/lib/cluster'
import {
  createStaticIPs,
  installHelmChart,
  isPlanqtoolHelmDryRun,
  pollForBootnodeLoadBalancer,
} from 'src/lib/helm_deploy'
import { uploadTestnetInfoToGoogleStorage } from 'src/lib/testnet-utils'
import yargs from 'yargs'
import { InitialArgv } from '../../deploy/initial'

export const command = 'testnet'

export const describe = 'deploy the testnet package'

type TestnetInitialArgv = InitialArgv & {
  skipClusterSetup: boolean
  useExistingGenesis: boolean
}

export const builder = (argv: yargs.Argv) => {
  return argv
    .option('skipClusterSetup', {
      type: 'boolean',
      description: 'If you know that you can skip the cluster setup',
      default: false,
    })
    .option('useExistingGenesis', {
      type: 'boolean',
      description: 'Instead of generating a new genesis, use an existing genesis in GCS',
      default: false,
    })
}

export const handler = async (argv: TestnetInitialArgv) => {
  const createdCluster = await createClusterIfNotExists()
  await switchToClusterFromEnv(argv.planqEnv)

  if (!argv.skipClusterSetup) {
    await setupCluster(argv.planqEnv, createdCluster)
  }

  await createStaticIPs(argv.planqEnv)

  await installHelmChart(argv.planqEnv, argv.useExistingGenesis)
  if (!isPlanqtoolHelmDryRun()) {
    // When using an external bootnode, we have to await the bootnode's LB to be up first
    await pollForBootnodeLoadBalancer(argv.planqEnv)
    await uploadTestnetInfoToGoogleStorage(argv.planqEnv)
  }
}
