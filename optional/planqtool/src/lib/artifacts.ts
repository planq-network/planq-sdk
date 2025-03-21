/* tslint:disable: no-console */
import { existsSync, mkdirSync, readFileSync, writeFile } from 'fs'
import { promisify } from 'util'
import { execCmd } from './cmd-utils'
import { doCheckOrPromptIfStagingOrProduction, envVar, fetchEnv, isProduction } from './env-utils'

export const CONTRACTS_TO_COPY = [
  'Attestations',
  'Escrow',
  'Exchange',
  'PlanqToken',
  'Registry',
  'Reserve',
  'StableToken',
]

export async function downloadArtifacts(planqEnv: string) {
  let baseCmd = `yarn --cwd ../protocol run download-artifacts -n ${planqEnv}`
  console.log(`Downloading artifacts for ${planqEnv}`)
  if (isProduction()) {
    baseCmd += ` -b contract_artifacts_production`
  }
  try {
    await execCmd(baseCmd)
  } catch (error) {
    console.error(`Unable to download artifacts for ${planqEnv}`)
    console.error(error)
    process.exit(1)
  }
}

export async function uploadArtifacts(planqEnv: string, checkOrPromptIfStagingOrProduction = true) {
  if (checkOrPromptIfStagingOrProduction) {
    await doCheckOrPromptIfStagingOrProduction()
  }

  let baseCmd = `yarn --cwd ../protocol run upload-artifacts -n ${planqEnv}`
  if (isProduction()) {
    baseCmd += ` -b contract_artifacts_production`
  }
  console.log(`Uploading artifacts for ${planqEnv}`)
  try {
    await execCmd(baseCmd)
  } catch (error) {
    console.error(`Unable to upload artifacts for ${planqEnv}`)
    console.error(error)
    process.exit(1)
  }
}

function getContract(fileData: string) {
  const json = JSON.parse(fileData)
  return {
    abi: json.abi,
    contractName: json.contractName,
    schemaVersion: json.schemaVersion,
    updatedAt: json.updatedAt,
  }
}

const toFile = promisify(writeFile)

export async function copyContractArtifacts(
  planqEnv: string,
  outputPath: string,
  contractList: string[]
) {
  const baseContractPath = `../protocol/build/${planqEnv}/contracts`

  if (!existsSync(outputPath)) {
    mkdirSync(outputPath)
  }

  await Promise.all(
    contractList.map(async (contract) => {
      const json = getContract(readFileSync(`${baseContractPath}/${contract}.json`).toString())

      const proxyJson = JSON.parse(
        readFileSync(`${baseContractPath}/${contract}Proxy.json`).toString()
      )
      const address = proxyJson.networks[fetchEnv(envVar.NETWORK_ID)].address

      await toFile(
        `${outputPath}/${contract}.ts`,
        `import Web3 from 'web3'\n\n` +
          `export default async function getInstance(web3: Web3) {\n` +
          `  return new web3.eth.Contract(\n` +
          `    ${JSON.stringify(json.abi, null, 2)},\n` +
          `   "${address}"\n` +
          `  )\n` +
          `}`
      )
    })
  )
}

export async function getContractAddresses(planqEnv: string, contractList: string[]) {
  const baseContractPath = `../protocol/build/${planqEnv}/contracts`

  const contracts: Record<string, string> = {}

  for (const contract of contractList) {
    const proxyJson = JSON.parse(
      readFileSync(`${baseContractPath}/${contract}Proxy.json`).toString()
    )
    const address = proxyJson.networks[fetchEnv(envVar.NETWORK_ID)].address
    contracts[contract] = address
  }

  return contracts
}
