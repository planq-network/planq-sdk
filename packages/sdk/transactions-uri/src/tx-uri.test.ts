import { PlanqTx } from '@planq-network/connect'
import { PlanqContract, newKitFromWeb3 } from '@planq-network/contractkit'
import { testWithGanache } from '@planq-network/dev-utils/lib/ganache-test'
import { buildUri, parseUri } from './tx-uri'

testWithGanache('URI utils', (web3) => {
  const recipient = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef'
  const value = '100'

  const simpleTransferTx: PlanqTx = {
    value,
    to: recipient,
  }
  const simpleTransferUri = `planq:${recipient}?value=${value}`

  let stableTokenTransferUri: string
  let stableTokenTransferTx: PlanqTx

  let lockPlanqUri: string
  let lockPlanqTx: PlanqTx

  const kit = newKitFromWeb3(web3)

  beforeAll(async () => {
    const stableTokenAddr = await kit.registry.addressFor(PlanqContract.StableToken)
    stableTokenTransferUri = `planq:${stableTokenAddr}/transfer(address,uint256)?args=[${recipient},${value}]`
    const stableToken = await kit.contracts.getStableToken()
    const transferData = stableToken.transfer(recipient, value).txo.encodeABI()
    stableTokenTransferTx = {
      to: stableTokenAddr,
      data: transferData,
    }

    const lockedPlanqAddr = await kit.registry.addressFor(PlanqContract.LockedPlanq)
    lockPlanqUri = `planq:${lockedPlanqAddr}/lock()?value=${value}`
    const lockedPlanq = await kit.contracts.getLockedPlanq()
    const lockData = lockedPlanq.lock().txo.encodeABI()
    lockPlanqTx = {
      to: lockedPlanqAddr,
      data: lockData,
      value,
    }
  })

  describe('#parseUri', () => {
    it('should match simple PLQ transfer tx', () => {
      const resultTx = parseUri(simpleTransferUri)
      expect(resultTx).toEqual(simpleTransferTx)
    })

    it('should match pUSD transfer tx', () => {
      const resultTx = parseUri(stableTokenTransferUri)
      expect(resultTx).toEqual(stableTokenTransferTx)
    })

    it('should match lock planq tx', () => {
      const resultTx = parseUri(lockPlanqUri)
      expect(resultTx).toEqual(lockPlanqTx)
    })
  })

  describe('#buildUri', () => {
    it('should match simple PLQ transfer URI', () => {
      const resultUri = buildUri(simpleTransferTx)
      expect(resultUri).toEqual(simpleTransferUri)
    })

    it('should match pUSD transfer URI', () => {
      const uri = buildUri(stableTokenTransferTx, 'transfer', ['address', 'uint256'])
      expect(uri).toEqual(stableTokenTransferUri)
    })

    it('should match lock planq URI', () => {
      const uri = buildUri(lockPlanqTx, 'lock')
      expect(uri).toEqual(lockPlanqUri)
    })
  })
})
