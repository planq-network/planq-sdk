import { envVar, fetchEnv } from 'src/lib/env-utils'
import { getPrivateTxNodeClusterIP } from 'src/lib/geth'
import { installGenericHelmChart, removeGenericHelmChart } from 'src/lib/helm_deploy'

const helmChartPath = '../helm-charts/mock-oracle'

export async function installHelmChart(planqEnv: string) {
  return installGenericHelmChart({
    namespace: planqEnv,
    releaseName: releaseName(planqEnv),
    chartDir: helmChartPath,
    parameters: await helmParameters(planqEnv),
  })
}
export async function removeHelmRelease(planqEnv: string) {
  await removeGenericHelmChart(releaseName(planqEnv), planqEnv)
}

async function helmParameters(planqEnv: string) {
  const nodeIp = await getPrivateTxNodeClusterIP(planqEnv)
  const nodeUrl = `http://${nodeIp}:8545`
  return [
    `--set planqtool.image.repository=${fetchEnv(envVar.PLQTOOL_DOCKER_IMAGE_REPOSITORY)}`,
    `--set planqtool.image.tag=${fetchEnv(envVar.PLQTOOL_DOCKER_IMAGE_TAG)}`,
    `--set mnemonic="${fetchEnv(envVar.MNEMONIC)}"`,
    `--set oracle.cronSchedule="${fetchEnv(envVar.MOCK_ORACLE_CRON_SCHEDULE)}"`,
    `--set oracle.image.repository=${fetchEnv(envVar.MOCK_ORACLE_DOCKER_IMAGE_REPOSITORY)}`,
    `--set oracle.image.tag=${fetchEnv(envVar.MOCK_ORACLE_DOCKER_IMAGE_TAG)}`,
    `--set planqcli.nodeUrl=${nodeUrl}`,
    `--set planqcli.image.repository=${fetchEnv(envVar.PLQCLI_STANDALONE_IMAGE_REPOSITORY)}`,
    `--set planqcli.image.tag=${fetchEnv(envVar.PLQCLI_STANDALONE_IMAGE_TAG)}`,
  ]
}

function releaseName(planqEnv: string) {
  return `${planqEnv}-mock-oracle`
}
