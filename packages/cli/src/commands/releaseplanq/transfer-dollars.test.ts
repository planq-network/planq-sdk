import { ContractKit, newKitFromWeb3 } from '@planq-network/contractkit'
import { getContractFromEvent, testWithGanache } from '@planq-network/dev-utils/lib/ganache-test'
import Web3 from 'web3'
import { testLocally } from '../../test-utils/cliUtils'
import Register from '../account/register'
import TransferDollars from '../transfer/dollars'
import CreateAccount from './create-account'
import RGTransferDollars from './transfer-dollars'

process.env.NO_SYNCCHECK = 'true'

// Lots of commands, sometimes times out
jest.setTimeout(15000)

testWithGanache('releaseplanq:transfer-dollars cmd', (web3: Web3) => {
  let accounts: string[] = []
  let contractAddress: any
  let kit: ContractKit

  beforeEach(async () => {
    contractAddress = await getContractFromEvent(
      'ReleasePlanqInstanceCreated(address,address)',
      web3,
      { index: 1 } // canValidate = false
    )
    kit = newKitFromWeb3(web3)
    accounts = await web3.eth.getAccounts()
    await testLocally(Register, ['--from', accounts[0]])
    await testLocally(CreateAccount, ['--contract', contractAddress])
  })

  test('can transfer dollars out of the ReleasePlanq contract', async () => {
    const balanceBefore = await kit.getTotalBalance(accounts[0])
    const pUSDToTransfer = '500000000000000000000'
    // Send pUSD to RG contract
    await testLocally(TransferDollars, [
      '--from',
      accounts[0],
      '--to',
      contractAddress,
      '--value',
      pUSDToTransfer,
    ])
    // RG pUSD balance should match the amount sent
    const contractBalance = await kit.getTotalBalance(contractAddress)
    expect(contractBalance.pUSD!.toFixed()).toEqual(pUSDToTransfer)
    // Attempt to send pUSD back
    await testLocally(RGTransferDollars, [
      '--contract',
      contractAddress,
      '--to',
      accounts[0],
      '--value',
      pUSDToTransfer,
    ])
    const balanceAfter = await kit.getTotalBalance(accounts[0])
    expect(balanceBefore.pUSD).toEqual(balanceAfter.pUSD)
  })

  test('should fail if contract has no planq dollars', async () => {
    await expect(
      testLocally(RGTransferDollars, [
        '--contract',
        contractAddress,
        '--to',
        accounts[0],
        '--value',
        '1',
      ])
    ).rejects.toThrow()
  })
})
