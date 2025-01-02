import { CloudProvider } from '../k8s-cluster/base'
import { AksFullNodeDeployer, AksFullNodeDeploymentConfig } from './aks'
import { AwsFullNodeDeployer, AwsFullNodeDeploymentConfig } from './aws'
import { BaseFullNodeDeployer, BaseFullNodeDeploymentConfig } from './base'
import { GCPFullNodeDeployer, GCPFullNodeDeploymentConfig } from './gcp'

const fullNodeDeployerByCloudProvider: {
  [key in CloudProvider]: (
    deploymentConfig: BaseFullNodeDeploymentConfig,
    planqEnv: string
  ) => BaseFullNodeDeployer
} = {
  [CloudProvider.AWS]: (deploymentConfig: BaseFullNodeDeploymentConfig, planqEnv: string) =>
    new AwsFullNodeDeployer(deploymentConfig as AwsFullNodeDeploymentConfig, planqEnv),
  [CloudProvider.AZURE]: (deploymentConfig: BaseFullNodeDeploymentConfig, planqEnv: string) =>
    new AksFullNodeDeployer(deploymentConfig as AksFullNodeDeploymentConfig, planqEnv),
  [CloudProvider.GCP]: (deploymentConfig: BaseFullNodeDeploymentConfig, planqEnv: string) =>
    new GCPFullNodeDeployer(deploymentConfig as GCPFullNodeDeploymentConfig, planqEnv),
}

export function getFullNodeDeployer(
  cloudProvider: CloudProvider,
  planqEnv: string,
  deploymentConfig: BaseFullNodeDeploymentConfig
) {
  return fullNodeDeployerByCloudProvider[cloudProvider](deploymentConfig, planqEnv)
}
