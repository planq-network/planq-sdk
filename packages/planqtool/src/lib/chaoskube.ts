import { makeHelmParameters } from 'src/lib/helm_deploy'
import { envVar, fetchEnv } from './env-utils'

export function helmReleaseName(planqEnv: string) {
  return planqEnv + '-chaoskube'
}

export const helmChartDir = 'stable/chaoskube'

export function helmParameters(planqEnv: string) {
  return makeHelmParameters({
    interval: fetchEnv(envVar.CHAOS_TEST_KILL_INTERVAL),
    labels: 'component=validators',
    namespaces: planqEnv,
    dryRun: 'false',
    'rbac.create': 'true',
    'rbac.serviceAccountName': `${planqEnv}-chaoskube`,
  })
}
