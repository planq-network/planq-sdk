import { AksClusterConfig, AksClusterManager } from './aks'
import { AwsClusterConfig, AwsClusterManager } from './aws'
import { BaseClusterConfig, BaseClusterManager, CloudProvider } from './base'
import { GCPClusterConfig, GCPClusterManager } from './gcp'

const clusterManagerByCloudProvider: {
  [key in CloudProvider]: (clusterConfig: BaseClusterConfig, planqEnv: string) => BaseClusterManager
} = {
  [CloudProvider.AWS]: (clusterConfig: BaseClusterConfig, planqEnv: string) =>
    new AwsClusterManager(clusterConfig as AwsClusterConfig, planqEnv),
  [CloudProvider.AZURE]: (clusterConfig: BaseClusterConfig, planqEnv: string) =>
    new AksClusterManager(clusterConfig as AksClusterConfig, planqEnv),
  [CloudProvider.GCP]: (clusterConfig: BaseClusterConfig, planqEnv: string) =>
    new GCPClusterManager(clusterConfig as GCPClusterConfig, planqEnv),
}

export function getClusterManager(
  cloudProvider: CloudProvider,
  planqEnv: string,
  clusterConfig: BaseClusterConfig
) {
  return clusterManagerByCloudProvider[cloudProvider](clusterConfig, planqEnv)
}
