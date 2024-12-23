import { Address } from '@planq-network/base/lib/address'
import { newKitFromWeb3 } from '@planq-network/contractkit'
import { assumeOwnership } from '@planq-network/contractkit/lib/test-utils/transferownership'
import { testWithGanache } from '@planq-network/dev-utils/lib/ganache-test'
import Web3 from 'web3'
import { testLocally } from '../../test-utils/cliUtils'
import GetBuyAmount from './get-buy-amount'

testWithGanache('grandamento:get-buy-amount cmd', (web3: Web3) => {
  const kit = newKitFromWeb3(web3)
  let accounts: Address[] = []

  beforeAll(async () => {
    accounts = await web3.eth.getAccounts()
    kit.defaultAccount = accounts[0]
  })

  beforeEach(async () => {
    await assumeOwnership(web3, accounts[0])
  })

  it('gets the buy amount', async () => {
    await testLocally(GetBuyAmount, [
      '--sellPlanq',
      'true',
      '--stableToken',
      'pusd',
      '--value',
      '100000000000000000000000',
    ])
  })
})
