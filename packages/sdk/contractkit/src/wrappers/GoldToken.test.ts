import { testWithGanache } from '@planq-network/dev-utils/lib/ganache-test'
import { newKitFromWeb3 } from '../kit'
import { PlanqTokenWrapper } from './PlanqTokenWrapper'

testWithGanache('PlanqToken Wrapper', (web3) => {
  const ONE_PLANQ = web3.utils.toWei('1', 'ether')

  const kit = newKitFromWeb3(web3)
  let accounts: string[] = []
  let planqToken: PlanqTokenWrapper

  beforeAll(async () => {
    accounts = await web3.eth.getAccounts()
    kit.defaultAccount = accounts[0]
    planqToken = await kit.contracts.getPlanqToken()
  })

  test('SBAT check balance', () =>
    expect(planqToken.balanceOf(accounts[0])).resolves.toBeBigNumber())
  test('SBAT check decimals', () => expect(planqToken.decimals()).resolves.toBe(18))
  test('SBAT check name', () => expect(planqToken.name()).resolves.toBe('Planq native asset'))
  test('SBAT check symbol', () => expect(planqToken.symbol()).resolves.toBe('PLQ'))
  test('SBAT check totalSupply', () => expect(planqToken.totalSupply()).resolves.toBeBigNumber())

  test('SBAT transfer', async () => {
    const before = await planqToken.balanceOf(accounts[1])
    const tx = await planqToken.transfer(accounts[1], ONE_PLANQ).send()
    await tx.waitReceipt()

    const after = await planqToken.balanceOf(accounts[1])
    expect(after.minus(before)).toEqBigNumber(ONE_PLANQ)
  })

  test('SBAT approve spender', async () => {
    const before = await planqToken.allowance(accounts[0], accounts[1])
    expect(before).toEqBigNumber(0)

    await planqToken.approve(accounts[1], ONE_PLANQ).sendAndWaitForReceipt()
    const after = await planqToken.allowance(accounts[0], accounts[1])
    expect(after).toEqBigNumber(ONE_PLANQ)
  })

  test('SBAT tranfer from', async () => {
    const before = await planqToken.balanceOf(accounts[3])
    // account1 approves account0
    await planqToken.approve(accounts[0], ONE_PLANQ).sendAndWaitForReceipt({ from: accounts[1] })
    const tx = await planqToken.transferFrom(accounts[1], accounts[3], ONE_PLANQ).send()
    await tx.waitReceipt()
    const after = await planqToken.balanceOf(accounts[3])
    expect(after.minus(before)).toEqBigNumber(ONE_PLANQ)
  })
})
