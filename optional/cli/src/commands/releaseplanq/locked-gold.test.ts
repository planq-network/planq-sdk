import { newKitFromWeb3 } from '@planq-network/contractkit'
import { getContractFromEvent, testWithGanache } from '@planq-network/dev-utils/lib/ganache-test'
import Web3 from 'web3'
import { testLocally } from '../../test-utils/cliUtils'
import CreateAccount from './create-account'
import LockedPlanq from './locked-planq'

process.env.NO_SYNCCHECK = 'true'

testWithGanache('releaseplanq:locked-planq cmd', (web3: Web3) => {
  let contractAddress: string
  let kit: any

  beforeEach(async () => {
    contractAddress = await getContractFromEvent(
      'ReleasePlanqInstanceCreated(address,address)',
      web3
    )
    kit = newKitFromWeb3(web3)
    await testLocally(CreateAccount, ['--contract', contractAddress])
  })

  test('can lock planq with pending withdrawals', async () => {
    const lockedPlanq = await kit.contracts.getLockedPlanq()
    await testLocally(LockedPlanq, [
      '--contract',
      contractAddress,
      '--action',
      'lock',
      '--value',
      '100',
    ])
    await testLocally(LockedPlanq, [
      '--contract',
      contractAddress,
      '--action',
      'unlock',
      '--value',
      '50',
    ])
    await testLocally(LockedPlanq, [
      '--contract',
      contractAddress,
      '--action',
      'lock',
      '--value',
      '75',
    ])
    await testLocally(LockedPlanq, [
      '--contract',
      contractAddress,
      '--action',
      'unlock',
      '--value',
      '50',
    ])
    const pendingWithdrawalsTotalValue = await lockedPlanq.getPendingWithdrawalsTotalValue(
      contractAddress
    )
    await expect(pendingWithdrawalsTotalValue.toFixed()).toBe('50')
  })
})
