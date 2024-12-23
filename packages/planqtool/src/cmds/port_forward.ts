import { switchToClusterFromEnv } from 'src/lib/cluster'
import { addPlanqEnvMiddleware, PlanqEnvArgv } from 'src/lib/env-utils'
import { defaultPortsString, portForward } from 'src/lib/port_forward'
import yargs from 'yargs'
export const command = 'port-forward'

export const describe = 'command for port-forwarding to a specific network'

interface PortForwardArgv extends PlanqEnvArgv {
  component: string
  ports: string
}

export const builder = (argv: yargs.Argv) => {
  return addPlanqEnvMiddleware(argv)
    .option('component', {
      type: 'string',
      description: 'K8s component name to forward to',
    })
    .option('ports', {
      type: 'string',
      description: 'Ports to forward: space separated srcport:dstport string',
      default: defaultPortsString,
    })
}

export const handler = async (argv: PortForwardArgv) => {
  await switchToClusterFromEnv(argv.planqEnv, false, true)
  await portForward(argv.planqEnv, argv.component, argv.ports)
}
