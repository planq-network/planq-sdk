import { NULL_ADDRESS } from '@planq-network/base/lib/address'
import { PlanqContractName } from '@planq-network/protocol/lib/registry-utils'
import {
  assertBalance,
  assertEqualBN,
  assertTransactionRevertWithReason,
} from '@planq-network/protocol/lib/test-utils'
import { BigNumber } from 'bignumber.js'
import _ from 'lodash'
import {
  FreezerContract,
  FreezerInstance,
  PlanqTokenContract,
  PlanqTokenInstance,
  MockPlanqTokenContract,
  MockPlanqTokenInstance,
  RegistryContract,
  RegistryInstance,
} from 'types'

const Freezer: FreezerContract = artifacts.require('Freezer')
const PlanqToken: PlanqTokenContract = artifacts.require('PlanqToken')
const Registry: RegistryContract = artifacts.require('Registry')
const MockPlanqToken: MockPlanqTokenContract = artifacts.require('MockPlanqToken')

// @ts-ignore
// TODO(mcortesi): Use BN
PlanqToken.numberFormat = 'BigNumber'

contract('PlanqToken', (accounts: string[]) => {
  let freezer: FreezerInstance
  let planqToken: PlanqTokenInstance
  let registry: RegistryInstance
  const ONE_PLANQTOKEN = new BigNumber('1000000000000000000')
  const TWO_PLANQTOKEN = new BigNumber('2000000000000000000')
  const burnAddress = '0x000000000000000000000000000000000000dEaD'

  const sender = accounts[0]
  const receiver = accounts[1]

  beforeEach(async () => {
    freezer = await Freezer.new(true)
    planqToken = await PlanqToken.new(true)
    registry = await Registry.new(true)
    await registry.setAddressFor(PlanqContractName.Freezer, freezer.address)
    await planqToken.initialize(registry.address)
  })

  describe('#name()', () => {
    it('should have a name', async () => {
      const name: string = await planqToken.name()
      assert.equal(name, 'Planq native asset')
    })
  })

  describe('#symbol()', () => {
    it('should have a symbol', async () => {
      const name: string = await planqToken.symbol()
      assert.equal(name, 'PLQ')
    })
  })

  describe('#burn()', () => {
    let startBurn: BigNumber

    beforeEach(async () => {
      startBurn = await planqToken.getBurnedAmount()
    })

    it('burn address starts with zero balance', async () => {
      assertEqualBN(await planqToken.balanceOf(burnAddress), 0)
    })

    it('burn starts as start burn amount', async () => {
      assertEqualBN(await planqToken.getBurnedAmount(), startBurn)
    })

    it('Burned amount equals the balance of the burn address', async () => {
      assertEqualBN(await planqToken.getBurnedAmount(), await planqToken.balanceOf(burnAddress))
    })

    it('returns right burned amount', async () => {
      await planqToken.burn(ONE_PLANQTOKEN)

      assertEqualBN(await planqToken.getBurnedAmount(), ONE_PLANQTOKEN.plus(startBurn))
    })
  })

  describe('#circulatingSupply()', () => {
    let mockPlanqToken: MockPlanqTokenInstance

    beforeEach(async () => {
      mockPlanqToken = await MockPlanqToken.new()
      // set supply to 1K
      await mockPlanqToken.setTotalSupply(ONE_PLANQTOKEN.multipliedBy(1000))
    })

    it('matches circulatingSupply() when there was no burn', async () => {
      assertEqualBN(await mockPlanqToken.circulatingSupply(), await mockPlanqToken.totalSupply())
    })

    it('decreases when there was a burn', async () => {
      // mock a burn
      await mockPlanqToken.setBalanceOf(burnAddress, ONE_PLANQTOKEN)

      const circulatingSupply = await mockPlanqToken.circulatingSupply()
      // circulatingSupply got reduced to 999 after burning 1 Planq
      assertEqualBN(circulatingSupply, ONE_PLANQTOKEN.multipliedBy(999))
      assertEqualBN(
        circulatingSupply,
        new BigNumber(await mockPlanqToken.totalSupply()).plus(ONE_PLANQTOKEN.multipliedBy(-1))
      )
    })
  })

  describe('#decimals()', () => {
    it('should have decimals', async () => {
      const decimals: BigNumber = await planqToken.decimals()
      assert.equal(decimals.toNumber(), 18)
    })
  })

  describe('#balanceOf()', () => {
    it('should match the balance returned by web3', async () => {
      assertEqualBN(await planqToken.balanceOf(receiver), await web3.eth.getBalance(receiver))
    })
  })

  describe('#approve()', () => {
    it('should set "allowed"', async () => {
      await planqToken.approve(receiver, ONE_PLANQTOKEN)
      assert.equal((await planqToken.allowance(sender, receiver)).valueOf(), ONE_PLANQTOKEN.valueOf())
    })
  })

  describe('#increaseAllowance()', () => {
    it('should increase "allowed"', async () => {
      await planqToken.increaseAllowance(receiver, ONE_PLANQTOKEN)
      await planqToken.increaseAllowance(receiver, ONE_PLANQTOKEN)
      assert.equal((await planqToken.allowance(sender, receiver)).valueOf(), TWO_PLANQTOKEN.valueOf())
    })
  })

  describe('#decreaseAllowance()', () => {
    it('should decrease "allowed"', async () => {
      await planqToken.approve(receiver, TWO_PLANQTOKEN)
      await planqToken.decreaseAllowance(receiver, ONE_PLANQTOKEN)
      assert.equal((await planqToken.allowance(sender, receiver)).valueOf(), ONE_PLANQTOKEN.valueOf())
    })
  })

  describe('#allowance()', () => {
    it('should return the allowance', async () => {
      await planqToken.approve(receiver, ONE_PLANQTOKEN)
      assert.equal((await planqToken.allowance(sender, receiver)).valueOf(), ONE_PLANQTOKEN.valueOf())
    })
  })

  describe('#transfer()', () => {
    it('should transfer balance from one user to another', async () => {
      const startBalanceFrom = await planqToken.balanceOf(sender)
      const startBalanceTo = await planqToken.balanceOf(receiver)
      await planqToken.transfer(receiver, ONE_PLANQTOKEN)
      await assertBalance(sender, startBalanceFrom.minus(ONE_PLANQTOKEN))
      await assertBalance(receiver, startBalanceTo.plus(ONE_PLANQTOKEN))
    })

    it('should transfer balance with a comment', async () => {
      const comment = 'tacos at lunch'
      const startBalanceFrom = await planqToken.balanceOf(sender)
      const startBalanceTo = await planqToken.balanceOf(receiver)
      const res = await planqToken.transferWithComment(receiver, ONE_PLANQTOKEN, comment)
      const transferEvent = _.find(res.logs, { event: 'Transfer' })
      const transferCommentEvent = _.find(res.logs, { event: 'TransferComment' })
      assert.exists(transferEvent)
      assert.equal(transferCommentEvent.args.comment, comment)
      await assertBalance(sender, startBalanceFrom.minus(ONE_PLANQTOKEN))
      await assertBalance(receiver, startBalanceTo.plus(ONE_PLANQTOKEN))
    })

    it('should not allow transferring to the null address', async () => {
      await assertTransactionRevertWithReason(
        planqToken.transfer(NULL_ADDRESS, ONE_PLANQTOKEN, { gasPrice: 0 }),
        'transfer attempted to reserved address 0x0'
      )
    })

    it('should not allow transferring more than the sender has', async () => {
      // We try to send four more planq tokens than the sender has, in case they happen to mine the
      // block with this transaction, which will reward them with 3 planq tokens.
      const value = web3.utils.toBN(
        (await planqToken.balanceOf(sender)).plus(ONE_PLANQTOKEN.times(4))
      )
      await assertTransactionRevertWithReason(
        planqToken.transfer(receiver, value),
        'transfer value exceeded balance of sender'
      )
    })
  })

  describe('#transferFrom()', () => {
    beforeEach(async () => {
      await planqToken.approve(receiver, ONE_PLANQTOKEN)
    })

    it('should transfer balance from one user to another', async () => {
      const startBalanceFrom = await planqToken.balanceOf(sender)
      const startBalanceTo = await planqToken.balanceOf(receiver)
      await planqToken.transferFrom(sender, receiver, ONE_PLANQTOKEN, { from: receiver })
      await assertBalance(sender, startBalanceFrom.minus(ONE_PLANQTOKEN))
      await assertBalance(receiver, startBalanceTo.plus(ONE_PLANQTOKEN))
    })

    it('should not allow transferring to the null address', async () => {
      await assertTransactionRevertWithReason(
        planqToken.transferFrom(sender, NULL_ADDRESS, ONE_PLANQTOKEN, { from: receiver }),
        'transfer attempted to reserved address 0x0'
      )
    })

    it('should not allow transferring more than the sender has', async () => {
      // We try to send four more planq tokens than the sender has, in case they happen to mine the
      // block with this transaction, which will reward them with 3 planq tokens.
      const value = web3.utils.toBN(
        (await planqToken.balanceOf(sender)).plus(ONE_PLANQTOKEN.times(4))
      )
      await planqToken.approve(receiver, value)
      await assertTransactionRevertWithReason(
        planqToken.transferFrom(sender, receiver, value, { from: receiver }),
        'transfer value exceeded balance of sender'
      )
    })

    it('should not allow transferring more than the spender is allowed', async () => {
      await assertTransactionRevertWithReason(
        planqToken.transferFrom(sender, receiver, ONE_PLANQTOKEN.plus(1), {
          from: receiver,
        }),
        "transfer value exceeded sender's allowance for spender"
      )
    })
  })
})
