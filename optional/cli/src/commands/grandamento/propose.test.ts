import { Address } from '@planq-network/base/lib/address'
import { newKitFromWeb3 } from '@planq-network/contractkit'
import { assumeOwnership } from '@planq-network/contractkit/lib/test-utils/transferownership'
import {
  ExchangeProposalState,
  GrandaMentoWrapper,
} from '@planq-network/contractkit/lib/wrappers/GrandaMento'
import { testWithGanache } from '@planq-network/dev-utils/lib/ganache-test'
import BigNumber from 'bignumber.js'
import Web3 from 'web3'
import { testLocally } from '../../test-utils/cliUtils'
import { setGrandaMentoLimits } from '../../test-utils/grandaMento'
import Propose from './propose'

testWithGanache('grandamento:propose cmd', (web3: Web3) => {
  const kit = newKitFromWeb3(web3)
  let grandaMento: GrandaMentoWrapper
  let accounts: Address[] = []

  beforeAll(async () => {
    accounts = await web3.eth.getAccounts()
    kit.defaultAccount = accounts[0]
    grandaMento = await kit.contracts.getGrandaMento()
  })

  beforeEach(async () => {
    await assumeOwnership(web3, accounts[0])
    await setGrandaMentoLimits(grandaMento)
  })

  describe('proposes', () => {
    it('can sell Planq', async () => {
      await testLocally(Propose, [
        '--from',
        accounts[0],
        '--sellPlanq',
        'true',
        '--stableToken',
        'pUSD',
        '--value',
        '10000',
      ])

      const activeProposals = await grandaMento.getActiveProposalIds()

      expect(activeProposals).not.toEqual([])

      const proposal = await grandaMento.getExchangeProposal(activeProposals[0])
      expect(proposal.exchanger).toEqual(accounts[0])
      expect(proposal.stableToken).toEqual((await kit.contracts.getStableToken()).address)
      expect(proposal.sellAmount).toEqBigNumber(10000)
      expect(proposal.approvalTimestamp).toEqual(new BigNumber(0))
      expect(proposal.state).toEqual(ExchangeProposalState.Proposed)
      expect(proposal.sellPlanq).toEqual(true)
    })

    it('can buy Planq', async () => {
      await testLocally(Propose, [
        '--from',
        accounts[0],
        '--sellPlanq',
        'false',
        '--stableToken',
        'pUSD',
        '--value',
        '10000',
      ])
      const activeProposals = await grandaMento.getActiveProposalIds()

      expect(activeProposals).not.toEqual([])

      const proposal = await grandaMento.getExchangeProposal(activeProposals[0])
      expect(proposal.exchanger).toEqual(accounts[0])
      expect(proposal.stableToken).toEqual((await kit.contracts.getStableToken()).address)
      expect(proposal.sellAmount).toEqBigNumber(10000)
      expect(proposal.approvalTimestamp).toEqual(new BigNumber(0))
      expect(proposal.state).toEqual(ExchangeProposalState.Proposed)
      expect(proposal.sellPlanq).toEqual(false)
    })

    it("doesn't work without explicitly setting the sellPlanq flag", async () => {
      let activeProposals

      await expect(
        testLocally(Propose, [
          '--from',
          accounts[0],
          '--sellPlanq',
          '--stableToken',
          'pUSD',
          '--value',
          '10000',
        ])
      ).rejects.toThrow()

      activeProposals = await grandaMento.getActiveProposalIds()
      expect(activeProposals).toEqual([])

      await expect(
        testLocally(Propose, [
          '--from',
          accounts[0],
          '--sellPlanq',
          'tru', // typo on propose
          '--stableToken',
          'pUSD',
          '--value',
          '10000',
        ])
      ).rejects.toThrow()

      activeProposals = await grandaMento.getActiveProposalIds()
      expect(activeProposals).toEqual([])
    })
  })
})
