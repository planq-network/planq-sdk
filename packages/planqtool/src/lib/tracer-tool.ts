import { getEnodesAddresses } from 'src/lib/geth'
import {
  installGenericHelmChart,
  removeGenericHelmChart,
  upgradeGenericHelmChart,
} from 'src/lib/helm_deploy'
import { envVar, fetchEnv } from './env-utils'

const chartDir = '../helm-charts/tracer-tool/'

function releaseName(planqEnv: string) {
  return `${planqEnv}-tracer-tool`
}

export async function installHelmChart(planqEnv: string) {
  await installGenericHelmChart({
    namespace: planqEnv,
    releaseName: releaseName(planqEnv),
    chartDir,
    parameters: await helmParameters(planqEnv),
  })
}

export async function upgradeHelmChart(planqEnv: string) {
  await upgradeGenericHelmChart({
    namespace: planqEnv,
    releaseName: releaseName(planqEnv),
    chartDir,
    parameters: await helmParameters(planqEnv),
  })
}

export async function removeHelmRelease(planqEnv: string) {
  await removeGenericHelmChart(releaseName(planqEnv), planqEnv)
}

async function helmParameters(planqEnv: string) {
  const enodes = await getEnodesAddresses(planqEnv)
  const b64EnodesJSON = Buffer.from(JSON.stringify(enodes, null, 0)).toString('base64')

  return [
    `--namespace ${planqEnv}`,
    `--set imageRepository=${fetchEnv(envVar.PLQTOOL_DOCKER_IMAGE_REPOSITORY)}`,
    `--set imageTag=${fetchEnv(envVar.PLQTOOL_DOCKER_IMAGE_TAG)}`,
    `--set environment=${planqEnv}`,
    `--set enodes="${b64EnodesJSON}"`,
  ]
}
