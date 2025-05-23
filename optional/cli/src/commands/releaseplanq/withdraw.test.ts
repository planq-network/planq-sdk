import { ContractKit, newKitFromWeb3 } from '@planq-network/contractkit'
import { newReleasePlanq } from '@planq-network/contractkit/lib/generated/ReleasePlanq'
import { ReleasePlanqWrapper } from '@planq-network/contractkit/lib/wrappers/ReleasePlanq'
import { getContractFromEvent, testWithGanache, timeTravel } from '@planq-network/dev-utils/lib/ganache-test'
import { BigNumber } from 'bignumber.js'
import Web3 from 'web3'
import { testLocally } from '../../test-utils/cliUtils'
import CreateAccount from './create-account'
import SetLiquidityProvision from './set-liquidity-provision'
import RGTransferDollars from './transfer-dollars'
import Withdraw from './withdraw'

process.env.NO_SYNCCHECK = 'true'

testWithGanache('releaseplanq:withdraw cmd', (web3: Web3) => {
  let contractAddress: string
  let kit: ContractKit

  beforeEach(async () => {
    contractAddress = await getContractFromEvent(
      'ReleasePlanqInstanceCreated(address,address)',
      web3
    )
    kit = newKitFromWeb3(web3)
    await testLocally(CreateAccount, ['--contract', contractAddress])
  })

  test('can withdraw released planq to beneficiary', async () => {
    await testLocally(SetLiquidityProvision, ['--contract', contractAddress, '--yesreally'])
    // ReleasePeriod of default contract
    await timeTravel(300000000, web3)
    const releasePlanqWrapper = new ReleasePlanqWrapper(
      kit.connection,
      newReleasePlanq(web3, contractAddress),
      kit.contracts
    )
    const beneficiary = await releasePlanqWrapper.getBeneficiary()
    const balanceBefore = (await kit.getTotalBalance(beneficiary)).PLQ!
    // Use a value which would lose precision if converted to a normal javascript number
    const withdrawalAmount = '10000000000000000000005'
    await testLocally(Withdraw, ['--contract', contractAddress, '--value', withdrawalAmount])
    const balanceAfter = (await kit.getTotalBalance(beneficiary)).PLQ!
    const difference = balanceAfter.minus(balanceBefore)
    expect(difference).toEqBigNumber(new BigNumber(withdrawalAmount))
  })

  test("can't withdraw the whole balance if there is a pUSD balance", async () => {
    await testLocally(SetLiquidityProvision, ['--contract', contractAddress, '--yesreally'])
    // ReleasePeriod of default contract
    await timeTravel(300000000, web3)
    const releasePlanqWrapper = new ReleasePlanqWrapper(
      kit.connection,
      newReleasePlanq(web3, contractAddress),
      kit.contracts
    )
    const beneficiary = await releasePlanqWrapper.getBeneficiary()
    const balanceBefore = await kit.getTotalBalance(beneficiary)
    const remainingBalance = await releasePlanqWrapper.getRemainingUnlockedBalance()

    const stableToken = await kit.contracts.getStableToken()

    await stableToken.transfer(contractAddress, 100).sendAndWaitForReceipt({ from: beneficiary })

    // Can't withdraw since there is pUSD balance still
    await expect(
      testLocally(Withdraw, ['--contract', contractAddress, '--value', remainingBalance.toString()])
    ).rejects.toThrow()

    // Move out the pUSD balance
    await await testLocally(RGTransferDollars, [
      '--contract',
      contractAddress,
      '--to',
      beneficiary,
      '--value',
      '100',
    ])

    await testLocally(Withdraw, [
      '--contract',
      contractAddress,
      '--value',
      remainingBalance.toString(),
    ])
    const balanceAfter = await kit.getTotalBalance(beneficiary)
    expect(balanceBefore.PLQ!.toNumber()).toBeLessThan(balanceAfter.PLQ!.toNumber())

    // Contract should self-destruct now
    await expect(releasePlanqWrapper.getRemainingUnlockedBalance()).rejects.toThrow()
  })
})
