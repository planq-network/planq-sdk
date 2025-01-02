import { envVar, fetchEnv } from './env-utils'

export function getBlockscoutUrl(planqEnv: string) {
  return `https://${planqEnv}-blockscout.${fetchEnv(envVar.CLUSTER_DOMAIN_NAME)}.org`
}

export function getBlockscoutClusterInternalUrl(planqEnv: string) {
  return `${planqEnv}-blockscout-web`
}

export function getEthstatsUrl(planqEnv: string) {
  return `https://${planqEnv}-ethstats.${fetchEnv(envVar.CLUSTER_DOMAIN_NAME)}.org`
}

export function getBlockchainApiUrl(planqEnv: string) {
  return `https://${planqEnv}-dot-${fetchEnv(envVar.TESTNET_PROJECT_NAME)}.appspot.com`
}

export function getGenesisGoogleStorageUrl(planqEnv: string) {
  return `https://www.googleapis.com/storage/v1/b/genesis_blocks/o/${planqEnv}?alt=media`
}

export function getFornoUrl(planqEnv: string) {
  return planqEnv === 'rc1'
    ? `https://forno.celo.org`
    : `https://${planqEnv}-forno.${fetchEnv(envVar.CLUSTER_DOMAIN_NAME)}.org`
}

export function getFornoWebSocketUrl(planqEnv: string) {
  return planqEnv === 'rc1'
    ? `wss://forno.celo.org/ws`
    : `wss://${planqEnv}-forno.${fetchEnv(envVar.CLUSTER_DOMAIN_NAME)}.org/ws`
}

export function getFullNodeHttpRpcInternalUrl(planqEnv: string) {
  return `http://${planqEnv}-fullnodes-rpc.${planqEnv}.svc.cluster.local:8545`
}

export function getFullNodeWebSocketRpcInternalUrl(planqEnv: string) {
  return `ws://${planqEnv}-fullnodes-rpc.${planqEnv}.svc.cluster.local:8546`
}
