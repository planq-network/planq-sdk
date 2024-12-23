import { concurrentMap } from '@planq-network/base/lib/async'
import { ABIDefinition, AbiItem, Address } from '@planq-network/connect'
import { PlanqContract, ContractKit } from '@planq-network/contractkit'

export interface ContractDetails {
  name: string
  address: Address
  jsonInterface: AbiItem[]
  isCore: boolean
}

export interface ContractMapping {
  details: ContractDetails
  fnMapping: Map<string, ABIDefinition>
}

export const getContractDetailsFromContract: any = async (
  kit: ContractKit,
  planqContract: PlanqContract,
  address?: string
) => {
  const contract = await kit._web3Contracts.getContract(planqContract, address)
  return {
    name: planqContract,
    address: address ?? contract.options.address,
    jsonInterface: contract.options.jsonInterface,
    isCore: true,
  }
}

export async function obtainKitContractDetails(kit: ContractKit): Promise<ContractDetails[]> {
  const registry = await kit.registry.addressMapping()
  return concurrentMap(5, Array.from(registry.entries()), ([planqContract, address]) =>
    getContractDetailsFromContract(kit, planqContract, address)
  )
}

export function mapFromPairs<A, B>(pairs: Array<[A, B]>): Map<A, B> {
  const map = new Map<A, B>()
  pairs.forEach(([k, v]) => {
    map.set(k, v)
  })
  return map
}
