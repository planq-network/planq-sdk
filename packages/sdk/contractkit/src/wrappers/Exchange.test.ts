import { testWithGanache } from '@planq-network/dev-utils/lib/ganache-test'
import { StableToken } from '../planq-tokens'
import { ContractKit, newKitFromWeb3 } from '../kit'
import { ExchangeWrapper } from './Exchange'
import { StableTokenWrapper } from './StableTokenWrapper'

/*
TEST NOTES:
- In migrations: The only account that has a stable balance is accounts[0]
*/

testWithGanache('Exchange Wrapper', (web3) => {
  const kit = newKitFromWeb3(web3)
  for (const stableToken of Object.values(StableToken)) {
    describe(`${stableToken}`, () => {
      testExchange(kit, stableToken)
    })
  }
})

export function testExchange(kit: ContractKit, stableTokenName: StableToken) {
  const web3 = kit.web3
  const ONE = web3.utils.toWei('1', 'ether')

  const LARGE_BUY_AMOUNT = web3.utils.toWei('1000', 'ether')

  let accounts: string[] = []
  let exchange: ExchangeWrapper
  let stableToken: StableTokenWrapper

  beforeAll(async () => {
    accounts = await web3.eth.getAccounts()
    kit.defaultAccount = accounts[0]
    exchange = await kit.contracts.getExchange(stableTokenName)
    stableToken = await kit.contracts.getStableToken(stableTokenName)
  })

  test('SBAT check buckets', async () => {
    const [buyBucket, sellBucket] = await exchange.getBuyAndSellBuckets(true)
    expect(buyBucket).toBeBigNumber()
    expect(sellBucket).toBeBigNumber()
    expect(buyBucket.toNumber()).toBeGreaterThan(0)
    expect(sellBucket.toNumber()).toBeGreaterThan(0)
  })

  describe('#exchange', () => {
    test('executes successfully', async () => {
      const minBuyAmount = '100'
      await stableToken.approve(exchange.address, ONE).sendAndWaitForReceipt({ from: accounts[0] })
      const result = await exchange
        .exchange(ONE, minBuyAmount, false)
        .sendAndWaitForReceipt({ from: accounts[0] })
      expect(result.events?.Exchanged).toBeDefined()
      expect(result.events?.Exchanged.returnValues.sellAmount).toBe(ONE)
    })
  })

  describe('#sell', () => {
    test('executes successfully', async () => {
      const minBuyAmount = '100'
      await stableToken.approve(exchange.address, ONE).sendAndWaitForReceipt({ from: accounts[0] })
      const result = await exchange
        .sell(ONE, minBuyAmount, false)
        .sendAndWaitForReceipt({ from: accounts[0] })
      expect(result.events?.Exchanged).toBeDefined()
      expect(result.events?.Exchanged.returnValues.sellAmount).toBe(ONE)
    })
  })

  describe('#buy', () => {
    test('executes successfully', async () => {
      const stableAmount = (await exchange.quotePlanqBuy(ONE)).toString()
      await stableToken
        .approve(exchange.address, stableAmount)
        .sendAndWaitForReceipt({ from: accounts[0] })
      const result = await exchange
        .buy(ONE, stableAmount, true)
        .sendAndWaitForReceipt({ from: accounts[0] })
      expect(result.events?.Exchanged).toBeDefined()
      expect(result.events?.Exchanged.returnValues.buyAmount).toBe(ONE)
      expect(result.events?.Exchanged.returnValues.soldPlanq).toBe(false)
    })
  })

  test('SBAT quoteStableSell', () => expect(exchange.quoteStableSell(ONE)).resolves.toBeBigNumber())
  test('SBAT quotePlanqSell', () => expect(exchange.quotePlanqSell(ONE)).resolves.toBeBigNumber())
  test('SBAT quoteStableBuy', () => expect(exchange.quoteStableBuy(ONE)).resolves.toBeBigNumber())
  test('SBAT quotePlanqBuy', () => expect(exchange.quotePlanqBuy(ONE)).resolves.toBeBigNumber())

  test('SBAT sellStable', async () => {
    const planqAmount = await exchange.quoteStableSell(ONE)
    const approveTx = await stableToken.approve(exchange.address, ONE).send()
    await approveTx.waitReceipt()
    const sellTx = await exchange.sellStable(ONE, planqAmount).send()
    const result = await sellTx.waitReceipt()
    expect(result.events?.Exchanged).toBeDefined()
    expect(result.events?.Exchanged.returnValues.sellAmount).toBe(ONE)
    expect(result.events?.Exchanged.returnValues.soldPlanq).toBe(false)
  })

  test('SBAT sellPlanq', async () => {
    const stableAmount = await exchange.quotePlanqSell(ONE)
    const planqToken = await kit.contracts.getPlanqToken()
    const approveTx = await planqToken.approve(exchange.address, ONE).send()
    await approveTx.waitReceipt()
    const sellTx = await exchange.sellPlanq(ONE, stableAmount).send()
    const result = await sellTx.waitReceipt()
    expect(result.events?.Exchanged).toBeDefined()
    expect(result.events?.Exchanged.returnValues.sellAmount).toBe(ONE)
    expect(result.events?.Exchanged.returnValues.soldPlanq).toBe(true)
  })

  test('SBAT buyStable', async () => {
    const planqAmount = await exchange.quoteStableBuy(ONE)
    const planqToken = await kit.contracts.getPlanqToken()
    const approveTx = await planqToken.approve(exchange.address, planqAmount.toString()).send()
    await approveTx.waitReceipt()
    const buyTx = await exchange.buyStable(ONE, planqAmount).send()
    const result = await buyTx.waitReceipt()
    expect(result.events?.Exchanged).toBeDefined()
    expect(result.events?.Exchanged.returnValues.buyAmount).toBe(ONE)
    expect(result.events?.Exchanged.returnValues.soldPlanq).toBe(true)
  })

  test('SBAT buyPlanq', async () => {
    const stableAmount = await exchange.quotePlanqBuy(ONE)
    const approveTx = await stableToken.approve(exchange.address, stableAmount.toString()).send()
    await approveTx.waitReceipt()
    const buyTx = await exchange.buyPlanq(ONE, stableAmount).send()
    const result = await buyTx.waitReceipt()
    expect(result.events?.Exchanged).toBeDefined()
    expect(result.events?.Exchanged.returnValues.buyAmount).toBe(ONE)
    expect(result.events?.Exchanged.returnValues.soldPlanq).toBe(false)
  })

  test('SBAT getExchangeRate for selling planq', async () => {
    const sellPlanqRate = await exchange.getExchangeRate(LARGE_BUY_AMOUNT, true)
    expect(sellPlanqRate.toNumber()).toBeGreaterThan(0)
  })

  test('SBAT getExchangeRate for selling stables', async () => {
    const sellPlanqRate = await exchange.getStableExchangeRate(LARGE_BUY_AMOUNT)
    expect(sellPlanqRate.toNumber()).toBeGreaterThan(0)
  })

  /** Deprecated USD-specific functions kept as aliases for backward compatibility */

  test('SBAT use quoteUsdSell as an alias for quoteStableSell', () =>
    expect(exchange.quoteUsdSell(ONE)).resolves.toBeBigNumber())

  test('SBAT use quoteUsdBuy as an alias for quoteStableBuy', () =>
    expect(exchange.quoteUsdBuy(ONE)).resolves.toBeBigNumber())

  test('SBAT use sellDollar as an alias for sellStable', async () => {
    const planqAmount = await exchange.quoteUsdSell(ONE)
    const approveTx = await stableToken.approve(exchange.address, ONE).send()
    await approveTx.waitReceipt()
    const sellTx = await exchange.sellDollar(ONE, planqAmount).send()
    const result = await sellTx.waitReceipt()
    expect(result.events?.Exchanged).toBeDefined()
    expect(result.events?.Exchanged.returnValues.sellAmount).toBe(ONE)
    expect(result.events?.Exchanged.returnValues.soldPlanq).toBe(false)
  })

  test('SBAT use buyDollar as an alias for buyStable', async () => {
    const planqAmount = await exchange.quoteStableBuy(ONE)
    const planqToken = await kit.contracts.getPlanqToken()
    const approveTx = await planqToken.approve(exchange.address, planqAmount.toString()).send()
    await approveTx.waitReceipt()
    const buyTx = await exchange.buyDollar(ONE, planqAmount).send()
    const result = await buyTx.waitReceipt()
    expect(result.events?.Exchanged).toBeDefined()
    expect(result.events?.Exchanged.returnValues.buyAmount).toBe(ONE)
    expect(result.events?.Exchanged.returnValues.soldPlanq).toBe(true)
  })

  test('SBAT use getUsdExchangeRate as an alias for getStableExchangeRate', async () => {
    const sellPlanqRate = await exchange.getUsdExchangeRate(LARGE_BUY_AMOUNT)
    expect(sellPlanqRate.toNumber()).toBeGreaterThan(0)
  })
}
