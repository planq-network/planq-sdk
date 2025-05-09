import { GenesisConfig } from './genesis-config'
import { GethInstanceConfig } from './geth-instance-config'
import { GethRepository } from './geth-repository'

export interface GethRunConfig {
  // migration
  migrate?: boolean
  migrateTo?: number
  migrationOverrides?: any
  keepData?: boolean
  // Whether to use the myplanq tool to generate the genesis.json
  useMyplanq?: boolean
  // Skip compiling the smart contracts (e.g. during dev if they're already compiled and you want to save 10 seconds)
  myplanqSkipCompilingContracts?: boolean
  // genesis config
  genesisConfig?: GenesisConfig
  // network
  network: string
  networkId: number
  // where to run
  runPath: string
  verbosity?: number
  repository?: GethRepository
  // running instances
  instances: GethInstanceConfig[]
}
