import { execCmd } from 'src/lib/cmd-utils'
import { envVar, fetchEnv } from 'src/lib/env-utils'
import {
  installGenericHelmChart,
  removeGenericHelmChart,
  upgradeGenericHelmChart,
} from 'src/lib/helm_deploy'
const yaml = require('js-yaml')
const helmChartPath = '../helm-charts/leaderboard'

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

export async function upgradeHelmChart(planqEnv: string) {
  await upgradeGenericHelmChart({
    namespace: planqEnv,
    releaseName: releaseName(planqEnv),
    chartDir: helmChartPath,
    parameters: await helmParameters(planqEnv),
  })
}

export async function helmParameters(planqEnv: string) {
  const dbValues = await getBlockscoutHelmValues(planqEnv)
  return [
    `--set leaderboard.db.connection_name=${dbValues.connection_name}`,
    `--set leaderboard.db.username=${dbValues.username}`,
    `--set leaderboard.db.password=${dbValues.password}`,
    `--set leaderboard.image.repository=${fetchEnv(envVar.LEADERBOARD_DOCKER_IMAGE_REPOSITORY)}`,
    `--set leaderboard.image.tag=${fetchEnv(envVar.LEADERBOARD_DOCKER_IMAGE_TAG)}`,
    `--set leaderboard.sheet=${fetchEnv(envVar.LEADERBOARD_SHEET)}`,
    `--set leaderboard.token=${fetchEnv(envVar.LEADERBOARD_TOKEN)}`,
    `--set leaderboard.credentials=${fetchEnv(envVar.LEADERBOARD_CREDENTIALS)}`,
    `--set leaderboard.web3=https://${planqEnv}-forno.${fetchEnv(envVar.CLUSTER_DOMAIN_NAME)}.org`,
  ]
}

function releaseName(planqEnv: string) {
  return `${planqEnv}-leaderboard`
}

export async function getBlockscoutHelmValues(planqEnv: string) {
  const [output] = await execCmd(`helm get values ${planqEnv}-blockscout`)
  const blockscoutValues: any = yaml.safeLoad(output)
  return blockscoutValues.blockscout.db
}
