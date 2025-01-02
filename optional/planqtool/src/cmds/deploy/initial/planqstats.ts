import { installHelmChart } from 'src/lib/planqstats'
import { switchToClusterFromEnv } from 'src/lib/cluster'
import { InitialArgv } from '../initial'

export const command = 'planqstats'

export const describe = 'deploy the planqstats package'

export const handler = async (argv: InitialArgv) => {
  await switchToClusterFromEnv(argv.planqEnv)
  await installHelmChart(argv.planqEnv)
}
