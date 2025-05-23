import { testWithGanache } from '@planq-network/dev-utils/lib/ganache-test'
import Web3 from 'web3'
import { testLocally } from '../../test-utils/cliUtils'
import Register from './register'

process.env.NO_SYNCCHECK = 'true'

testWithGanache('account:register cmd', (web3: Web3) => {
  test('can register account', async () => {
    const accounts = await web3.eth.getAccounts()

    await testLocally(Register, ['--from', accounts[0], '--name', 'Chapulin Colorado'])
  })

  test('fails if from is missing', async () => {
    // const accounts = await web3.eth.getAccounts()

    await expect(testLocally(Register, [])).rejects.toThrow('Missing required flag')
  })
})
