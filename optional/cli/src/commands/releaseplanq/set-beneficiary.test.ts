import { newKitFromWeb3 } from '@planq-network/contractkit'
import { newReleasePlanq } from '@planq-network/contractkit/lib/generated/ReleasePlanq'
import { ReleasePlanqWrapper } from '@planq-network/contractkit/lib/wrappers/ReleasePlanq'
import { getContractFromEvent, testWithGanache } from '@planq-network/dev-utils/lib/ganache-test'
import Web3 from 'web3'
import { testLocally } from '../../test-utils/cliUtils'
import SetBeneficiary from './set-beneficiary'

process.env.NO_SYNCCHECK = 'true'

testWithGanache('releaseplanq:set-beneficiary cmd', (web3: Web3) => {
  let contractAddress: any
  let kit: any
  let releasePlanqWrapper: ReleasePlanqWrapper
  let releasePlanqMultiSig: any
  let releaseOwner: string
  let beneficiary: string
  let newBeneficiary: string
  let otherAccount: string

  beforeEach(async () => {
    const accounts = await web3.eth.getAccounts()
    releaseOwner = accounts[0]
    newBeneficiary = accounts[2]
    otherAccount = accounts[3]
    contractAddress = await getContractFromEvent(
      'ReleasePlanqInstanceCreated(address,address)',
      web3,
      { index: 1 } // canValidate = false
    )
    kit = newKitFromWeb3(web3)
    releasePlanqWrapper = new ReleasePlanqWrapper(
      kit.connection,
      newReleasePlanq(web3, contractAddress),
      kit.contracts
    )
    beneficiary = await releasePlanqWrapper.getBeneficiary()
    const owner = await releasePlanqWrapper.getOwner()
    releasePlanqMultiSig = await kit.contracts.getMultiSig(owner)
  })

  test('can change beneficiary', async () => {
    // First submit the tx from the release owner (accounts[0])
    await testLocally(SetBeneficiary, [
      '--contract',
      contractAddress,
      '--from',
      releaseOwner,
      '--beneficiary',
      newBeneficiary,
      '--yesreally',
    ])
    // The multisig tx should not confirm until both parties submit
    expect(await releasePlanqWrapper.getBeneficiary()).toEqual(beneficiary)
    await testLocally(SetBeneficiary, [
      '--contract',
      contractAddress,
      '--from',
      beneficiary,
      '--beneficiary',
      newBeneficiary,
      '--yesreally',
    ])
    expect(await releasePlanqWrapper.getBeneficiary()).toEqual(newBeneficiary)
    // It should also update the multisig owners
    expect(await releasePlanqMultiSig.getOwners()).toEqual([releaseOwner, newBeneficiary])
  })

  test('if called by a different account, it should fail', async () => {
    await expect(
      testLocally(SetBeneficiary, [
        '--contract',
        contractAddress,
        '--from',
        otherAccount,
        '--beneficiary',
        newBeneficiary,
        '--yesreally',
      ])
    ).rejects.toThrow()
  })

  test('if the owners submit different txs, nothing on the ReleasePlanq contract should change', async () => {
    // ReleaseOwner tries to change the beneficiary to `newBeneficiary` while the beneficiary
    // tries to change to `otherAccount`. Nothing should change on the RG contract.
    await testLocally(SetBeneficiary, [
      '--contract',
      contractAddress,
      '--from',
      releaseOwner,
      '--beneficiary',
      newBeneficiary,
      '--yesreally',
    ])
    await testLocally(SetBeneficiary, [
      '--contract',
      contractAddress,
      '--from',
      beneficiary,
      '--beneficiary',
      otherAccount,
      '--yesreally',
    ])
    expect(await releasePlanqWrapper.getBeneficiary()).toEqual(beneficiary)
    expect(await releasePlanqMultiSig.getOwners()).toEqual([releaseOwner, beneficiary])
  })
})
