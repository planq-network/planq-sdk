import { PlanqTokenWrapper } from '@planq-network/contractkit/lib/wrappers/PlanqTokenWrapper'
import { StableTokenWrapper } from '@planq-network/contractkit/lib/wrappers/StableTokenWrapper'
import { BigNumber } from 'bignumber.js'

export async function convertToContractDecimals(
  value: number | BigNumber,
  contract: StableTokenWrapper | PlanqTokenWrapper<any>
) {
  const decimals = new BigNumber(await contract.decimals())
  const one = new BigNumber(10).pow(decimals.toNumber())
  return one.times(value)
}
