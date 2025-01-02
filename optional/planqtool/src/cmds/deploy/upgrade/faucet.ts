import { execSync } from 'child_process'
import { config } from 'dotenv'
import { downloadArtifacts, getContractAddresses } from 'src/lib/artifacts'
import { switchToClusterFromEnv } from 'src/lib/cluster'
import { execCmd } from 'src/lib/cmd-utils'
import { addPlanqEnvMiddleware, getEnvFile } from 'src/lib/env-utils'
import {
  coerceMnemonicAccountType,
  generatePrivateKey,
  privateKeyToAddress,
} from 'src/lib/generate_utils'
import { exitIfPlanqtoolHelmDryRun } from 'src/lib/helm_deploy'
import { portForwardAnd } from 'src/lib/port_forward'
import yargs from 'yargs'
import { UpgradeArgv } from '../../deploy/upgrade'

export const command = 'faucet'

export const describe = 'upgrade the faucet (requires firebase login permissions)'

interface UpgradeFaucetArgs extends UpgradeArgv {
  firebaseProject: string
}

export const builder = (argv: yargs.Argv) => {
  return addPlanqEnvMiddleware(argv).option('firebaseProject', {
    type: 'string',
    demand: 'Should be one of planq-faucet or planq-faucet-staging',
    description: 'the name of the firebase project to use (planq-faucet or planq-faucet-staging)',
  })
}

function getEnvMnemonic(env: string): string {
  const envMemonicResult = config({ path: getEnvFile(env, '.mnemonic') })

  if (envMemonicResult.error) {
    throw envMemonicResult.error
  } else if (envMemonicResult.parsed) {
    return envMemonicResult.parsed.MNEMONIC as string
  }
  throw new Error('Could not get mnmonic')
}

export const handler = async (argv: UpgradeFaucetArgs) => {
  exitIfPlanqtoolHelmDryRun()
  await switchToClusterFromEnv(argv.planqEnv)
  console.info(`Upgrading faucet for network ${argv.planqEnv} on project ${argv.firebaseProject}`)

  try {
    const mnemonic = getEnvMnemonic(argv.planqEnv)
    const privateKey = generatePrivateKey(mnemonic, coerceMnemonicAccountType('faucet'), 0)
    const address = privateKeyToAddress(privateKey)

    const fundFaucetAccounts = async () => {
      await execCmd(
        // TODO(joshua): Don't copy this from account/faucet in planqtool
        // TODO(yerdua): reimplement the protocol transfer script here, using
        //  the SDK + Web3 when the SDK can be built for multiple environments
        `yarn --cwd ../protocol run transfer -n ${argv.planqEnv} -a ${address} -d 20000 -g 20000`
      )
    }

    await downloadArtifacts(argv.planqEnv)
    const addressMap = await getContractAddresses(argv.planqEnv, [
      'escrow',
      'planqToken',
      'stableToken',
    ])

    console.info(`Switching to firebase project ${argv.firebaseProject}`)
    await execCmd(`yarn --cwd ../faucet firebase use ${argv.firebaseProject}`)

    console.info(`Updating contract addresses for ${argv.planqEnv} on ${argv.firebaseProject}`)
    await execCmd(
      `yarn --cwd ../faucet cli config:set --net ${argv.planqEnv} --escrowAddress ${addressMap.escrow} --planqTokenAddress ${addressMap.planqToken} --stableTokenAddress ${addressMap.stableToken}`
    )
    console.info(`Redepolying functions (neeeded for config changes to take place)`)
    await execCmd('yarn --cwd ../faucet cli deploy:functions')

    // // Need to clear because we generate the same account each time here.
    console.info(`Clearing accounts for network ${argv.planqEnv} on ${argv.firebaseProject}`)
    await execSync(`yarn --cwd ../faucet cli accounts:clear --net ${argv.planqEnv}`, {
      stdio: 'inherit',
    })

    console.info(`Adding one faucet account for network ${argv.planqEnv} on ${argv.firebaseProject}`)
    await execCmd(
      `yarn --cwd ../faucet cli accounts:add ${privateKey} ${address} --net ${argv.planqEnv}`
    )

    console.info(`Funding account ${address} on ${argv.planqEnv}`)
    await portForwardAnd(argv.planqEnv, fundFaucetAccounts)

    console.info(
      `Done updating contract addresses and funding the faucet account for network ${argv.planqEnv} in ${argv.firebaseProject}`
    )
    console.info('Please double check the TX node IP address to ensure it did not change.')
    process.exit(0)
  } catch (error) {
    console.error(`Unable to upgrade faucet on ${argv.planqEnv}`)
    console.error(error)
    process.exit(1)
  }
}
