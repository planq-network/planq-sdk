import { switchToClusterFromEnv } from 'src/lib/cluster'
import { installGenericHelmChart } from 'src/lib/helm_deploy'
import { helmChartDir, helmParameters, helmReleaseName } from 'src/lib/pumba'
import { InitialArgv } from '../../deploy/initial'

export const command = 'pumba'

export const describe = 'deploy the pumba package'

export const builder = {}

export const handler = async (argv: InitialArgv) => {
  await switchToClusterFromEnv(argv.planqEnv)
  await installGenericHelmChart({
    namespace: argv.planqEnv,
    releaseName: helmReleaseName(argv.planqEnv),
    chartDir: helmChartDir,
    parameters: helmParameters(),
  })
}
