import { switchToClusterFromEnv } from 'src/lib/cluster'
import { addPlanqEnvMiddleware, PlanqEnvArgv } from 'src/lib/env-utils'
import { getEnodesWithExternalIPAddresses, writeStaticNodes } from 'src/lib/geth'
import yargs from 'yargs'

export const command = 'static-nodes'

export const describe =
  'command for creating static-nodes.json file containing nodes of transaction nodes in an environment'

interface StaticNodesArgv extends PlanqEnvArgv {
  outputDir: string
  outputFileName: string | null
}

export const builder = (argv: yargs.Argv) => {
  return addPlanqEnvMiddleware(argv)
    .option('output-dir', {
      type: 'string',
      description: 'path to directory where file with enodes addresses will be stored',
      demand: 'Please specify the directory where to save the generated file',
    })
    .option('output-file-name', {
      type: 'string',
      default: null,
      alias: 'o',
      description:
        'output file name | if not specified then {ENV_NAME}_static-nodes.json will be used',
    })
}

export const handler = async (argv: StaticNodesArgv) => {
  await switchToClusterFromEnv(argv.planqEnv, false)

  const namespace = argv.planqEnv
  const outputDirPath = argv.outputDir
  const outputFileName = argv.outputFileName

  await getEnodesWithExternalIPAddresses(namespace).then((enodes) => {
    writeStaticNodes(
      enodes,
      outputDirPath,
      outputFileName ? outputFileName : `${namespace}_static-nodes.json`
    )
  })
}
