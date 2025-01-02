import { execCmd } from 'src/lib/cmd-utils'
import { exitIfPlanqtoolHelmDryRun } from 'src/lib/helm_deploy'
import { InitialArgv } from '../../deploy/initial'

export const command = 'notification-service'
export const describe = 'command for deploying notification-service'

export const handler = async (argv: InitialArgv) => {
  exitIfPlanqtoolHelmDryRun()
  console.info(`deploying notification-service for env ${argv.planqEnv}`)
  await execCmd(`yarn --cwd ../notification-service run deploy -n ${argv.planqEnv}`)
  console.info(`notification-service deploy complete`)
}
