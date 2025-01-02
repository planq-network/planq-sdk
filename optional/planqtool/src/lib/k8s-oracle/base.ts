import {
  getFornoUrl,
  getFornoWebSocketUrl,
  getFullNodeHttpRpcInternalUrl,
  getFullNodeWebSocketRpcInternalUrl,
} from 'src/lib/endpoints'
import { envVar, fetchEnv, fetchEnvOrFallback } from 'src/lib/env-utils'
import {
  installGenericHelmChart,
  removeGenericHelmChart,
  upgradeGenericHelmChart,
} from 'src/lib/helm_deploy'

const helmChartPath = '../helm-charts/oracle'

export type CurrencyPair = 'PLQUSD' | 'PLQEUR' | 'PLQBTC'

/**
 * Represents the identity of a single oracle
 */
export interface OracleIdentity {
  address: string
  currencyPair: CurrencyPair
}

export interface BaseOracleDeploymentConfig {
  context: string
  currencyPair: CurrencyPair
  identities: OracleIdentity[]
  useForno: boolean
}

export abstract class BaseOracleDeployer {
  protected _deploymentConfig: BaseOracleDeploymentConfig
  private _planqEnv: string

  constructor(deploymentConfig: BaseOracleDeploymentConfig, planqEnv: string) {
    this._deploymentConfig = deploymentConfig
    this._planqEnv = planqEnv
  }

  async installChart() {
    return installGenericHelmChart({
      namespace: this.planqEnv,
      releaseName: this.releaseName,
      chartDir: helmChartPath,
      parameters: await this.helmParameters(),
      buildDependencies: true,
      valuesOverrideFile: `${this.currencyPair}.yaml`,
    })
  }

  async upgradeChart() {
    return upgradeGenericHelmChart({
      namespace: this.planqEnv,
      releaseName: this.releaseName,
      chartDir: helmChartPath,
      parameters: await this.helmParameters(),
      buildDependencies: true,
      valuesOverrideFile: `${this.currencyPair}.yaml`,
    })
  }

  async removeChart() {
    await removeGenericHelmChart(this.releaseName, this.planqEnv)
  }

  async helmParameters() {
    const httpRpcProviderUrl = this.deploymentConfig.useForno
      ? getFornoUrl(this.planqEnv)
      : getFullNodeHttpRpcInternalUrl(this.planqEnv)
    const wsRpcProviderUrl = this.deploymentConfig.useForno
      ? getFornoWebSocketUrl(this.planqEnv)
      : getFullNodeWebSocketRpcInternalUrl(this.planqEnv)
    return [
      `--set oracle.api_keys=${fetchEnv(envVar.ORACLE_FX_ADAPTERS_API_KEYS)}`,
      `--set environment.name=${this.planqEnv}`,
      `--set image.repository=${fetchEnv(envVar.ORACLE_DOCKER_IMAGE_REPOSITORY)}`,
      `--set image.tag=${fetchEnv(envVar.ORACLE_DOCKER_IMAGE_TAG)}`,
      `--set oracle.replicas=${this.replicas}`,
      `--set oracle.rpcProviderUrls.http=${httpRpcProviderUrl}`,
      `--set oracle.rpcProviderUrls.ws=${wsRpcProviderUrl}`,
      `--set-string oracle.unusedOracleAddresses='${fetchEnvOrFallback(
        envVar.ORACLE_UNUSED_ORACLE_ADDRESSES,
        ''
      )
        .split(',')
        .join('\\,')}'`,
    ].concat(await this.oracleIdentityHelmParameters())
  }

  /**
   * Returns an array of helm command line parameters for the oracle identities.
   */
  async oracleIdentityHelmParameters() {
    const params: string[] = []
    for (let i = 0; i < this.replicas; i++) {
      const oracleIdentity = this.deploymentConfig.identities[i]
      const prefix = `--set oracle.identities[${i}]`
      params.push(`${prefix}.address=${oracleIdentity.address}`)
    }
    return params
  }

  get deploymentConfig() {
    return this._deploymentConfig
  }

  get releaseName() {
    return `${this.planqEnv}-${this.currencyPair.toLocaleLowerCase()}-oracle`
  }

  get kubeNamespace() {
    return this.planqEnv
  }

  get planqEnv(): string {
    return this._planqEnv
  }

  get replicas(): number {
    return this.deploymentConfig.identities.length
  }

  get context(): string {
    return this.deploymentConfig.context
  }

  get currencyPair(): CurrencyPair {
    return this.deploymentConfig.currencyPair
  }
}
