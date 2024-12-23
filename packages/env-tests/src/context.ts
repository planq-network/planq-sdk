import { Address, ContractKit } from '@planq-network/contractkit'
import Logger from 'bunyan'

export interface EnvTestContext {
  kit: ContractKit
  mnemonic: string
  reserveSpenderMultiSigAddress: Address | undefined
  logger: Logger
}
