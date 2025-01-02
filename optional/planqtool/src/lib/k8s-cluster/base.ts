import { createNamespaceIfNotExists } from '../cluster'
import { execCmd, execCmdWithExitOnFailure } from '../cmd-utils'
import {
  installAndEnableMetricsDeps,
  installCertManagerAndNginx,
  isPlanqtoolHelmDryRun,
} from '../helm_deploy'

export enum CloudProvider {
  AWS,
  AZURE,
  GCP,
}

export interface BaseClusterConfig {
  cloudProvider: CloudProvider
  clusterName: string
}

export abstract class BaseClusterManager {
  protected _clusterConfig: BaseClusterConfig
  private _planqEnv: string

  constructor(clusterConfig: BaseClusterConfig, planqEnv: string) {
    this._clusterConfig = clusterConfig
    this._planqEnv = planqEnv
  }

  async switchToClusterContext(skipSetup: boolean, context?: string) {
    const exists = await this.switchToClusterContextIfExists()
    if (!exists) {
      await this.getAndSwitchToClusterContext()
    }
    // Reset back to default namespace
    await execCmdWithExitOnFailure(`kubectl config set-context --current --namespace default`)
    if (!skipSetup) {
      if (!isPlanqtoolHelmDryRun()) {
        await this.setupCluster(context)
      } else {
        console.info(`Skipping cluster setup due to --helmdryrun`)
      }
    }
  }

  /**
   * This will set the current context to the listed cluster name.
   * If a context with the cluster name does not exist, return false.
   * @param clusterConfig
   */
  async switchToClusterContextIfExists() {
    await this.switchToSubscription()

    let currentContext = null
    try {
      ;[currentContext] = await execCmd('kubectl config current-context')
    } catch (error) {
      console.info('No context currently set')
    }

    // We expect the context to be the cluster name.
    if (currentContext === null || currentContext.trim() !== this.kubernetesContextName) {
      const [existingContextsStr] = await execCmdWithExitOnFailure(
        'kubectl config get-contexts -o name'
      )
      const existingContexts = existingContextsStr.trim().split('\n')
      if (existingContexts.includes(this.clusterConfig.clusterName)) {
        await execCmdWithExitOnFailure(
          `kubectl config use-context ${this.clusterConfig.clusterName}`
        )
      } else {
        // If we don't already have the context, context set up is not complete.
        // We would still need to retrieve credentials/contexts from the provider
        return false
      }
    }
    return true
  }

  async setupCluster(context?: string) {
    await createNamespaceIfNotExists(this.planqEnv)
    if (!isPlanqtoolHelmDryRun()) {
      console.info('Performing any cluster setup that needs to be done...')

      await installCertManagerAndNginx(this.planqEnv, this.clusterConfig)
      await installAndEnableMetricsDeps(true, context, this.clusterConfig)
    }
  }

  abstract switchToSubscription(): Promise<void>
  abstract getAndSwitchToClusterContext(): Promise<void>

  abstract get kubernetesContextName(): string
  abstract get cloudProvider(): CloudProvider

  get clusterConfig(): BaseClusterConfig {
    return this._clusterConfig
  }

  get planqEnv(): string {
    return this._planqEnv
  }
}
