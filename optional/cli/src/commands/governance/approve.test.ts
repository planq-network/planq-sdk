import { Address } from '@planq-network/connect'
import { newKitFromWeb3 } from '@planq-network/contractkit'
import { GovernanceWrapper } from '@planq-network/contractkit/lib/wrappers/Governance'
import { NetworkConfig, testWithGanache, timeTravel } from '@planq-network/dev-utils/lib/ganache-test'
import Web3 from 'web3'
import { testLocally } from '../../test-utils/cliUtils'
import Approve from './approve'

process.env.NO_SYNCCHECK = 'true'

const expConfig = NetworkConfig.governance

testWithGanache('governance:approve cmd', (web3: Web3) => {
  const minDeposit = web3.utils.toWei(expConfig.minDeposit.toString(), 'ether')
  const kit = newKitFromWeb3(web3)
  const proposalID = '1'

  let accounts: Address[] = []
  let governance: GovernanceWrapper

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts()
    kit.defaultAccount = accounts[0]
    governance = await kit.contracts.getGovernance()
    await governance
      .propose([], 'URL')
      .sendAndWaitForReceipt({ from: accounts[0], value: minDeposit })
    await timeTravel(expConfig.dequeueFrequency, web3)
  })
  test('approve fails if approver not passed in', async () => {
    await expect(
      testLocally(Approve, ['--from', accounts[0], '--proposalID', proposalID])
    ).rejects.toThrow("Some checks didn't pass!")
  })
  test('can approve with multisig option', async () => {
    await testLocally(Approve, ['--from', accounts[0], '--proposalID', proposalID, '--useMultiSig'])
    expect(await governance.isApproved(proposalID)).toBeTruthy()
  })
})
