import * as fs from 'fs'
import { CONTRACTS_TO_COPY, downloadArtifacts, getContractAddresses } from 'src/lib/artifacts'
import { addPlanqEnvMiddleware, PlanqEnvArgv } from 'src/lib/env-utils'
import yargs from 'yargs'

export const command = 'contract-addresses'

export const describe = 'command for obtaining the contract addesses map'

interface CopyContractArtifactsArgs extends PlanqEnvArgv {
  contracts: string
  outputPath: string
}

export const builder = (argv: yargs.Argv) => {
  return addPlanqEnvMiddleware(argv)
    .option('contracts', {
      default: CONTRACTS_TO_COPY.join(','),
      type: 'string',
      description: 'the names of the contracts separated by commas',
    })
    .option('output-path', {
      alias: 'o',
      type: 'string',
      description: 'the absolute output folder path',
    })
}

export const handler = async (argv: CopyContractArtifactsArgs) => {
  await downloadArtifacts(argv.planqEnv)

  const contractList = argv.contracts.split(',')

  const addressMap = await getContractAddresses(argv.planqEnv, contractList)

  if (argv.outputPath) {
    fs.writeFileSync(argv.outputPath, JSON.stringify(addressMap, null, 2))
  } else {
    // tslint:disable-next-line: no-console
    console.log(addressMap)
  }
}
