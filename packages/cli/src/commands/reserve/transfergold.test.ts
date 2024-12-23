import { Address } from '@planq-network/connect'
import { newKitFromWeb3 } from '@planq-network/contractkit'
import { PlanqTokenWrapper } from '@planq-network/contractkit/lib/wrappers/PlanqTokenWrapper'
import { testWithGanache } from '@planq-network/dev-utils/lib/ganache-test'
import BigNumber from 'bignumber.js'
import Web3 from 'web3'
import { testLocally } from '../../test-utils/cliUtils'
import TransferPlanq from './transferplanq'

process.env.NO_SYNCCHECK = 'true'

testWithGanache('reserve:transferplanq cmd', (web3: Web3) => {
  const transferAmt = new BigNumber(100000)
  const kit = newKitFromWeb3(web3)

  let accounts: Address[] = []
  let planqToken: PlanqTokenWrapper

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts()
    planqToken = await kit.contracts.getPlanqToken()
  })
  test('transferPlanq fails if spender not passed in', async () => {
    await expect(
      testLocally(TransferPlanq, [
        '--from',
        accounts[0],
        '--value',
        transferAmt.toString(10),
        '--to',
        accounts[9],
      ])
    ).rejects.toThrow("Some checks didn't pass!")
  })
  test('can transferPlanq with multisig option', async () => {
    const initialBalance = await planqToken.balanceOf(accounts[9])
    await testLocally(TransferPlanq, [
      '--from',
      accounts[0],
      '--value',
      transferAmt.toString(10),
      '--to',
      accounts[9],
      '--useMultiSig',
    ])
    await testLocally(TransferPlanq, [
      '--from',
      accounts[7],
      '--value',
      transferAmt.toString(10),
      '--to',
      accounts[9],
      '--useMultiSig',
    ])
    expect(await planqToken.balanceOf(accounts[9])).toEqual(initialBalance.plus(transferAmt))
  })
})
