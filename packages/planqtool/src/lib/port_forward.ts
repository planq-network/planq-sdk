/* tslint:disable: no-console */
import { ChildProcess, spawnSync } from 'child_process'
import { execBackgroundCmd, execCmd } from './cmd-utils'

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const defaultPortsString = '8545:8545 8546:8546 9200:9200'

const PORT_CONTROL_CMD = 'nc -z 127.0.0.1 8545'
const DEFAULT_COMPONENT = 'validators'

async function getPortForwardCmd(planqEnv: string, component?: string, ports = defaultPortsString) {
  return getKubernetesPortForwardCmd(planqEnv, component, ports)
}

async function getKubernetesPortForwardCmd(
  planqEnv: string,
  component?: string,
  ports = defaultPortsString
) {
  if (!component) {
    component = DEFAULT_COMPONENT
  }
  console.log(`Port-forwarding to ${planqEnv} ${component} ${ports}`)
  const portForwardArgs = await getPortForwardArgs(planqEnv, component, ports)
  return `kubectl ${portForwardArgs.join(' ')}`
}

async function getPortForwardArgs(planqEnv: string, component?: string, ports = defaultPortsString) {
  if (!component) {
    component = DEFAULT_COMPONENT
  }
  console.log(`Port-forwarding to ${planqEnv} ${component} ${ports}`)
  // The testnet helm chart used to have the label app=ethereum, but this was changed
  // to app=testnet. To preserve backward compatibility, we search for both labels.
  // It's not expected to ever have a situation where a namespace has pods with
  // both labels.
  const podName = await execCmd(
    `kubectl get pods --namespace ${planqEnv} -l "app in (ethereum,testnet), component=${component}, release=${planqEnv}" --field-selector=status.phase=Running -o jsonpath="{.items[0].metadata.name}"`
  )
  return ['port-forward', `--namespace=${planqEnv}`, podName[0], ...ports.split(' ')]
}

export async function portForward(planqEnv: string, component?: string, ports?: string) {
  try {
    const portForwardCmd = await getPortForwardCmd(planqEnv, component, ports)
    const splitCmd = portForwardCmd.split(' ')
    console.log(`Port-forwarding to planqEnv ${planqEnv} ports ${ports}`)
    console.log(`\t$ ${portForwardCmd}`)
    await spawnSync(splitCmd[0], splitCmd.slice(1), {
      stdio: 'inherit',
    })
  } catch (error) {
    console.error(`Unable to port-forward to ${planqEnv}`)
    console.error(error)
    process.exit(1)
  }
}

export async function portForwardAnd(
  planqEnv: string,
  cb: () => void,
  component?: string,
  ports?: string
) {
  let childProcess: ChildProcess

  try {
    childProcess = execBackgroundCmd(await getPortForwardCmd(planqEnv, component, ports))
  } catch (error) {
    console.error(error)
    process.exit(1)
    throw new Error() // unreachable, but to fix typescript
  }

  try {
    let isConnected = false
    while (!isConnected) {
      if (process.env.PLQTOOL_VERBOSE === 'true') {
        console.debug('Port Forward not ready yet...')
      }
      isConnected = await execCmd(PORT_CONTROL_CMD)
        .then(() => true)
        .catch(() => false)
      await sleep(2000)
    }
    await cb()
    childProcess.kill('SIGINT')
  } catch (error) {
    childProcess.kill('SIGINT')

    console.error(error)
    process.exit(1)
  }
}
