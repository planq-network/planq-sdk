import {
  installGenericHelmChart,
  removeGenericHelmChart,
  upgradeGenericHelmChart,
} from 'src/lib/helm_deploy'
import { getBlockscoutUrl, getFornoUrl } from './endpoints'
import { envVar, fetchEnv, fetchEnvOrFallback } from './env-utils'
import { AccountType, getAddressesFor } from './generate_utils'

const helmChartPath = '../helm-charts/planqstats'

export async function installHelmChart(planqEnv: string) {
  return installGenericHelmChart({
    namespace: planqEnv,
    releaseName: releaseName(planqEnv),
    chartDir: helmChartPath,
    parameters: helmParameters(planqEnv),
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
    parameters: helmParameters(planqEnv),
  })
}

function helmParameters(planqEnv: string) {
  return [
    `--set domain.name=${fetchEnv(envVar.CLUSTER_DOMAIN_NAME)}`,
    `--set planqstats.image.server.repository=${fetchEnv(
      envVar.PLQSTATS_SERVER_DOCKER_IMAGE_REPOSITORY
    )}`,
    `--set planqstats.image.server.tag=${fetchEnv(envVar.PLQSTATS_SERVER_DOCKER_IMAGE_TAG)}`,
    `--set planqstats.image.frontend.repository=${fetchEnv(
      envVar.PLQSTATS_FRONTEND_DOCKER_IMAGE_REPOSITORY
    )}`,
    `--set planqstats.image.frontend.tag=${fetchEnv(envVar.PLQSTATS_FRONTEND_DOCKER_IMAGE_TAG)}`,
    `--set planqstats.trusted_addresses='${String(generateAuthorizedAddresses()).replace(
      /,/g,
      '\\,'
    )}'`,
    `--set planqstats.banned_addresses='${String(
      fetchEnv(envVar.PLQSTATS_BANNED_ADDRESSES)
    ).replace(/,/g, '\\,')}'`,
    `--set planqstats.reserved_addresses='${String(
      fetchEnv(envVar.PLQSTATS_RESERVED_ADDRESSES)
    ).replace(/,/g, '\\,')}'`,
    `--set planqstats.network_name='Planq ${planqEnv}'`,
    `--set planqstats.blockscout_url='${getBlockscoutUrl(planqEnv)}'`,
    `--set planqstats.jsonrpc='${getFornoUrl(planqEnv)}'`,
  ]
}

function releaseName(planqEnv: string) {
  return `${planqEnv}-planqstats`
}

function generateAuthorizedAddresses() {
  // TODO: Add the Proxy eth addresses when available
  const mnemonic = fetchEnv(envVar.MNEMONIC)
  const publicKeys = []
  const txNodes = parseInt(fetchEnv(envVar.TX_NODES), 0)
  const validatorNodes = parseInt(fetchEnv(envVar.VALIDATORS), 0)
  publicKeys.push(getAddressesFor(AccountType.TX_NODE, mnemonic, txNodes))
  publicKeys.push(getAddressesFor(AccountType.VALIDATOR, mnemonic, validatorNodes))

  publicKeys.push(fetchEnvOrFallback(envVar.PLQSTATS_TRUSTED_ADDRESSES, '').split(','))
  return publicKeys.reduce((accumulator, value) => accumulator.concat(value), []).filter((_) => !!_)
}
