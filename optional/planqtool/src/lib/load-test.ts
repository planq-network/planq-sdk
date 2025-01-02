import sleep from 'sleep-promise'
import { LoadTestArgv } from 'src/cmds/deploy/initial/load-test'
import { getBlockscoutUrl } from 'src/lib/endpoints'
import { envVar, fetchEnv } from 'src/lib/env-utils'
import { getEnodesWithExternalIPAddresses } from 'src/lib/geth'
import {
  installGenericHelmChart,
  removeGenericHelmChart,
  saveHelmValuesFile,
  upgradeGenericHelmChart,
} from 'src/lib/helm_deploy'
import { scaleResource } from 'src/lib/kubernetes'

const chartDir = '../helm-charts/load-test/'

function releaseName(planqEnv: string) {
  return `${planqEnv}-load-test`
}

export async function installHelmChart(
  planqEnv: string,
  blockscoutProb: number,
  delayMs: number,
  replicas: number,
  threads: number
) {
  const params = await helmParameters(planqEnv, blockscoutProb, delayMs, replicas, threads)
  return installGenericHelmChart({
    namespace: planqEnv,
    releaseName: releaseName(planqEnv),
    chartDir,
    parameters: params,
  })
}

export async function upgradeHelmChart(
  planqEnv: string,
  blockscoutProb: number,
  delayMs: number,
  replicas: number,
  threads: number
) {
  const params = await helmParameters(planqEnv, blockscoutProb, delayMs, replicas, threads)
  await upgradeGenericHelmChart({
    namespace: planqEnv,
    releaseName: releaseName(planqEnv),
    chartDir,
    parameters: params,
  })
}

// scales down all pods, upgrades, then scales back up
export async function resetAndUpgrade(
  planqEnv: string,
  blockscoutProb: number,
  delayMs: number,
  replicas: number,
  threads: number
) {
  const loadTestStatefulSetName = `${planqEnv}-load-test`

  console.info('Scaling load-test StatefulSet down to 0...')
  await scaleResource(planqEnv, 'StatefulSet', loadTestStatefulSetName, 0)

  await sleep(3000)

  await upgradeHelmChart(planqEnv, blockscoutProb, delayMs, replicas, threads)

  await sleep(3000)

  console.info(`Scaling load-test StatefulSet back up to ${replicas}...`)
  await scaleResource(planqEnv, 'StatefulSet', loadTestStatefulSetName, replicas)
}

export function setArgvDefaults(argv: LoadTestArgv) {
  // Variables from the .env file are not set as environment variables
  // by the time the builder is run, so we set the default here
  if (argv.delay < 0) {
    argv.delay = parseInt(fetchEnv(envVar.LOAD_TEST_TX_DELAY_MS), 10)
  }
  if (argv.replicas < 0) {
    argv.replicas = parseInt(fetchEnv(envVar.LOAD_TEST_CLIENTS), 10)
  }
  if (argv.threads < 0) {
    argv.replicas = parseInt(fetchEnv(envVar.LOAD_TEST_THREADS), 1)
  }
}

export async function removeHelmRelease(planqEnv: string) {
  return removeGenericHelmChart(`${planqEnv}-load-test`, planqEnv)
}

async function helmParameters(
  planqEnv: string,
  blockscoutProb: number,
  delayMs: number,
  replicas: number,
  threads: number
) {
  const enodes = await getEnodesWithExternalIPAddresses(planqEnv)
  const staticNodesJsonB64 = Buffer.from(JSON.stringify(enodes)).toString('base64')
  // Uses the genesis file from google storage to ensure it's the correct genesis for the network
  const valueFilePath = `/tmp/${planqEnv}-testnet-values.yaml`
  await saveHelmValuesFile(planqEnv, valueFilePath, true, true)

  return [
    `-f ${valueFilePath}`,
    `--set geth.accountSecret="${fetchEnv(envVar.GETH_ACCOUNT_SECRET)}"`,
    `--set blockscout.measurePercent=${blockscoutProb}`,
    `--set blockscout.url=${getBlockscoutUrl(planqEnv)}`,
    `--set planqtool.image.repository=${fetchEnv(envVar.PLQTOOL_DOCKER_IMAGE_REPOSITORY)}`,
    `--set planqtool.image.tag=${fetchEnv(envVar.PLQTOOL_DOCKER_IMAGE_TAG)}`,
    `--set delay=${delayMs}`, // send txs every 5 seconds
    `--set environment=${planqEnv}`,
    `--set geth.image.repository=${fetchEnv(envVar.GETH_NODE_DOCKER_IMAGE_REPOSITORY)}`,
    `--set geth.image.tag=${fetchEnv(envVar.GETH_NODE_DOCKER_IMAGE_TAG)}`,
    `--set geth.networkID=${fetchEnv(envVar.NETWORK_ID)}`,
    `--set geth.staticNodes="${staticNodesJsonB64}"`,
    `--set geth.verbosity=${fetchEnv('GETH_VERBOSITY')}`,
    `--set mnemonic="${fetchEnv(envVar.MNEMONIC)}"`,
    `--set replicas=${replicas}`,
    `--set threads=${threads}`,
    `--set genesis.useGenesisFileBase64=false`,
    `--set genesis.network=${planqEnv}`,
    `--set use_random_recipient=${fetchEnv(envVar.LOAD_TEST_USE_RANDOM_RECIPIENT)}`,
    `--set reuse_light_clients=true`,
  ]
}
