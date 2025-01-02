import { switchToClusterFromEnv } from 'src/lib/cluster'
import { upgradeGenericHelmChart } from 'src/lib/helm_deploy'
import { helmChartDir, helmParameters, helmReleaseName } from 'src/lib/pumba'
import { InitialArgv } from '../../deploy/initial'

export const command = 'pumba'

export const describe = 'deploy the pumba package'

export const builder = {}

export const handler = async (argv: InitialArgv) => {
  await switchToClusterFromEnv(argv.planqEnv)
  await upgradeGenericHelmChart({
    namespace: argv.planqEnv,
    releaseName: helmReleaseName(argv.planqEnv),
    chartDir: helmChartDir,
    parameters: helmParameters(),
  })
}
