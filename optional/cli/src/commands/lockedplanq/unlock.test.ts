import { newKitFromWeb3 } from '@planq-network/contractkit'
import { testWithGanache } from '@planq-network/dev-utils/lib/ganache-test'
import { addressToPublicKey } from '@planq-network/utils/lib/signatureUtils'
import Web3 from 'web3'
import { testLocally } from '../../test-utils/cliUtils'
import Register from '../account/register'
import Vote from '../election/vote'
import ValidatorAffiliate from '../validator/affiliate'
import ValidatorRegister from '../validator/register'
import ValidatorGroupMember from '../validatorgroup/member'
import ValidatorGroupRegister from '../validatorgroup/register'
import Lock from './lock'
import Unlock from './unlock'

process.env.NO_SYNCCHECK = 'true'

testWithGanache('lockedplanq:unlock cmd', (web3: Web3) => {
  test('can unlock correctly from registered validator group', async () => {
    const accounts = await web3.eth.getAccounts()
    const account = accounts[0]
    const validator = accounts[1]
    const kit = newKitFromWeb3(web3)
    const lockedPlanq = await kit.contracts.getLockedPlanq()
    await testLocally(Register, ['--from', account])
    await testLocally(Lock, ['--from', account, '--value', '20000000000000000000000'])
    await testLocally(ValidatorGroupRegister, ['--from', account, '--commission', '0', '--yes'])
    await testLocally(Register, ['--from', validator])
    await testLocally(Lock, ['--from', validator, '--value', '20000000000000000000000'])
    const ecdsaPublicKey = await addressToPublicKey(validator, web3.eth.sign)
    await testLocally(ValidatorRegister, [
      '--from',
      validator,
      '--ecdsaKey',
      ecdsaPublicKey,
      '--blsKey',
      '0x4fa3f67fc913878b068d1fa1cdddc54913d3bf988dbe5a36a20fa888f20d4894c408a6773f3d7bde11154f2a3076b700d345a42fd25a0e5e83f4db5586ac7979ac2053cd95d8f2efd3e959571ceccaa743e02cf4be3f5d7aaddb0b06fc9aff00',
      '--blsSignature',
      '0xcdb77255037eb68897cd487fdd85388cbda448f617f874449d4b11588b0b7ad8ddc20d9bb450b513bb35664ea3923900',
      '--yes',
    ])
    await testLocally(ValidatorAffiliate, ['--yes', '--from', validator, account])
    await testLocally(ValidatorGroupMember, ['--yes', '--from', account, '--accept', validator])
    await testLocally(Vote, [
      '--from',
      account,
      '--for',
      account,
      '--value',
      '10000000000000000000000',
    ])
    await testLocally(Unlock, ['--from', account, '--value', '10000000000000000000000'])
    const pendingWithdrawalsTotalValue = await lockedPlanq.getPendingWithdrawalsTotalValue(account)
    expect(pendingWithdrawalsTotalValue.toFixed()).toBe('10000000000000000000000')
  })
})
