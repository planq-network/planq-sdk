import { testWithGanache } from '@planq-network/dev-utils/lib/ganache-test'
import { newKitFromWeb3 } from '../kit'
import { AccountsWrapper } from './Accounts'
import { LockedPlanqWrapper } from './LockedPlanq'

testWithGanache('LockedPlanq Wrapper', (web3) => {
  const kit = newKitFromWeb3(web3)
  let accounts: AccountsWrapper
  let lockedPlanq: LockedPlanqWrapper

  // Arbitrary value.
  const value = 120938732980
  let account: string
  beforeAll(async () => {
    account = (await web3.eth.getAccounts())[0]
    kit.defaultAccount = account
    lockedPlanq = await kit.contracts.getLockedPlanq()
    accounts = await kit.contracts.getAccounts()
    if (!(await accounts.isAccount(account))) {
      await accounts.createAccount().sendAndWaitForReceipt({ from: account })
    }
  })

  test('SBAT lock planq', async () => {
    await lockedPlanq.lock().sendAndWaitForReceipt({ value })
  })

  test('SBAT unlock planq', async () => {
    await lockedPlanq.lock().sendAndWaitForReceipt({ value })
    await lockedPlanq.unlock(value).sendAndWaitForReceipt()
  })

  test('SBAT relock planq', async () => {
    // Make 5 pending withdrawals.
    await lockedPlanq.lock().sendAndWaitForReceipt({ value: value * 5 })
    await lockedPlanq.unlock(value).sendAndWaitForReceipt()
    await lockedPlanq.unlock(value).sendAndWaitForReceipt()
    await lockedPlanq.unlock(value).sendAndWaitForReceipt()
    await lockedPlanq.unlock(value).sendAndWaitForReceipt()
    await lockedPlanq.unlock(value).sendAndWaitForReceipt()
    // Re-lock 2.5 of them
    const txos = await lockedPlanq.relock(account, value * 2.5)
    await Promise.all(txos.map((txo) => txo.sendAndWaitForReceipt()))
    //
  })

  test('should return the count of pending withdrawals', async () => {
    await lockedPlanq.lock().sendAndWaitForReceipt({ value: value * 2 })
    await lockedPlanq.unlock(value).sendAndWaitForReceipt()
    await lockedPlanq.unlock(value).sendAndWaitForReceipt()

    const count = await lockedPlanq.getTotalPendingWithdrawalsCount(account)
    expect(count).toEqBigNumber(2)
  })

  test('should return zero when there are no pending withdrawals', async () => {
    const count = await lockedPlanq.getTotalPendingWithdrawalsCount(account)
    expect(count).toEqBigNumber(0)
  })

  test('should return the pending withdrawal at a given index', async () => {
    await lockedPlanq.lock().sendAndWaitForReceipt({ value: value * 2 })
    await lockedPlanq.unlock(value).sendAndWaitForReceipt()
    const pendingWithdrawal = await lockedPlanq.getPendingWithdrawal(account, 0)

    expect(pendingWithdrawal.value).toEqBigNumber(value)
  })

  test('should throw an error for an invalid index', async () => {
    await expect(lockedPlanq.getPendingWithdrawal(account, 999)).rejects.toThrow(
      'Bad pending withdrawal index'
    )
  })
})
