import { readFileSync, writeFileSync } from 'fs'
import { execCmdWithExitOnFailure } from 'src/lib/cmd-utils'
import { outputIncludes } from 'src/lib/utils'
import { createNamespaceIfNotExists } from './cluster'
import { installGenericHelmChart, retrieveIPAddress, upgradeGenericHelmChart } from './helm_deploy'

const kongChartPath = '../helm-charts/kong'
const kongaChartPath = '../helm-charts/konga'

// One unique kong/a deployment per cluster
const kongReleaseName = 'kong'
const kongNamespace = 'kong'
const kongaReleaseName = 'konga'
const kongaNamespace = 'kong'

export async function installKong(planqEnv: string) {
  await createNamespaceIfNotExists(kongNamespace)
  await createUpdateKongConfigMap(planqEnv)
  // Update values in values-clabs.yaml file
  return installGenericHelmChart({
    namespace: kongNamespace,
    releaseName: kongReleaseName,
    chartDir: kongChartPath,
    parameters: await kongHelmParamenters(planqEnv),
    buildDependencies: true,
    valuesOverrideFile: 'values-clabs.yaml',
  })
}

export async function upgradeKong(planqEnv: string) {
  await createUpdateKongConfigMap(planqEnv)
  return upgradeGenericHelmChart({
    namespace: kongNamespace,
    releaseName: kongReleaseName,
    chartDir: kongChartPath,
    parameters: await kongHelmParamenters(planqEnv),
    buildDependencies: true,
    valuesOverrideFile: 'values-clabs.yaml',
  })
}

export async function installKonga(planqEnv: string) {
  await createNamespaceIfNotExists(kongaNamespace)
  // Update values in values.yaml file
  return installGenericHelmChart({
    namespace: kongaNamespace,
    releaseName: kongaReleaseName,
    chartDir: kongaChartPath,
    parameters: kongaHelmParamenters(planqEnv),
  })
}

export async function upgradeKonga(planqEnv: string) {
  return upgradeGenericHelmChart({
    namespace: kongaNamespace,
    releaseName: kongaReleaseName,
    chartDir: kongaChartPath,
    parameters: kongaHelmParamenters(planqEnv),
  })
}

export async function destroyKongAndKonga() {
  await execCmdWithExitOnFailure(`kubectl delete ns ${kongNamespace} ${kongaNamespace}`)
}

async function kongHelmParamenters(planqEnv: string) {
  // GCP Internal infra ips
  let trustedIPs = '130.211.0.0/22,35.191.0.0/16'
  const fornoPublicGlobalIp = await retrieveIPAddress(`${planqEnv}-forno-global-address`, 'global')
  trustedIPs = `${trustedIPs},${fornoPublicGlobalIp}/32`
  return [
    `--set kong.extraEnvVars[0].name=KONG_TRUSTED_IPS`,
    `--set kong.extraEnvVars[0].value='${trustedIPs.replace(/,/g, '\\,')}'`,
  ]
}

function kongaHelmParamenters(planqEnv: string) {
  return [`--set geth_rpc_service=${planqEnv}-fullnodes-rpc.${planqEnv}`]
}

/**
 * Creates a configMap with the kong configuration
 * Configuration is read from a kong config file inside the kong chart folder
 */
export async function createUpdateKongConfigMap(planqEnv: string) {
  const kongConfig = readFileSync(`${kongChartPath}/kong.conf`).toString()
  // We need to patch this file with the forno public ip as this ip will forward
  // the requests and need to put in the config file so kong/nginx can consider
  // that ip as internal
  let trustedIPs = '130.211.0.0/22,35.191.0.0/16'
  const fornoPublicGlobalIp = await retrieveIPAddress(`${planqEnv}-forno-global-address`, 'global')
  trustedIPs = `${trustedIPs},${fornoPublicGlobalIp}/32`
  const re = '/^trusted_ips = .+$/g'
  kongConfig.replace(re, `trusted_ips = ${trustedIPs}`)
  const kongConfigTmpFile = '/tmp/kong.conf'
  writeFileSync(kongConfigTmpFile, kongConfig)
  const configMapExists = await outputIncludes(
    `kubectl get cm -n ${kongNamespace} kong-config || true`,
    'kong-config'
  )
  if (configMapExists) {
    await execCmdWithExitOnFailure(
      `kubectl create cm kong-config -n ${kongNamespace} --from-file ${kongConfigTmpFile} -o yaml --dry-run | kubectl replace -f -`
    )
  } else {
    await execCmdWithExitOnFailure(
      `kubectl create cm kong-config -n ${kongNamespace} --from-file ${kongConfigTmpFile}`
    )
  }
}
