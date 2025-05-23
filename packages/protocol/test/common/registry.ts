import { assertRevert, assertTransactionRevertWithReason } from '@planq-network/protocol/lib/test-utils'
import { soliditySha3 } from '@planq-network/utils/lib/solidity'
import { RegistryInstance } from 'types'

const Registry: Truffle.Contract<RegistryInstance> = artifacts.require('Registry')

contract('Registry', (accounts: any) => {
  let registry: RegistryInstance

  const owner = accounts[0]
  const anAddress: string = '0x06012c8cf97BEaD5deAe237070F9587f8E7A266d'
  const anIdentifier: string = 'cryptokitties'
  const hash: string = soliditySha3(anIdentifier)

  beforeEach(async () => {
    registry = await Registry.new(true, { from: owner })
    await registry.initialize()
  })

  describe('#initialize()', () => {
    it('should have set the owner', async () => {
      const contractOwner: string = await registry.owner()
      assert.equal(contractOwner, owner)
    })

    it('should not be callable again', async () => {
      await assertTransactionRevertWithReason(registry.initialize(), 'contract already initialized')
    })
  })

  describe('#setAddressFor()', () => {
    it('should allow the owner to set an address', async () => {
      await registry.setAddressFor(anIdentifier, anAddress)
      assert.equal(await registry.registry(hash), anAddress, 'The address should have been set')
    })

    it('should not allow a different user to set an address', async () => {
      await assertTransactionRevertWithReason(
        registry.setAddressFor(anIdentifier, anAddress, { from: accounts[1] }),
        'Ownable: caller is not the owner'
      )
    })

    it('should emit an event', async () => {
      const response = await registry.setAddressFor(anIdentifier, anAddress)
      const events = response.logs
      assert.equal(events.length, 1)
      assert.equal(events[0].event, 'RegistryUpdated')
      assert.equal(events[0].args.identifier, anIdentifier)
      assert.equal(events[0].args.identifierHash, soliditySha3(anIdentifier))
      assert.equal(events[0].args.addr, anAddress)
    })
  })

  describe('#getAddressForOrDie()', () => {
    it('should provide access to registry by identifier hash', async () => {
      await registry.setAddressFor(anIdentifier, anAddress)
      assert.equal(await registry.getAddressForOrDie(hash), anAddress)
    })

    it('should revert if address not set', async () => {
      await assertRevert(registry.getAddressForOrDie(hash))
    })
  })

  describe('#getAddressFor()', () => {
    it('should provide access to registry by identifier hash', async () => {
      await registry.setAddressFor(anIdentifier, anAddress)
      assert.equal(await registry.getAddressFor(hash), anAddress)
    })

    it('should not revert if address not set', async () => {
      await registry.getAddressFor(hash)
    })
  })

  describe('#getAddressForStringOrDie()', () => {
    it('should provide access to registry by string identifier', async () => {
      await registry.setAddressFor(anIdentifier, anAddress)
      assert.equal(await registry.getAddressForStringOrDie(anIdentifier), anAddress)
    })

    it('should revert if address not set', async () => {
      await assertRevert(registry.getAddressForStringOrDie(anIdentifier))
    })
  })

  describe('#getAddressForString()', () => {
    it('should provide access to registry by identifier hash', async () => {
      await registry.setAddressFor(anIdentifier, anAddress)
      assert.equal(await registry.getAddressForString(anIdentifier), anAddress)
    })

    it('should not revert if address not set', async () => {
      await registry.getAddressForString(anIdentifier)
    })
  })
})
