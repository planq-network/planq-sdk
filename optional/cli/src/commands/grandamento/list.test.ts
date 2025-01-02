import { Address } from '@planq-network/base/lib/address'
import { newKitFromWeb3 } from '@planq-network/contractkit'
import { StableToken } from '@planq-network/contractkit/lib/planq-tokens'
import { assumeOwnership } from '@planq-network/contractkit/lib/test-utils/transferownership'
import { PlanqTokenWrapper } from '@planq-network/contractkit/lib/wrappers/PlanqTokenWrapper'
import { GrandaMentoWrapper } from '@planq-network/contractkit/lib/wrappers/GrandaMento'
import { testWithGanache } from '@planq-network/dev-utils/lib/ganache-test'
import BigNumber from 'bignumber.js'
import Web3 from 'web3'
import { testLocally } from '../../test-utils/cliUtils'
import { setGrandaMentoLimits } from '../../test-utils/grandaMento'
import List from './list'

testWithGanache('grandamento:list cmd', (web3: Web3) => {
  const kit = newKitFromWeb3(web3)
  let grandaMento: GrandaMentoWrapper
  let accounts: Address[] = []
  let planqToken: PlanqTokenWrapper

  beforeAll(async () => {
    accounts = await web3.eth.getAccounts()
    kit.defaultAccount = accounts[0]
    grandaMento = await kit.contracts.getGrandaMento()

    planqToken = await kit.contracts.getPlanqToken()
  })

  beforeEach(async () => {
    await assumeOwnership(web3, accounts[0])
    await setGrandaMentoLimits(grandaMento)
  })

  it('shows an empty list of proposals', async () => {
    await testLocally(List, [])
  })

  it('shows proposals', async () => {
    // create mock proposal
    const sellAmount = new BigNumber('100000000')
    await planqToken.increaseAllowance(grandaMento.address, sellAmount).sendAndWaitForReceipt()
    await (
      await grandaMento.createExchangeProposal(
        kit.planqTokens.getContract(StableToken.pUSD),
        sellAmount,
        true
      )
    ).sendAndWaitForReceipt()

    await testLocally(List, [])
  })
})
