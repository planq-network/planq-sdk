import { envVar, fetchEnv, fetchEnvOrFallback } from 'src/lib/env-utils'
import {
  installGenericHelmChart,
  removeGenericHelmChart,
  upgradeGenericHelmChart,
} from 'src/lib/helm_deploy'

const chartDir = '../helm-charts/transaction-metrics-exporter/'

function releaseName(planqEnv: string, suffix: string) {
  return `${planqEnv}-transaction-metrics-exporter-${suffix}`
}

export async function installHelmChart(planqEnv: string) {
  const suffix = fetchEnvOrFallback(envVar.TRANSACTION_METRICS_EXPORTER_SUFFIX, '1')
  await installGenericHelmChart({
    namespace: planqEnv,
    releaseName: releaseName(planqEnv, suffix),
    chartDir,
    parameters: await helmParameters(planqEnv),
  })
}

export async function upgradeHelmChart(planqEnv: string) {
  const suffix = fetchEnvOrFallback(envVar.TRANSACTION_METRICS_EXPORTER_SUFFIX, '1')
  await upgradeGenericHelmChart({
    namespace: planqEnv,
    releaseName: releaseName(planqEnv, suffix),
    chartDir,
    parameters: await helmParameters(planqEnv),
  })
}

export async function removeHelmRelease(planqEnv: string) {
  const suffix = fetchEnvOrFallback(envVar.TRANSACTION_METRICS_EXPORTER_SUFFIX, '1')
  await removeGenericHelmChart(releaseName(planqEnv, suffix), planqEnv)
}

async function helmParameters(planqEnv: string) {
  const suffix = fetchEnvOrFallback(envVar.TRANSACTION_METRICS_EXPORTER_SUFFIX, '1')
  const params = [
    `--namespace ${planqEnv}`,
    `--set environment="${planqEnv}"`,
    `--set imageRepository="${fetchEnv(
      envVar.TRANSACTION_METRICS_EXPORTER_DOCKER_IMAGE_REPOSITORY
    )}"`,
    `--set imageTag="${fetchEnv(envVar.TRANSACTION_METRICS_EXPORTER_DOCKER_IMAGE_TAG)}"`,
    `--set deploymentSuffix=${suffix}`,
    `--set fromBlock=${fetchEnvOrFallback(envVar.TRANSACTION_METRICS_EXPORTER_FROM_BLOCK, '0')}`,
    `--set toBlock=${fetchEnvOrFallback(envVar.TRANSACTION_METRICS_EXPORTER_FROM_BLOCK, '')}`,
    `--set blockInterval=${fetchEnvOrFallback(
      envVar.TRANSACTION_METRICS_EXPORTER_BLOCK_INTERVAL,
      '1'
    )}`,
    `--set watchAddress=${fetchEnvOrFallback(
      envVar.TRANSACTION_METRICS_EXPORTER_WATCH_ADDRESS,
      ''
    )}`,
  ]
  return params
}
