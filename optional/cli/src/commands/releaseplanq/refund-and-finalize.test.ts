import { ContractKit, newKitFromWeb3 } from '@planq-network/contractkit'
import { newReleasePlanq } from '@planq-network/contractkit/lib/generated/ReleasePlanq'
import { ReleasePlanqWrapper } from '@planq-network/contractkit/lib/wrappers/ReleasePlanq'
import { getContractFromEvent, testWithGanache } from '@planq-network/dev-utils/lib/ganache-test'
import Web3 from 'web3'
import { testLocally } from '../../test-utils/cliUtils'
import RefundAndFinalize from './refund-and-finalize'
import Revoke from './revoke'
import Show from './show'

process.env.NO_SYNCCHECK = 'true'

testWithGanache('releaseplanq:refund-and-finalize cmd', (web3: Web3) => {
  let contractAddress: any
  let kit: ContractKit

  beforeEach(async () => {
    contractAddress = await getContractFromEvent(
      'ReleasePlanqInstanceCreated(address,address)',
      web3,
      { index: 1 } // revocable = true
    )
    kit = newKitFromWeb3(web3)
  })

  test('can refund planq', async () => {
    await testLocally(Revoke, ['--contract', contractAddress, '--yesreally'])
    const releasePlanqWrapper = new ReleasePlanqWrapper(
      kit.connection,
      newReleasePlanq(web3, contractAddress),
      kit.contracts
    )
    const refundAddress = await releasePlanqWrapper.getRefundAddress()
    const balanceBefore = await kit.getTotalBalance(refundAddress)
    await testLocally(RefundAndFinalize, ['--contract', contractAddress])
    const balanceAfter = await kit.getTotalBalance(refundAddress)
    expect(balanceBefore.PLQ!.toNumber()).toBeLessThan(balanceAfter.PLQ!.toNumber())
  })

  test('can finalize the contract', async () => {
    await testLocally(Revoke, ['--contract', contractAddress, '--yesreally'])
    await testLocally(RefundAndFinalize, ['--contract', contractAddress])
    await expect(testLocally(Show, ['--contract', contractAddress])).rejects.toThrow()
  })
})
