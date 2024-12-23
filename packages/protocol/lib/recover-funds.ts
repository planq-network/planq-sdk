import { _setInitialProxyImplementation } from '@planq-network/protocol/lib/web3-utils'
import { Address } from '@planq-network/utils/lib/address'
import BigNumber from 'bignumber.js'
import { retryTx } from './web3-utils'

/**
 *
 *
 * @param proxyAddress the address of the proxy to recover funds from
 * @param from the address to recover funds to
 */
export async function recoverFunds(proxyAddress: Address, from: Address) {
  const ReleasePlanqMultiSig = artifacts.require('ReleasePlanqMultiSig')
  const ReleasePlanqProxy = artifacts.require('ReleasePlanqProxy')

  const releasePlanqProxy = await ReleasePlanqProxy.at(proxyAddress)
  const balance = await web3.eth.getBalance(releasePlanqProxy.address)
  const recoveredAmount = new BigNumber(balance).minus(new BigNumber(0.001)).dp(0)
  console.info('  Attempting to recover', recoveredAmount, 'PLQ')
  const recoveryMultiSig = await retryTx(ReleasePlanqMultiSig.new, [{ from }])
  console.info('  Assigning 1/1 multisig implementation to ReleasePlanq Proxy')
  await _setInitialProxyImplementation(
    web3,
    recoveryMultiSig,
    releasePlanqProxy,
    'ReleasePlanqMultiSig',
    {
      from,
      value: null,
    },
    [from],
    1,
    1
  )

  const proxiedMultisig = await ReleasePlanqMultiSig.at(proxyAddress)
  console.info('  Transferring funds to', from)
  await retryTx(proxiedMultisig.submitTransaction, [
    from,
    recoveredAmount,
    [],
    {
      from,
    },
  ])
}
