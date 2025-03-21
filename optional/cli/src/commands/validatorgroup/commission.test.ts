import { mineBlocks, testWithGanache } from '@planq-network/dev-utils/lib/ganache-test'
import Web3 from 'web3'
import { testLocally } from '../../test-utils/cliUtils'
import AccountRegister from '../account/register'
import Lock from '../lockedplanq/lock'
import Commission from './commission'
import ValidatorGroupRegister from './register'

process.env.NO_SYNCCHECK = 'true'

testWithGanache('validatorgroup:comission cmd', (web3: Web3) => {
  async function registerValidatorGroup() {
    const accounts = await web3.eth.getAccounts()

    await testLocally(AccountRegister, ['--from', accounts[0]])
    await testLocally(Lock, ['--from', accounts[0], '--value', '10000000000000000000000'])
    await testLocally(ValidatorGroupRegister, [
      '--from',
      accounts[0],
      '--commission',
      '0.1',
      '--yes',
    ])
  }

  test('can queue update', async () => {
    const accounts = await web3.eth.getAccounts()
    await registerValidatorGroup()
    await testLocally(Commission, ['--from', accounts[0], '--queue-update', '0.2'])
  })
  test('can apply update', async () => {
    const accounts = await web3.eth.getAccounts()
    await registerValidatorGroup()
    await testLocally(Commission, ['--from', accounts[0], '--queue-update', '0.2'])
    await mineBlocks(3, web3)
    await testLocally(Commission, ['--from', accounts[0], '--apply'])
  })
})
