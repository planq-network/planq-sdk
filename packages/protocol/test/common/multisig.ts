import { NULL_ADDRESS } from '@planq-network/base/lib/address'
import {
  assertEqualBN,
  assertLogMatches2,
  assertTransactionRevertWithReason,
} from '@planq-network/protocol/lib/test-utils'
import { parseMultiSigTransaction } from '@planq-network/protocol/lib/web3-utils'
import _ from 'lodash'
import { MultiSigContract, MultiSigInstance } from 'types'

const MultiSig: MultiSigContract = artifacts.require('MultiSig')

// TODO(asa): Test more governance configurations, calling functions on external contracts.
contract('MultiSig', (accounts: any) => {
  let multiSig: MultiSigInstance

  const owners = [accounts[0], accounts[1]]
  const requiredSignatures = 2
  const internalRequiredSignatures = 2

  beforeEach(async () => {
    multiSig = await MultiSig.new(true)
    await multiSig.initialize(owners, requiredSignatures, internalRequiredSignatures)
  })

  describe('#initialize()', () => {
    it('should have set the owners', async () => {
      assert.deepEqual(await multiSig.getOwners(), owners)
    })

    it('should have set the number of required signatures for external transactions', async () => {
      const required: number = (await multiSig.required()).toNumber()
      assert.equal(required, requiredSignatures)
    })

    it('should have set the number of required signatures for internal transactions', async () => {
      const required: number = (await multiSig.internalRequired()).toNumber()
      assert.equal(required, internalRequiredSignatures)
    })

    it('should not be callable again', async () => {
      await assertTransactionRevertWithReason(
        multiSig.initialize(owners, requiredSignatures, internalRequiredSignatures),
        'contract already initialized'
      )
    })
  })

  describe('fallback function', () => {
    describe('when receiving planq', () => {
      it('emits Deposit event with correct parameters', async () => {
        const value = 100
        // @ts-ignore
        const res = await multiSig.send(value)
        assertLogMatches2(res.logs[0], {
          event: 'Deposit',
          args: {
            sender: accounts[0],
            value,
          },
        })
      })
    })

    describe('when receiving 0 value', () => {
      it('does not emit an event', async () => {
        // @ts-ignore
        const res = await multiSig.send(0)
        assert.equal(res.logs, 0)
      })
    })
  })

  describe('#submitTransaction()', () => {
    let txData: string
    beforeEach(async () => {
      // @ts-ignore
      txData = multiSig.contract.methods.addOwner(accounts[2]).encodeABI()
    })

    it('should allow an owner to submit a transaction', async () => {
      // @ts-ignore: TODO(mcortesi): fix typings
      const tx = await multiSig.submitTransaction(multiSig.address, 0, txData, {
        from: accounts[0],
      })

      const txEvent = _.find(tx.logs, {
        event: 'Confirmation',
      })
      const txId = txEvent.args.transactionId

      // @ts-ignore: TODO(mcortesi): fix typings
      const parsedTxData = parseMultiSigTransaction(await multiSig.transactions(txId))
      assert.equal(parsedTxData.destination, multiSig.address)
      assert.equal(parsedTxData.value, 0)
      assert.equal(parsedTxData.data, txData)
      assert.isFalse(parsedTxData.executed)
      assert.isTrue(await multiSig.confirmations(txId, accounts[0]))
      assert.equal((await multiSig.transactionCount()).toNumber(), 1)
    })

    it('should not allow an owner to submit a transaction to a null address', async () => {
      // @ts-ignore: TODO(mcortesi): fix typings
      await assertTransactionRevertWithReason(
        multiSig.submitTransaction(NULL_ADDRESS, 0, txData),
        'address was null'
      )
    })

    it('should not allow a non-owner to submit a transaction', async () => {
      await assertTransactionRevertWithReason(
        // @ts-ignore: TODO(mcortesi): fix typings
        multiSig.submitTransaction(multiSig.address, 0, txData, { from: accounts[2] }),
        'owner does not exist'
      )
    })
  })

  describe('#confirmTransaction()', () => {
    let txId: number
    let tx: string
    beforeEach(async () => {
      // @ts-ignore
      const txData = multiSig.contract.methods.addOwner(accounts[2]).encodeABI()
      // @ts-ignore: TODO(mcortesi): fix typings
      tx = await multiSig.submitTransaction(multiSig.address, 0, txData, {
        from: accounts[0],
      })

      // @ts-ignore: TODO(mcortesi): fix typings
      const txEvent = _.find(tx.logs, {
        event: 'Confirmation',
      })
      txId = txEvent.args.transactionId
    })

    it('should allow an owner to confirm a transaction', async () => {
      await multiSig.confirmTransaction(txId, { from: accounts[1] })
      assert.isTrue(await multiSig.confirmations(txId, accounts[1]))

      // @ts-ignore: TODO(mcortesi): fix typings
      const parsedTxData = parseMultiSigTransaction(await multiSig.transactions(txId))
      assert.isTrue(parsedTxData.executed)
    })

    it('should not allow an owner to confirm a transaction twice', async () => {
      await assertTransactionRevertWithReason(
        multiSig.confirmTransaction(txId, { from: accounts[0] }),
        'transaction was already confirmed for owner'
      )
    })

    it('should not allow a non-owner to confirm a transaction', async () => {
      await assertTransactionRevertWithReason(
        multiSig.confirmTransaction(txId, { from: accounts[2] }),
        'owner does not exist'
      )
    })
  })

  describe('#revokeConfirmation()', () => {
    let txId: number
    let tx: string
    beforeEach(async () => {
      // @ts-ignore
      const txData = multiSig.contract.methods.addOwner(accounts[2]).encodeABI()
      // @ts-ignore: TODO(mcortesi): fix typings
      tx = await multiSig.submitTransaction(multiSig.address, 0, txData, {
        from: accounts[0],
      })

      // @ts-ignore: TODO(mcortesi): fix typings
      const txEvent = _.find(tx.logs, {
        event: 'Confirmation',
      })
      txId = txEvent.args.transactionId
    })

    it('should allow an owner to revoke a confirmation', async () => {
      await multiSig.revokeConfirmation(txId)
      assert.isFalse(await multiSig.confirmations(txId, accounts[0]))
    })

    it('should not allow a non-owner to revoke a confirmation', async () => {
      await assertTransactionRevertWithReason(
        multiSig.revokeConfirmation(txId, { from: accounts[2] }),
        'owner does not exist'
      )
    })

    it('should not allow an owner to revoke before confirming', async () => {
      await assertTransactionRevertWithReason(
        multiSig.revokeConfirmation(txId, { from: accounts[1] }),
        'transaction was not confirmed for owner'
      )
    })
  })

  describe('#addOwner()', () => {
    it('should allow a new owner to be added via the MultiSig', async () => {
      // @ts-ignore
      const txData = multiSig.contract.methods.addOwner(accounts[2]).encodeABI()
      // @ts-ignore: TODO(mcortesi): fix typings
      const tx = await multiSig.submitTransaction(multiSig.address, 0, txData, {
        from: accounts[0],
      })

      // @ts-ignore: TODO(mcortesi): fix typings
      const txEvent = _.find(tx.logs, {
        event: 'Confirmation',
      })
      const txId = txEvent.args.transactionId
      // @ts-ignore: TODO(mcortesi): fix typings
      await multiSig.confirmTransaction(txId, { from: accounts[1] })
      assert.isTrue(await multiSig.isOwner(accounts[2]))
      assert.sameMembers([accounts[0], accounts[1], accounts[2]], await multiSig.getOwners())
    })

    it('should not allow an external account to add an owner', async () => {
      // @ts-ignore
      await assertTransactionRevertWithReason(
        multiSig.addOwner(accounts[2], { from: accounts[3] }),
        'msg.sender was not multisig wallet'
      )
    })

    it('should not allow adding the null address', async () => {
      // @ts-ignore
      const txData = multiSig.contract.methods.addOwner(NULL_ADDRESS).encodeABI()
      const tx = await multiSig.submitTransaction(multiSig.address, 0, txData, {
        from: accounts[0],
      })
      // @ts-ignore: TODO(mcortesi): fix typings
      const txEvent = _.find(tx.logs, {
        event: 'Confirmation',
      })
      const txId = txEvent.args.transactionId
      await assertTransactionRevertWithReason(
        multiSig.confirmTransaction(txId, { from: accounts[1] }),
        'Transaction execution failed.'
      )
    })
  })

  describe('#removeOwner()', () => {
    it('should allow an owner to be removed via the MultiSig', async () => {
      // @ts-ignore
      const txData = multiSig.contract.methods.removeOwner(accounts[1]).encodeABI()

      const tx = await multiSig.submitTransaction(multiSig.address, 0, txData, {
        from: accounts[0],
      })

      // @ts-ignore: TODO(mcortesi): fix typings
      const txEvent = _.find(tx.logs, {
        event: 'Confirmation',
      })
      // @ts-ignore: TODO(mcortesi): fix typings
      const txId = txEvent.args.transactionId

      // @ts-ignore: TODO(mcortesi): fix typings
      await multiSig.confirmTransaction(txId, { from: accounts[1] })

      assert.isFalse(await multiSig.isOwner(accounts[1]))
      assertEqualBN(await multiSig.required(), 1)
      assertEqualBN(await multiSig.internalRequired(), 1)
      assert.sameMembers([accounts[0]], await multiSig.getOwners())
    })

    it('should not allow an external account to remove an owner', async () => {
      // @ts-ignore
      await assertTransactionRevertWithReason(
        multiSig.removeOwner(accounts[1], { from: accounts[3] }),
        'msg.sender was not multisig wallet'
      )
    })
  })

  describe('#replaceOwner()', () => {
    it('should allow an existing owner to be replaced by a new one via the MultiSig', async () => {
      // @ts-ignore: TODO(mcortesi): fix typings
      const txData = multiSig.contract.methods.replaceOwner(accounts[1], accounts[2]).encodeABI()
      const tx = await multiSig.submitTransaction(multiSig.address, 0, txData, {
        from: accounts[0],
      })
      // @ts-ignore: TODO(mcortesi): fix typings
      const txEvent = _.find(tx.logs, {
        event: 'Confirmation',
      })
      // @ts-ignore: TODO(mcortesi): fix typings
      const txId = txEvent.args.transactionId
      // @ts-ignore: TODO(mcortesi): fix typings
      await multiSig.confirmTransaction(txId, { from: accounts[1] })
      assert.isTrue(await multiSig.isOwner(accounts[2]))
      assert.isFalse(await multiSig.isOwner(accounts[1]))
      assert.sameMembers([accounts[0], accounts[2]], await multiSig.getOwners())
    })

    it('should not allow an external account to replace an owner', async () => {
      // @ts-ignore
      await assertTransactionRevertWithReason(
        multiSig.replaceOwner(accounts[1], accounts[2], { from: accounts[3] }),
        'msg.sender was not multisig wallet'
      )
    })

    it('should not allow an owner to be replaced by the null address', async () => {
      // @ts-ignore
      const txData = multiSig.contract.methods.replaceOwner(accounts[1], NULL_ADDRESS).encodeABI()
      const tx = await multiSig.submitTransaction(multiSig.address, 0, txData, {
        from: accounts[0],
      })
      // @ts-ignore: TODO(mcortesi): fix typings
      const txEvent = _.find(tx.logs, {
        event: 'Confirmation',
      })
      const txId = txEvent.args.transactionId
      await assertTransactionRevertWithReason(
        multiSig.confirmTransaction(txId, { from: accounts[1] }),
        'Transaction execution failed.'
      )
    })
  })

  describe('#changeRequirement()', () => {
    it('should allow the requirement to be changed via the MultiSig', async () => {
      // @ts-ignore: TODO(mcortesi): fix typings
      const txData = multiSig.contract.methods.changeRequirement(1).encodeABI()
      const tx = await multiSig.submitTransaction(multiSig.address, 0, txData, {
        from: accounts[0],
      })
      // @ts-ignore: TODO(mcortesi): fix typings
      const txEvent = _.find(tx.logs, {
        event: 'Confirmation',
      })
      // @ts-ignore: TODO(mcortesi): fix typings
      const txId = txEvent.args.transactionId

      // @ts-ignore: TODO(mcortesi): fix typings
      await multiSig.confirmTransaction(txId, { from: accounts[1] })
      assertEqualBN(await multiSig.required(), 1)
    })

    it('should not allow an external account to change the requirement', async () => {
      // @ts-ignore
      await assertTransactionRevertWithReason(
        multiSig.changeRequirement(3, { from: accounts[3] }),
        'msg.sender was not multisig wallet'
      )
    })
  })

  describe('#changeInternalRequirement()', () => {
    it('should allow the internal requirement to be changed via the MultiSig', async () => {
      // @ts-ignore: TODO(mcortesi): fix typings
      const txData = multiSig.contract.methods.changeInternalRequirement(1).encodeABI()
      const tx = await multiSig.submitTransaction(multiSig.address, 0, txData, {
        from: accounts[0],
      })
      // @ts-ignore: TODO(mcortesi): fix typings
      const txEvent = _.find(tx.logs, {
        event: 'Confirmation',
      })
      // @ts-ignore: TODO(mcortesi): fix typings
      const txId = txEvent.args.transactionId

      // @ts-ignore: TODO(mcortesi): fix typings
      await multiSig.confirmTransaction(txId, { from: accounts[1] })
      assertEqualBN(await multiSig.internalRequired(), 1)
    })

    it('should not allow an external account to change the internal requirement', async () => {
      // @ts-ignore
      await assertTransactionRevertWithReason(
        multiSig.changeInternalRequirement(3, { from: accounts[3] }),
        'msg.sender was not multisig wallet'
      )
    })
  })

  describe('#getConfirmationCount()', () => {
    let txId: number
    beforeEach(async () => {
      // @ts-ignore: TODO(mcortesi): fix typings
      const txData = multiSig.contract.methods.addOwner(accounts[2]).encodeABI()
      const tx = await multiSig.submitTransaction(multiSig.address, 0, txData, {
        from: accounts[0],
      })
      // @ts-ignore: TODO(mcortesi): fix typings
      const txEvent = _.find(tx.logs, {
        event: 'Confirmation',
      })
      // @ts-ignore: TODO(mcortesi): fix typings
      txId = txEvent.args.transactionId
    })

    it('should return the confirmation count', async () => {
      assertEqualBN(await multiSig.getConfirmationCount(txId), 1)
    })
  })

  describe('#getTransactionCount()', () => {
    beforeEach(async () => {
      // @ts-ignore: TODO(mcortesi): fix typings
      const txData = multiSig.contract.methods.addOwner(accounts[2]).encodeABI()
      await multiSig.submitTransaction(multiSig.address, 0, txData, {
        from: accounts[0],
      })
    })

    it('should return the transaction count', async () => {
      assertEqualBN(await multiSig.getTransactionCount(true, true), 1)
    })
  })

  describe('#getOwners()', () => {
    it('should return the owners', async () => {
      assert.deepEqual(await multiSig.getOwners(), owners)
    })
  })

  describe('#getConfirmations()', () => {
    let txId: number
    beforeEach(async () => {
      // @ts-ignore: TODO(mcortesi): fix typings
      const txData = multiSig.contract.methods.addOwner(accounts[2]).encodeABI()
      const tx = await multiSig.submitTransaction(multiSig.address, 0, txData, {
        from: accounts[0],
      })
      // @ts-ignore: TODO(mcortesi): fix typings
      const txEvent = _.find(tx.logs, {
        event: 'Confirmation',
      })
      // @ts-ignore: TODO(mcortesi): fix typings
      txId = txEvent.args.transactionId
    })

    it('should return the confirmations', async () => {
      assert.deepEqual(await multiSig.getConfirmations(txId), [accounts[0]])
    })
  })

  describe('#getTransactionIds()', () => {
    beforeEach(async () => {
      // @ts-ignore: TODO(mcortesi): fix typings
      const txData = multiSig.contract.methods.addOwner(accounts[2]).encodeABI()
      await multiSig.submitTransaction(multiSig.address, 0, txData, {
        from: accounts[0],
      })
    })

    it('should return the confirmations', async () => {
      const txIds = (await multiSig.getTransactionIds(0, 1, true, true)).map((x) => x.toNumber())
      assert.deepEqual(txIds, [0])
    })
  })
})
