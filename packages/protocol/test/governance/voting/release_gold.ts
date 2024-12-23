import { NULL_ADDRESS } from '@planq-network/base/lib/address'
import { PlanqContractName } from '@planq-network/protocol/lib/registry-utils'
import { getParsedSignatureOfAddress } from '@planq-network/protocol/lib/signing-utils'
import {
  assertEqualBN,
  assertGteBN,
  assertLogMatches,
  assertSameAddress,
  // tslint:disable-next-line: ordered-imports
  assertTransactionRevertWithReason,
  assertTransactionRevertWithoutReason,
  timeTravel,
} from '@planq-network/protocol/lib/test-utils'
// tslint:disable-next-line: ordered-imports
import { Signature, addressToPublicKey } from '@planq-network/utils/lib/signatureUtils'
import { BigNumber } from 'bignumber.js'
import _ from 'lodash'
import {
  AccountsContract,
  AccountsInstance,
  FreezerContract,
  FreezerInstance,
  PlanqTokenContract,
  PlanqTokenInstance,
  LockedPlanqContract,
  LockedPlanqInstance,
  MockElectionContract,
  MockElectionInstance,
  MockGovernanceContract,
  MockGovernanceInstance,
  MockStableTokenContract,
  MockStableTokenInstance,
  MockValidatorsContract,
  MockValidatorsInstance,
  RegistryContract,
  RegistryInstance,
  ReleasePlanqContract,
  ReleasePlanqInstance,
} from 'types'
import Web3 from 'web3'

const ONE_PLANQTOKEN = new BigNumber('1000000000000000000')

const authorizationTests: any = {}
const authorizationTestDescriptions = {
  voting: {
    me: 'vote signing key',
    subject: 'voteSigner',
  },
  validating: {
    me: 'validating signing key',
    subject: 'validatorSigner',
  },
  attestation: {
    me: 'attestation signing key',
    subject: 'attestationSigner',
  },
}

const isTest = true

interface ReleasePlanqConfig {
  releaseStartTime: number
  releaseCliffTime: number
  numReleasePeriods: number
  releasePeriod: number
  amountReleasedPerPeriod: BigNumber
  revocable: boolean
  beneficiary: string
  releaseOwner: string
  refundAddress: string
  subjectToLiquidityProvision: boolean
  initialDistributionRatio: number
  canValidate: boolean
  canVote: boolean
}

const Accounts: AccountsContract = artifacts.require('Accounts')
const Freezer: FreezerContract = artifacts.require('Freezer')
const PlanqToken: PlanqTokenContract = artifacts.require('PlanqToken')
const LockedPlanq: LockedPlanqContract = artifacts.require('LockedPlanq')
const MockStableToken: MockStableTokenContract = artifacts.require('MockStableToken')
const MockElection: MockElectionContract = artifacts.require('MockElection')
const MockGovernance: MockGovernanceContract = artifacts.require('MockGovernance')
const MockValidators: MockValidatorsContract = artifacts.require('MockValidators')
const Registry: RegistryContract = artifacts.require('Registry')
const ReleasePlanq: ReleasePlanqContract = artifacts.require('ReleasePlanq')

// @ts-ignore
// TODO(mcortesi): Use BN
LockedPlanq.numberFormat = 'BigNumber'
// @ts-ignore
ReleasePlanq.numberFormat = 'BigNumber'
// @ts-ignore
MockStableToken.numberFormat = 'BigNumber'
// @ts-ignore
PlanqToken.numberFormat = 'BigNumber'

const MINUTE = 60
const HOUR = 60 * 60
const DAY = 24 * HOUR
const MONTH = 30 * DAY
const UNLOCKING_PERIOD = 3 * DAY

contract('ReleasePlanq', (accounts: string[]) => {
  const owner = accounts[0]
  const beneficiary = accounts[1]
  const walletAddress = beneficiary

  const releaseOwner = accounts[2]
  const refundAddress = accounts[3]
  const newBeneficiary = accounts[4]
  let accountsInstance: AccountsInstance
  let freezerInstance: FreezerInstance
  let planqTokenInstance: PlanqTokenInstance
  let lockedPlanqInstance: LockedPlanqInstance
  let mockElection: MockElectionInstance
  let mockGovernance: MockGovernanceInstance
  let mockValidators: MockValidatorsInstance
  let mockStableToken: MockStableTokenInstance
  let registry: RegistryInstance
  let releasePlanqInstance: ReleasePlanqInstance
  let proofOfWalletOwnership: Signature
  const TOTAL_AMOUNT = ONE_PLANQTOKEN.times(10)

  const releasePlanqDefaultSchedule: ReleasePlanqConfig = {
    releaseStartTime: null, // To be adjusted on every run
    releaseCliffTime: HOUR,
    numReleasePeriods: 4,
    releasePeriod: 3 * MONTH,
    amountReleasedPerPeriod: TOTAL_AMOUNT.div(4),
    revocable: true,
    beneficiary,
    releaseOwner,
    refundAddress,
    subjectToLiquidityProvision: false,
    initialDistributionRatio: 1000, // No distribution limit
    canVote: true,
    canValidate: false,
  }

  const createNewReleasePlanqInstance = async (
    releasePlanqSchedule: ReleasePlanqConfig,
    web3: Web3,
    override = {
      prefund: true,
      startReleasing: false,
    }
  ) => {
    const startDelay = 5 * MINUTE
    releasePlanqSchedule.releaseStartTime = (await getCurrentBlockchainTimestamp(web3)) + startDelay
    releasePlanqInstance = await ReleasePlanq.new(isTest)
    if (override.prefund) {
      await planqTokenInstance.transfer(
        releasePlanqInstance.address,
        releasePlanqSchedule.amountReleasedPerPeriod.multipliedBy(
          releasePlanqSchedule.numReleasePeriods
        ),
        {
          from: owner,
        }
      )
    }
    await releasePlanqInstance.initialize(
      releasePlanqSchedule.releaseStartTime,
      releasePlanqSchedule.releaseCliffTime,
      releasePlanqSchedule.numReleasePeriods,
      releasePlanqSchedule.releasePeriod,
      releasePlanqSchedule.amountReleasedPerPeriod,
      releasePlanqSchedule.revocable,
      releasePlanqSchedule.beneficiary,
      releasePlanqSchedule.releaseOwner,
      releasePlanqSchedule.refundAddress,
      releasePlanqSchedule.subjectToLiquidityProvision,
      releasePlanqSchedule.initialDistributionRatio,
      releasePlanqSchedule.canValidate,
      releasePlanqSchedule.canVote,
      registry.address,
      { from: owner }
    )
    if (override.startReleasing) {
      await timeTravel(
        startDelay + releasePlanqSchedule.releaseCliffTime + releasePlanqSchedule.releasePeriod,
        web3
      )
    }
  }

  const getCurrentBlockchainTimestamp = (web3: Web3): Promise<number> =>
    web3.eth.getBlock('latest').then((block) => Number(block.timestamp))

  beforeEach(async () => {
    accountsInstance = await Accounts.new(true)
    freezerInstance = await Freezer.new(true)
    planqTokenInstance = await PlanqToken.new(true)
    lockedPlanqInstance = await LockedPlanq.new(true)
    mockElection = await MockElection.new()
    mockGovernance = await MockGovernance.new()
    mockValidators = await MockValidators.new()
    mockStableToken = await MockStableToken.new()

    registry = await Registry.new(true)
    await registry.setAddressFor(PlanqContractName.Accounts, accountsInstance.address)
    await registry.setAddressFor(PlanqContractName.Election, mockElection.address)
    await registry.setAddressFor(PlanqContractName.Freezer, freezerInstance.address)
    await registry.setAddressFor(PlanqContractName.PlanqToken, planqTokenInstance.address)
    await registry.setAddressFor(PlanqContractName.Governance, mockGovernance.address)
    await registry.setAddressFor(PlanqContractName.LockedPlanq, lockedPlanqInstance.address)
    await registry.setAddressFor(PlanqContractName.Validators, mockValidators.address)
    await registry.setAddressFor(PlanqContractName.StableToken, mockStableToken.address)
    await lockedPlanqInstance.initialize(registry.address, UNLOCKING_PERIOD)
    await planqTokenInstance.initialize(registry.address)
    await accountsInstance.initialize(registry.address)
    await accountsInstance.createAccount({ from: beneficiary })
  })

  describe('#initialize', () => {
    it('should indicate isFunded() if deployment is prefunded', async () => {
      await createNewReleasePlanqInstance(releasePlanqDefaultSchedule, web3, {
        prefund: true,
        startReleasing: false,
      })
      const isFunded = await releasePlanqInstance.isFunded()
      assert.isTrue(isFunded)
    })

    it('should not indicate isFunded() (and not revert) if deployment is not prefunded', async () => {
      await createNewReleasePlanqInstance(releasePlanqDefaultSchedule, web3, {
        prefund: false,
        startReleasing: false,
      })
      const isFunded = await releasePlanqInstance.isFunded()
      assert.isFalse(isFunded)
    })
  })

  describe('#payable', () => {
    it('should accept planq transfer by default from anyone', async () => {
      await createNewReleasePlanqInstance(releasePlanqDefaultSchedule, web3)
      await planqTokenInstance.transfer(releasePlanqInstance.address, ONE_PLANQTOKEN.times(2), {
        from: accounts[8],
      })
    })

    it('should not update isFunded() if schedule principle not fulfilled', async () => {
      await createNewReleasePlanqInstance(releasePlanqDefaultSchedule, web3, {
        prefund: false,
        startReleasing: false,
      })
      const insufficientPrinciple = releasePlanqDefaultSchedule.amountReleasedPerPeriod
        .multipliedBy(releasePlanqDefaultSchedule.numReleasePeriods)
        .minus(1)
      await planqTokenInstance.transfer(releasePlanqInstance.address, insufficientPrinciple, {
        from: owner,
      })
      const isFunded = await releasePlanqInstance.isFunded()
      assert.isFalse(isFunded)
    })

    it('should update isFunded() if schedule principle is fulfilled after deployment', async () => {
      await createNewReleasePlanqInstance(releasePlanqDefaultSchedule, web3, {
        prefund: false,
        startReleasing: false,
      })
      const sufficientPrinciple = releasePlanqDefaultSchedule.amountReleasedPerPeriod.multipliedBy(
        releasePlanqDefaultSchedule.numReleasePeriods
      )
      await planqTokenInstance.transfer(releasePlanqInstance.address, sufficientPrinciple, {
        from: owner,
      })
      const isFunded = await releasePlanqInstance.isFunded()
      assert.isTrue(isFunded)
    })

    it('should update isFunded() if schedule principle not fulfilled but has begun releasing', async () => {
      await createNewReleasePlanqInstance(releasePlanqDefaultSchedule, web3, {
        prefund: false,
        startReleasing: true,
      })
      const insufficientPrinciple = releasePlanqDefaultSchedule.amountReleasedPerPeriod
        .multipliedBy(releasePlanqDefaultSchedule.numReleasePeriods)
        .minus(1)
      await planqTokenInstance.transfer(releasePlanqInstance.address, insufficientPrinciple, {
        from: owner,
      })
      const isFunded = await releasePlanqInstance.isFunded()
      assert.isTrue(isFunded)
    })
  })

  describe('#transfer', () => {
    const receiver = accounts[5]
    const transferAmount = 10

    beforeEach(async () => {
      await createNewReleasePlanqInstance(releasePlanqDefaultSchedule, web3)
      await mockStableToken.mint(releasePlanqInstance.address, transferAmount)
    })

    it('should transfer stable token from the release planq instance', async () => {
      await releasePlanqInstance.transfer(receiver, transferAmount, { from: beneficiary })
      const contractBalance = await mockStableToken.balanceOf(releasePlanqInstance.address)
      const recipientBalance = await mockStableToken.balanceOf(receiver)
      assertEqualBN(contractBalance, 0)
      assertEqualBN(recipientBalance, transferAmount)
    })
  })

  describe('#genericTransfer', () => {
    const receiver = accounts[5]
    const transferAmount = 10

    beforeEach(async () => {
      await createNewReleasePlanqInstance(releasePlanqDefaultSchedule, web3)
      await mockStableToken.mint(releasePlanqInstance.address, transferAmount)
    })

    it('should transfer stable token from the release planq instance', async () => {
      const startBalanceFrom = await mockStableToken.balanceOf(releasePlanqInstance.address)
      const startBalanceTo = await mockStableToken.balanceOf(receiver)
      await releasePlanqInstance.genericTransfer(mockStableToken.address, receiver, transferAmount, {
        from: beneficiary,
      })
      const endBalanceFrom = await mockStableToken.balanceOf(releasePlanqInstance.address)
      const endBalanceTo = await mockStableToken.balanceOf(receiver)
      assertEqualBN(endBalanceFrom, startBalanceFrom.minus(transferAmount))
      assertEqualBN(endBalanceTo, startBalanceTo.plus(transferAmount))
    })

    it('should emit safeTransfer logs on erc20 revert', async () => {
      const startBalanceFrom = await mockStableToken.balanceOf(releasePlanqInstance.address)
      await assertTransactionRevertWithReason(
        releasePlanqInstance.genericTransfer(
          mockStableToken.address,
          receiver,
          startBalanceFrom.plus(1),
          {
            from: beneficiary,
          }
        ),
        'SafeERC20: ERC20 operation did not succeed'
      )
    })

    it('should revert when attempting transfer of planqtoken from the release planq instance', async () => {
      await assertTransactionRevertWithReason(
        releasePlanqInstance.genericTransfer(planqTokenInstance.address, receiver, transferAmount, {
          from: beneficiary,
        }),
        'Transfer must not target planq balance'
      )
    })
  })

  describe('#creation', () => {
    describe('when an instance is properly created', () => {
      beforeEach(async () => {
        await createNewReleasePlanqInstance(releasePlanqDefaultSchedule, web3)
      })

      it('should have associated funds with a schedule upon creation', async () => {
        const allocatedFunds = await planqTokenInstance.balanceOf(releasePlanqInstance.address)
        assertEqualBN(
          allocatedFunds,
          new BigNumber(releasePlanqDefaultSchedule.numReleasePeriods).multipliedBy(
            releasePlanqDefaultSchedule.amountReleasedPerPeriod
          )
        )
      })

      it('should set a beneficiary to releasePlanq instance', async () => {
        const releasePlanqBeneficiary = await releasePlanqInstance.beneficiary()
        assert.equal(releasePlanqBeneficiary, releasePlanqDefaultSchedule.beneficiary)
      })

      it('should set a releaseOwner to releasePlanq instance', async () => {
        const releasePlanqOwner = await releasePlanqInstance.releaseOwner()
        assert.equal(releasePlanqOwner, releasePlanqDefaultSchedule.releaseOwner)
      })

      it('should set releasePlanq number of periods to releasePlanq instance', async () => {
        const [, , releasePlanqNumPeriods, ,] = await releasePlanqInstance.releaseSchedule()
        assertEqualBN(releasePlanqNumPeriods, releasePlanqDefaultSchedule.numReleasePeriods)
      })

      it('should set releasePlanq amount per period to releasePlanq instance', async () => {
        const [, , , , releasedAmountPerPeriod] = await releasePlanqInstance.releaseSchedule()
        assertEqualBN(releasedAmountPerPeriod, releasePlanqDefaultSchedule.amountReleasedPerPeriod)
      })

      it('should set releasePlanq period to releasePlanq instance', async () => {
        const [, , , releasePlanqPeriodSec] = await releasePlanqInstance.releaseSchedule()
        assertEqualBN(releasePlanqPeriodSec, releasePlanqDefaultSchedule.releasePeriod)
      })

      it('should set releasePlanq start time to releasePlanq instance', async () => {
        const [releasePlanqStartTime, , , ,] = await releasePlanqInstance.releaseSchedule()
        assertEqualBN(releasePlanqStartTime, releasePlanqDefaultSchedule.releaseStartTime)
      })

      it('should set releasePlanq cliff to releasePlanq instance', async () => {
        const [, releasePlanqCliffStartTime, , ,] = await releasePlanqInstance.releaseSchedule()
        const releasePlanqCliffStartTimeComputed = new BigNumber(
          releasePlanqDefaultSchedule.releaseStartTime
        ).plus(releasePlanqDefaultSchedule.releaseCliffTime)
        assertEqualBN(releasePlanqCliffStartTime, releasePlanqCliffStartTimeComputed)
      })

      it('should set revocable flag to releasePlanq instance', async () => {
        const [releasePlanqRevocable, , ,] = await releasePlanqInstance.revocationInfo()
        assert.equal(releasePlanqRevocable, releasePlanqDefaultSchedule.revocable)
      })

      it('should set releaseOwner to releasePlanq instance', async () => {
        const releasePlanqOwner = await releasePlanqInstance.releaseOwner()
        assert.equal(releasePlanqOwner, releasePlanqDefaultSchedule.releaseOwner)
      })

      it('should set liquidity provision met to true', async () => {
        const liquidityProvisionMet = await releasePlanqInstance.liquidityProvisionMet()
        assert.equal(liquidityProvisionMet, true)
      })

      it('should have zero total withdrawn on init', async () => {
        const totalWithdrawn = await releasePlanqInstance.totalWithdrawn()
        assertEqualBN(totalWithdrawn, 0)
      })

      it('should be unrevoked on init and have revoke time equal zero', async () => {
        const isRevoked = await releasePlanqInstance.isRevoked()
        assert.equal(isRevoked, false)
        const [, , , revokeTime] = await releasePlanqInstance.revocationInfo()
        assertEqualBN(revokeTime, 0)
      })

      it('should have releasePlanqBalanceAtRevoke on init equal to zero', async () => {
        const [, , releasedBalanceAtRevoke] = await releasePlanqInstance.revocationInfo()
        assertEqualBN(releasedBalanceAtRevoke, 0)
      })

      it('should revert when releasePlanq beneficiary is the null address', async () => {
        const releasePlanqSchedule = _.clone(releasePlanqDefaultSchedule)
        releasePlanqSchedule.beneficiary = NULL_ADDRESS
        await assertTransactionRevertWithReason(
          createNewReleasePlanqInstance(releasePlanqSchedule, web3),
          'The release schedule beneficiary cannot be the zero addresss'
        )
      })

      it('should revert when releasePlanq periods are zero', async () => {
        const releasePlanqSchedule = _.clone(releasePlanqDefaultSchedule)
        releasePlanqSchedule.numReleasePeriods = 0
        await assertTransactionRevertWithReason(
          createNewReleasePlanqInstance(releasePlanqSchedule, web3),
          'There must be at least one releasing period'
        )
      })

      it('should revert when released amount per period is zero', async () => {
        const releasePlanqSchedule = _.clone(releasePlanqDefaultSchedule)
        releasePlanqSchedule.amountReleasedPerPeriod = new BigNumber('0')
        await assertTransactionRevertWithReason(
          createNewReleasePlanqInstance(releasePlanqSchedule, web3),
          'The released amount per period must be greater than zero'
        )
      })

      it('should overflow for very large combinations of release periods and amount per time', async () => {
        const releasePlanqSchedule = _.clone(releasePlanqDefaultSchedule)
        releasePlanqSchedule.numReleasePeriods = Number.MAX_SAFE_INTEGER
        releasePlanqSchedule.amountReleasedPerPeriod = new BigNumber(2).pow(300)
        await assertTransactionRevertWithReason(
          createNewReleasePlanqInstance(releasePlanqSchedule, web3),
          'value out-of-bounds'
        )
      })
    })
  })

  describe('#setBeneficiary', () => {
    beforeEach(async () => {
      await createNewReleasePlanqInstance(releasePlanqDefaultSchedule, web3)
    })

    it('should set a new beneficiary as the old beneficiary', async () => {
      await releasePlanqInstance.setBeneficiary(newBeneficiary, { from: owner })
      const actualBeneficiary = await releasePlanqInstance.beneficiary()
      assertSameAddress(actualBeneficiary, newBeneficiary)
    })

    it('should revert when setting a new beneficiary from the release owner', async () => {
      await assertTransactionRevertWithReason(
        releasePlanqInstance.setBeneficiary(newBeneficiary, { from: releaseOwner }),
        'Ownable: caller is not the owner'
      )
    })

    it('should emit the BeneficiarySet event', async () => {
      const setNewBeneficiaryTx = await releasePlanqInstance.setBeneficiary(newBeneficiary, {
        from: owner,
      })
      assertLogMatches(setNewBeneficiaryTx.logs[0], 'BeneficiarySet', {
        beneficiary: newBeneficiary,
      })
    })
  })

  describe('#createAccount', () => {
    beforeEach(async () => {
      await createNewReleasePlanqInstance(releasePlanqDefaultSchedule, web3)
    })

    describe('when unrevoked', () => {
      it('creates the account by beneficiary', async () => {
        let isAccount = await accountsInstance.isAccount(releasePlanqInstance.address)
        assert.isFalse(isAccount)
        await releasePlanqInstance.createAccount({ from: beneficiary })
        isAccount = await accountsInstance.isAccount(releasePlanqInstance.address)
        assert.isTrue(isAccount)
      })

      it('reverts if a non-beneficiary attempts account creation', async () => {
        const isAccount = await accountsInstance.isAccount(releasePlanqInstance.address)
        assert.isFalse(isAccount)
        await assertTransactionRevertWithReason(
          releasePlanqInstance.createAccount({ from: accounts[2] }),
          'Sender must be the beneficiary and state must not be revoked'
        )
      })
    })

    describe('when revoked', () => {
      beforeEach(async () => {
        await releasePlanqInstance.revoke({ from: releaseOwner })
      })

      it('reverts if anyone attempts account creation', async () => {
        const isAccount = await accountsInstance.isAccount(releasePlanqInstance.address)
        assert.isFalse(isAccount)
        await assertTransactionRevertWithReason(
          releasePlanqInstance.createAccount({ from: beneficiary }),
          'Sender must be the beneficiary and state must not be revoked'
        )
      })
    })
  })

  describe('#setAccount', () => {
    const accountName = 'name'
    const dataEncryptionKey: any =
      '0x02f2f48ee19680706196e2e339e5da3491186e0c4c5030670656b0e01611111111'

    beforeEach(async () => {
      await createNewReleasePlanqInstance(releasePlanqDefaultSchedule, web3)
      proofOfWalletOwnership = await getParsedSignatureOfAddress(
        web3,
        releasePlanqInstance.address,
        beneficiary
      )
    })

    describe('when unrevoked', () => {
      it('sets the account by beneficiary', async () => {
        let isAccount = await accountsInstance.isAccount(releasePlanqInstance.address)
        assert.isFalse(isAccount)
        await releasePlanqInstance.setAccount(
          accountName,
          dataEncryptionKey,
          walletAddress,
          proofOfWalletOwnership.v,
          proofOfWalletOwnership.r,
          proofOfWalletOwnership.s,
          {
            from: beneficiary,
          }
        )
        isAccount = await accountsInstance.isAccount(releasePlanqInstance.address)
        assert.isTrue(isAccount)
      })

      it('reverts if a non-beneficiary attempts to set the account', async () => {
        const isAccount = await accountsInstance.isAccount(releasePlanqInstance.address)
        assert.isFalse(isAccount)
        await assertTransactionRevertWithReason(
          releasePlanqInstance.setAccount(
            accountName,
            dataEncryptionKey,
            walletAddress,
            proofOfWalletOwnership.v,
            proofOfWalletOwnership.r,
            proofOfWalletOwnership.s,
            {
              from: accounts[2],
            }
          ),
          'Sender must be the beneficiary and state must not be revoked'
        )
      })

      it('should set the name, dataEncryptionKey and walletAddress of the account by beneficiary', async () => {
        let isAccount = await accountsInstance.isAccount(releasePlanqInstance.address)
        assert.isFalse(isAccount)
        await releasePlanqInstance.setAccount(
          accountName,
          dataEncryptionKey,
          walletAddress,
          proofOfWalletOwnership.v,
          proofOfWalletOwnership.r,
          proofOfWalletOwnership.s,
          {
            from: beneficiary,
          }
        )
        isAccount = await accountsInstance.isAccount(releasePlanqInstance.address)
        assert.isTrue(isAccount)
        const expectedWalletAddress = await accountsInstance.getWalletAddress(
          releasePlanqInstance.address
        )
        assert.equal(expectedWalletAddress, walletAddress)
        // @ts-ignore
        const expectedKey: string = await accountsInstance.getDataEncryptionKey(
          releasePlanqInstance.address
        )
        assert.equal(expectedKey, dataEncryptionKey)
        const expectedName = await accountsInstance.getName(releasePlanqInstance.address)
        assert.equal(expectedName, accountName)
      })

      it('should revert to set the name, dataEncryptionKey and walletAddress of the account by a non-beneficiary', async () => {
        const isAccount = await accountsInstance.isAccount(releasePlanqInstance.address)
        assert.isFalse(isAccount)
        await assertTransactionRevertWithReason(
          releasePlanqInstance.setAccount(
            accountName,
            dataEncryptionKey,
            walletAddress,
            proofOfWalletOwnership.v,
            proofOfWalletOwnership.r,
            proofOfWalletOwnership.s,
            {
              from: releaseOwner,
            }
          ),
          'Sender must be the beneficiary and state must not be revoked'
        )
      })
    })

    describe('when revoked', () => {
      beforeEach(async () => {
        await releasePlanqInstance.revoke({ from: releaseOwner })
      })

      it('reverts if anyone attempts to set the account', async () => {
        const isAccount = await accountsInstance.isAccount(releasePlanqInstance.address)
        assert.isFalse(isAccount)
        await assertTransactionRevertWithReason(
          releasePlanqInstance.setAccount(
            accountName,
            dataEncryptionKey,
            walletAddress,
            proofOfWalletOwnership.v,
            proofOfWalletOwnership.r,
            proofOfWalletOwnership.s,
            {
              from: releaseOwner,
            }
          ),
          'Sender must be the beneficiary and state must not be revoked'
        )
      })

      it('should revert to set the name, dataEncryptionKey and walletAddress of the account', async () => {
        const isAccount = await accountsInstance.isAccount(releasePlanqInstance.address)
        assert.isFalse(isAccount)
        await assertTransactionRevertWithReason(
          releasePlanqInstance.setAccount(
            accountName,
            dataEncryptionKey,
            walletAddress,
            proofOfWalletOwnership.v,
            proofOfWalletOwnership.r,
            proofOfWalletOwnership.s,
            {
              from: releaseOwner,
            }
          ),
          'Sender must be the beneficiary and state must not be revoked'
        )
      })
    })
  })

  describe('#setAccountName', () => {
    const accountName = 'name'

    beforeEach(async () => {
      await createNewReleasePlanqInstance(releasePlanqDefaultSchedule, web3)
    })

    describe('when the account has not been created', () => {
      it('should revert', async () => {
        await assertTransactionRevertWithReason(
          releasePlanqInstance.setAccountName(accountName, { from: beneficiary }),
          'Register with createAccount to set account name'
        )
      })
    })

    describe('when the account has been created', () => {
      beforeEach(async () => {
        await releasePlanqInstance.createAccount({ from: beneficiary })
      })

      describe('when unrevoked', () => {
        it('beneficiary should set the name', async () => {
          await releasePlanqInstance.setAccountName(accountName, { from: beneficiary })
          const result = await accountsInstance.getName(releasePlanqInstance.address)
          assert.equal(result, accountName)
        })

        it('should revert if non-beneficiary attempts to set the name', async () => {
          await assertTransactionRevertWithReason(
            releasePlanqInstance.setAccountName(accountName, { from: accounts[2] }),
            'Sender must be the beneficiary and state must not be revoked'
          )
        })
      })

      describe('when revoked', () => {
        beforeEach(async () => {
          await releasePlanqInstance.revoke({ from: releaseOwner })
        })

        it('should revert if anyone attempts to set the name', async () => {
          await assertTransactionRevertWithReason(
            releasePlanqInstance.setAccountName(accountName, { from: releaseOwner }),
            'Sender must be the beneficiary and state must not be revoked'
          )
        })
      })
    })
  })

  describe('#setAccountWalletAddress', () => {
    beforeEach(async () => {
      await createNewReleasePlanqInstance(releasePlanqDefaultSchedule, web3)
      proofOfWalletOwnership = await getParsedSignatureOfAddress(
        web3,
        releasePlanqInstance.address,
        beneficiary
      )
    })

    describe('when the releasePlanq account has not been created', () => {
      it('should revert', async () => {
        await assertTransactionRevertWithReason(
          releasePlanqInstance.setAccountWalletAddress(
            walletAddress,
            proofOfWalletOwnership.v,
            proofOfWalletOwnership.r,
            proofOfWalletOwnership.s,
            { from: beneficiary }
          ),
          'Unknown account'
        )
      })
    })

    describe('when the account has been created', () => {
      beforeEach(async () => {
        await releasePlanqInstance.createAccount({ from: beneficiary })
      })

      describe('when unrevoked', () => {
        it('beneficiary should set the walletAddress', async () => {
          await releasePlanqInstance.setAccountWalletAddress(
            walletAddress,
            proofOfWalletOwnership.v,
            proofOfWalletOwnership.r,
            proofOfWalletOwnership.s,
            { from: beneficiary }
          )
          const result = await accountsInstance.getWalletAddress(releasePlanqInstance.address)
          assert.equal(result, walletAddress)
        })

        it('should revert if non-beneficiary attempts to set the walletAddress', async () => {
          await assertTransactionRevertWithReason(
            releasePlanqInstance.setAccountWalletAddress(
              walletAddress,
              proofOfWalletOwnership.v,
              proofOfWalletOwnership.r,
              proofOfWalletOwnership.s,
              { from: accounts[2] }
            ),
            'Sender must be the beneficiary and state must not be revoked'
          )
        })

        it('beneficiary should set the NULL_ADDRESS', async () => {
          await releasePlanqInstance.setAccountWalletAddress(NULL_ADDRESS, '0x0', '0x0', '0x0', {
            from: beneficiary,
          })
          const result = await accountsInstance.getWalletAddress(releasePlanqInstance.address)
          assert.equal(result, NULL_ADDRESS)
        })
      })

      describe('when revoked', () => {
        beforeEach(async () => {
          await releasePlanqInstance.revoke({ from: releaseOwner })
        })

        it('should revert if anyone attempts to set the walletAddress', async () => {
          await assertTransactionRevertWithReason(
            releasePlanqInstance.setAccountWalletAddress(
              walletAddress,
              proofOfWalletOwnership.v,
              proofOfWalletOwnership.r,
              proofOfWalletOwnership.s,
              { from: releaseOwner }
            ),
            'Sender must be the beneficiary and state must not be revoked'
          )
        })
      })
    })
  })

  describe('#setAccountMetadataURL', () => {
    const metadataURL = 'meta'

    beforeEach(async () => {
      await createNewReleasePlanqInstance(releasePlanqDefaultSchedule, web3)
    })

    describe('when the account has not been created', () => {
      it('should revert', async () => {
        await assertTransactionRevertWithReason(
          releasePlanqInstance.setAccountMetadataURL(metadataURL, { from: beneficiary }),
          'Unknown account'
        )
      })
    })

    describe('when the account has been created', () => {
      beforeEach(async () => {
        await releasePlanqInstance.createAccount({ from: beneficiary })
      })

      describe('when unrevoked', () => {
        it('only beneficiary should set the metadataURL', async () => {
          await releasePlanqInstance.setAccountMetadataURL(metadataURL, { from: beneficiary })
          const result = await accountsInstance.getMetadataURL(releasePlanqInstance.address)
          assert.equal(result, metadataURL)
        })

        it('should revert if non-beneficiary attempts to set the metadataURL', async () => {
          await assertTransactionRevertWithReason(
            releasePlanqInstance.setAccountMetadataURL(metadataURL, { from: accounts[2] }),
            'Sender must be the beneficiary and state must not be revoked'
          )
        })
      })

      describe('when revoked', () => {
        beforeEach(async () => {
          await releasePlanqInstance.revoke({ from: releaseOwner })
        })

        it('should revert if anyone attempts to set the metadataURL', async () => {
          await assertTransactionRevertWithReason(
            releasePlanqInstance.setAccountMetadataURL(metadataURL, { from: releaseOwner }),
            'Sender must be the beneficiary and state must not be revoked'
          )
        })
      })
    })
  })

  describe('#setAccountDataEncryptionKey', () => {
    const dataEncryptionKey: any =
      '0x02f2f48ee19680706196e2e339e5da3491186e0c4c5030670656b0e01611111111'
    const longDataEncryptionKey: any =
      '0x04f2f48ee19680706196e2e339e5da3491186e0c4c5030670656b0e01611111111' +
      '02f2f48ee19680706196e2e339e5da3491186e0c4c5030670656b0e01611111111'

    beforeEach(async () => {
      await createNewReleasePlanqInstance(releasePlanqDefaultSchedule, web3)
      await releasePlanqInstance.createAccount({ from: beneficiary })
    })

    it('beneficiary should set dataEncryptionKey', async () => {
      await releasePlanqInstance.setAccountDataEncryptionKey(dataEncryptionKey, {
        from: beneficiary,
      })
      // @ts-ignore
      const fetchedKey: string = await accountsInstance.getDataEncryptionKey(
        releasePlanqInstance.address
      )
      assert.equal(fetchedKey, dataEncryptionKey)
    })

    it('should revert if non-beneficiary attempts to set dataEncryptionKey', async () => {
      await assertTransactionRevertWithReason(
        releasePlanqInstance.setAccountDataEncryptionKey(dataEncryptionKey, { from: accounts[2] }),
        'Sender must be the beneficiary and state must not be revoked'
      )
    })

    it('should allow setting a key with leading zeros', async () => {
      const keyWithZeros: any =
        '0x00000000000000000000000000000000000000000000000f2f48ee19680706191111'
      await releasePlanqInstance.setAccountDataEncryptionKey(keyWithZeros, { from: beneficiary })
      // @ts-ignore
      const fetchedKey: string = await accountsInstance.getDataEncryptionKey(
        releasePlanqInstance.address
      )
      assert.equal(fetchedKey, keyWithZeros)
    })

    it('should revert when the key is invalid', async () => {
      const invalidKey: any = '0x32132931293'
      await assertTransactionRevertWithReason(
        releasePlanqInstance.setAccountDataEncryptionKey(invalidKey, { from: beneficiary }),
        'data encryption key length <= 32'
      )
    })

    it('should allow a key that is longer than 33 bytes', async () => {
      await releasePlanqInstance.setAccountDataEncryptionKey(longDataEncryptionKey, {
        from: beneficiary,
      })
      // @ts-ignore
      const fetchedKey: string = await accountsInstance.getDataEncryptionKey(
        releasePlanqInstance.address
      )
      assert.equal(fetchedKey, longDataEncryptionKey)
    })
  })

  describe('#setMaxDistribution', () => {
    beforeEach(async () => {
      const releasePlanqSchedule = _.clone(releasePlanqDefaultSchedule)
      releasePlanqSchedule.initialDistributionRatio = 0
      await createNewReleasePlanqInstance(releasePlanqSchedule, web3)
    })

    describe('when the max distribution is set to 50%', () => {
      beforeEach(async () => {
        await releasePlanqInstance.setMaxDistribution(500, { from: releaseOwner })
      })

      it('should set max distribution to 5 planq', async () => {
        const maxDistribution = await releasePlanqInstance.maxDistribution()
        assertEqualBN(maxDistribution, TOTAL_AMOUNT.div(2))
      })
    })

    describe('when the max distribution is set to 100%', () => {
      beforeEach(async () => {
        await releasePlanqInstance.setMaxDistribution(1000, { from: releaseOwner })
      })

      it('should set max distribution to max uint256', async () => {
        const maxDistribution = await releasePlanqInstance.maxDistribution()
        assertGteBN(maxDistribution, TOTAL_AMOUNT)
      })

      it('cannot be lowered again', async () => {
        await assertTransactionRevertWithReason(
          releasePlanqInstance.setMaxDistribution(500, { from: releaseOwner }),
          'Cannot set max distribution lower if already set to 1000'
        )
      })
    })
  })

  describe('authorization tests:', () => {
    Object.keys(authorizationTestDescriptions).forEach((key) => {
      let authorizationTest: any
      const authorized = accounts[4] // the account that is to be authorized for whatever role
      let sig: any

      describe(`#authorize${_.upperFirst(authorizationTestDescriptions[key].subject)}()`, () => {
        beforeEach(async () => {
          const releasePlanqSchedule = _.clone(releasePlanqDefaultSchedule)
          releasePlanqSchedule.revocable = false
          releasePlanqSchedule.refundAddress = '0x0000000000000000000000000000000000000000'
          releasePlanqSchedule.canValidate = true
          await createNewReleasePlanqInstance(releasePlanqSchedule, web3)
          await releasePlanqInstance.createAccount({ from: beneficiary })

          authorizationTests.voting = {
            fn: releasePlanqInstance.authorizeVoteSigner,
            eventName: 'VoteSignerAuthorized',
            getAuthorizedFromAccount: accountsInstance.getVoteSigner,
            authorizedSignerToAccount: accountsInstance.voteSignerToAccount,
          }
          authorizationTests.validating = {
            fn: releasePlanqInstance.authorizeValidatorSigner,
            eventName: 'ValidatorSignerAuthorized',
            getAuthorizedFromAccount: accountsInstance.getValidatorSigner,
            authorizedSignerToAccount: accountsInstance.validatorSignerToAccount,
          }
          authorizationTests.attestation = {
            fn: releasePlanqInstance.authorizeAttestationSigner,
            eventName: 'AttestationSignerAuthorized',
            getAuthorizedFromAccount: accountsInstance.getAttestationSigner,
            authorizedSignerToAccount: accountsInstance.attestationSignerToAccount,
          }
          authorizationTest = authorizationTests[key]
          sig = await getParsedSignatureOfAddress(web3, releasePlanqInstance.address, authorized)
        })

        it(`should set the authorized ${authorizationTestDescriptions[key].me}`, async () => {
          await authorizationTest.fn(authorized, sig.v, sig.r, sig.s, { from: beneficiary })
          assert.equal(await accountsInstance.authorizedBy(authorized), releasePlanqInstance.address)
          assert.equal(
            await authorizationTest.getAuthorizedFromAccount(releasePlanqInstance.address),
            authorized
          )
          assert.equal(
            await authorizationTest.authorizedSignerToAccount(authorized),
            releasePlanqInstance.address
          )
        })

        // The attestations signer does not send txs.
        if (authorizationTestDescriptions[key].subject !== 'attestationSigner') {
          it(`should transfer 1 PLQ to the ${authorizationTestDescriptions[key].me}`, async () => {
            const balance1 = await web3.eth.getBalance(authorized)
            await authorizationTest.fn(authorized, sig.v, sig.r, sig.s, { from: beneficiary })
            const balance2 = await web3.eth.getBalance(authorized)
            assertEqualBN(new BigNumber(balance2).minus(balance1), web3.utils.toWei('1'))
          })
        } else {
          it(`should not transfer 1 PLQ to the ${authorizationTestDescriptions[key].me}`, async () => {
            const balance1 = await web3.eth.getBalance(authorized)
            await authorizationTest.fn(authorized, sig.v, sig.r, sig.s, { from: beneficiary })
            const balance2 = await web3.eth.getBalance(authorized)
            assertEqualBN(new BigNumber(balance2).minus(balance1), 0)
          })
        }

        it(`should revert if the ${authorizationTestDescriptions[key].me} is an account`, async () => {
          await accountsInstance.createAccount({ from: authorized })
          await assertTransactionRevertWithReason(
            authorizationTest.fn(authorized, sig.v, sig.r, sig.s, { from: beneficiary }),
            'Cannot re-authorize address or locked planq account for another account'
          )
        })

        it(`should revert if the ${authorizationTestDescriptions[key].me} is already authorized`, async () => {
          const otherAccount = accounts[5]
          const otherSig = await getParsedSignatureOfAddress(
            web3,
            releasePlanqInstance.address,
            otherAccount
          )
          await accountsInstance.createAccount({ from: otherAccount })
          await assertTransactionRevertWithReason(
            authorizationTest.fn(otherAccount, otherSig.v, otherSig.r, otherSig.s, {
              from: beneficiary,
            }),
            'Cannot re-authorize address or locked planq account for another account'
          )
        })

        it('should revert if the signature is incorrect', async () => {
          const nonVoter = accounts[5]
          const incorrectSig = await getParsedSignatureOfAddress(
            web3,
            releasePlanqInstance.address,
            nonVoter
          )
          await assertTransactionRevertWithReason(
            authorizationTest.fn(authorized, incorrectSig.v, incorrectSig.r, incorrectSig.s, {
              from: beneficiary,
            }),
            'Invalid signature'
          )
        })

        describe('when a previous authorization has been made', () => {
          const newAuthorized = accounts[6]
          let balance1: string
          let newSig: any
          beforeEach(async () => {
            await authorizationTest.fn(authorized, sig.v, sig.r, sig.s, { from: beneficiary })
            newSig = await getParsedSignatureOfAddress(
              web3,
              releasePlanqInstance.address,
              newAuthorized
            )
            balance1 = await web3.eth.getBalance(newAuthorized)
            await authorizationTest.fn(newAuthorized, newSig.v, newSig.r, newSig.s, {
              from: beneficiary,
            })
          })

          it(`should set the new authorized ${authorizationTestDescriptions[key].me}`, async () => {
            assert.equal(
              await accountsInstance.authorizedBy(newAuthorized),
              releasePlanqInstance.address
            )
            assert.equal(
              await authorizationTest.getAuthorizedFromAccount(releasePlanqInstance.address),
              newAuthorized
            )
            assert.equal(
              await authorizationTest.authorizedSignerToAccount(newAuthorized),
              releasePlanqInstance.address
            )
          })

          it(`should not transfer 1 PLQ to the ${authorizationTestDescriptions[key].me}`, async () => {
            const balance2 = await web3.eth.getBalance(newAuthorized)
            assertEqualBN(new BigNumber(balance2).minus(balance1), 0)
          })

          it('should preserve the previous authorization', async () => {
            assert.equal(
              await accountsInstance.authorizedBy(authorized),
              releasePlanqInstance.address
            )
          })
        })
      })
    })
  })

  describe('#authorizeWithPublicKeys', () => {
    const authorized = accounts[4] // the account that is to be authorized for whatever role

    describe('with ECDSA public key', () => {
      beforeEach(async () => {
        const releasePlanqSchedule = _.clone(releasePlanqDefaultSchedule)
        releasePlanqSchedule.revocable = false
        releasePlanqSchedule.canValidate = true
        releasePlanqSchedule.refundAddress = NULL_ADDRESS
        await createNewReleasePlanqInstance(releasePlanqSchedule, web3)
        await releasePlanqInstance.createAccount({ from: beneficiary })
        const ecdsaPublicKey = await addressToPublicKey(authorized, web3.eth.sign)
        const sig = await getParsedSignatureOfAddress(web3, releasePlanqInstance.address, authorized)
        await releasePlanqInstance.authorizeValidatorSignerWithPublicKey(
          authorized,
          sig.v,
          sig.r,
          sig.s,
          ecdsaPublicKey as any,
          { from: beneficiary }
        )
      })

      it('should set the authorized keys', async () => {
        assert.equal(await accountsInstance.authorizedBy(authorized), releasePlanqInstance.address)
        assert.equal(
          await accountsInstance.getValidatorSigner(releasePlanqInstance.address),
          authorized
        )
        assert.equal(
          await accountsInstance.validatorSignerToAccount(authorized),
          releasePlanqInstance.address
        )
      })
    })

    describe('with bls keys', () => {
      beforeEach(async () => {
        const releasePlanqSchedule = _.clone(releasePlanqDefaultSchedule)
        releasePlanqSchedule.revocable = false
        releasePlanqSchedule.canValidate = true
        releasePlanqSchedule.refundAddress = NULL_ADDRESS
        await createNewReleasePlanqInstance(releasePlanqSchedule, web3)
        await releasePlanqInstance.createAccount({ from: beneficiary })
        const ecdsaPublicKey = await addressToPublicKey(authorized, web3.eth.sign)
        const newBlsPublicKey = web3.utils.randomHex(96)
        const newBlsPoP = web3.utils.randomHex(48)

        const sig = await getParsedSignatureOfAddress(web3, releasePlanqInstance.address, authorized)
        await releasePlanqInstance.authorizeValidatorSignerWithKeys(
          authorized,
          sig.v,
          sig.r,
          sig.s,
          ecdsaPublicKey as any,
          newBlsPublicKey,
          newBlsPoP,
          { from: beneficiary }
        )
      })

      it('should set the authorized keys', async () => {
        assert.equal(await accountsInstance.authorizedBy(authorized), releasePlanqInstance.address)
        assert.equal(
          await accountsInstance.getValidatorSigner(releasePlanqInstance.address),
          authorized
        )
        assert.equal(
          await accountsInstance.validatorSignerToAccount(authorized),
          releasePlanqInstance.address
        )
      })
    })
  })

  describe('#revoke', () => {
    it('releaseOwner should be able to revoke the releasePlanq', async () => {
      await createNewReleasePlanqInstance(releasePlanqDefaultSchedule, web3)
      const releaseOwnereleasePlanqTx = await releasePlanqInstance.revoke({ from: releaseOwner })
      const revokeBlockTimestamp = await getCurrentBlockchainTimestamp(web3)
      const [, , , releasePlanqRevokeTime] = await releasePlanqInstance.revocationInfo()
      assertEqualBN(revokeBlockTimestamp, releasePlanqRevokeTime)
      assert.isTrue(await releasePlanqInstance.isRevoked())
      assertLogMatches(releaseOwnereleasePlanqTx.logs[0], 'ReleaseScheduleRevoked', {
        revokeTimestamp: revokeBlockTimestamp,
        releasedBalanceAtRevoke: await releasePlanqInstance.getCurrentReleasedTotalAmount(),
      })
    })

    it('should revert when non-releaseOwner attempts to revoke the releasePlanq', async () => {
      await createNewReleasePlanqInstance(releasePlanqDefaultSchedule, web3)
      await assertTransactionRevertWithReason(
        releasePlanqInstance.revoke({ from: accounts[5] }),
        'Sender must be the registered releaseOwner address'
      )
    })

    it('should revert if releasePlanq is already revoked', async () => {
      await createNewReleasePlanqInstance(releasePlanqDefaultSchedule, web3)
      await releasePlanqInstance.revoke({ from: releaseOwner })
      await assertTransactionRevertWithReason(
        releasePlanqInstance.revoke({ from: releaseOwner }),
        'Release schedule instance must not already be revoked'
      )
    })

    it('should revert if releasePlanq is non-revocable', async () => {
      const releasePlanqSchedule = _.clone(releasePlanqDefaultSchedule)
      releasePlanqSchedule.revocable = false
      releasePlanqSchedule.refundAddress = '0x0000000000000000000000000000000000000000'
      await createNewReleasePlanqInstance(releasePlanqSchedule, web3)
      await assertTransactionRevertWithReason(
        releasePlanqInstance.revoke({ from: releaseOwner }),
        'Release schedule instance must be revocable'
      )
    })
  })

  describe('#expire', () => {
    describe('when the contract is expirable', () => {
      beforeEach(async () => {
        await createNewReleasePlanqInstance(releasePlanqDefaultSchedule, web3)
      })

      describe('when called before expiration time has passed', () => {
        it('should revert', async () => {
          await assertTransactionRevertWithReason(
            releasePlanqInstance.expire({ from: releaseOwner }),
            '`EXPIRATION_TIME` must have passed after the end of releasing'
          )
        })
      })

      describe('when the contract has finished releasing', () => {
        beforeEach(async () => {
          const [, , numReleasePeriods, releasePeriod] = await releasePlanqInstance.releaseSchedule()
          const grantTime = numReleasePeriods
            .times(releasePeriod)
            .plus(5 * MINUTE)
            .toNumber()
          await timeTravel(grantTime, web3)
        })

        it('should revert before `EXPIRATION_TIME` after release schedule end', async () => {
          await assertTransactionRevertWithReason(
            releasePlanqInstance.expire({ from: releaseOwner }),
            '`EXPIRATION_TIME` must have passed after the end of releasing'
          )
        })

        describe('when `EXPIRATION_TIME` has passed after release schedule completion', () => {
          beforeEach(async () => {
            const expirationTime = await releasePlanqInstance.EXPIRATION_TIME()
            const timeToTravel = expirationTime.toNumber()
            await timeTravel(timeToTravel, web3)
          })
          describe('when not called by releaseOwner', () => {
            it('should revert', async () => {
              await assertTransactionRevertWithReason(
                releasePlanqInstance.expire(),
                'Sender must be the registered releaseOwner address'
              )
            })
          })

          describe('when called by releaseOwner', () => {
            it('should succeed', async () => {
              await releasePlanqInstance.expire({ from: releaseOwner })
            })
          })

          describe('when an instance is expired', () => {
            describe('when the beneficiary has not withdrawn any balance yet', () => {
              beforeEach(async () => {
                await releasePlanqInstance.expire({ from: releaseOwner })
              })

              it('should revoke the contract', async () => {
                const isRevoked = await releasePlanqInstance.isRevoked()
                assert.equal(isRevoked, true)
              })

              it('should set the released balance at revocation to total withdrawn', async () => {
                const [, , releasedBalanceAtRevoke] = await releasePlanqInstance.revocationInfo()
                // 0 planq withdrawn at this point
                assertEqualBN(releasedBalanceAtRevoke, 0)
              })

              it('should allow refund of all remaining planq', async () => {
                const refundAddressBalanceBefore = await planqTokenInstance.balanceOf(refundAddress)
                await releasePlanqInstance.refundAndFinalize({ from: releaseOwner })
                const refundAddressBalanceAfter = await planqTokenInstance.balanceOf(refundAddress)
                assertEqualBN(
                  refundAddressBalanceAfter.minus(refundAddressBalanceBefore),
                  TOTAL_AMOUNT
                )
              })
            })

            describe('when the beneficiary has withdrawn some balance', () => {
              beforeEach(async () => {
                await releasePlanqInstance.withdraw(TOTAL_AMOUNT.div(2), { from: beneficiary })
                await releasePlanqInstance.expire({ from: releaseOwner })
              })

              it('should revoke the contract', async () => {
                const isRevoked = await releasePlanqInstance.isRevoked()
                assert.equal(isRevoked, true)
              })

              it('should set the released balance at revocation to total withdrawn', async () => {
                const [, , releasedBalanceAtRevoke] = await releasePlanqInstance.revocationInfo()
                // half of planq withdrawn at this point
                assertEqualBN(releasedBalanceAtRevoke, TOTAL_AMOUNT.div(2))
              })

              it('should allow refund of all remaining planq', async () => {
                const refundAddressBalanceBefore = await planqTokenInstance.balanceOf(refundAddress)
                await releasePlanqInstance.refundAndFinalize({ from: releaseOwner })
                const refundAddressBalanceAfter = await planqTokenInstance.balanceOf(refundAddress)
                assertEqualBN(
                  refundAddressBalanceAfter.minus(refundAddressBalanceBefore),
                  TOTAL_AMOUNT.div(2)
                )
              })
            })
          })
        })
      })
    })

    describe('when the contract is not expirable', () => {
      beforeEach(async () => {
        await createNewReleasePlanqInstance(releasePlanqDefaultSchedule, web3)
        await releasePlanqInstance.setCanExpire(false, { from: beneficiary })
        const [, , numReleasePeriods, releasePeriod] = await releasePlanqInstance.releaseSchedule()
        const expirationTime = await releasePlanqInstance.EXPIRATION_TIME()
        const grantTime = numReleasePeriods.times(releasePeriod).plus(5 * MINUTE)
        const timeToTravel = grantTime.plus(expirationTime).toNumber()
        await timeTravel(timeToTravel, web3)
      })

      describe('when `expire` is called', () => {
        it('should revert', async () => {
          await assertTransactionRevertWithReason(
            releasePlanqInstance.expire({ from: releaseOwner }),
            'Contract must be expirable'
          )
        })
      })
    })
  })

  describe('#refundAndFinalize', () => {
    beforeEach(async () => {
      await createNewReleasePlanqInstance(releasePlanqDefaultSchedule, web3)
      // wait some time for some planq to release
      const timeToTravel = 7 * MONTH
      await timeTravel(timeToTravel, web3)
    })

    it('should only be callable by releaseOwner and when revoked', async () => {
      await releasePlanqInstance.revoke({ from: releaseOwner })
      await releasePlanqInstance.refundAndFinalize({ from: releaseOwner })
    })

    it('should revert when revoked but called by a non-releaseOwner', async () => {
      await releasePlanqInstance.revoke({ from: releaseOwner })
      await assertTransactionRevertWithReason(
        releasePlanqInstance.refundAndFinalize({ from: accounts[5] }),
        'Sender must be the releaseOwner and state must be revoked'
      )
    })

    it('should revert when non-revoked but called by a releaseOwner', async () => {
      await assertTransactionRevertWithReason(
        releasePlanqInstance.refundAndFinalize({ from: releaseOwner }),
        'Sender must be the releaseOwner and state must be revoked'
      )
    })

    describe('when revoked()', () => {
      beforeEach(async () => {
        await releasePlanqInstance.revoke({ from: releaseOwner })
      })

      it('should transfer planq proportions to both beneficiary and refundAddress when no planq locked', async () => {
        const beneficiaryBalanceBefore = await planqTokenInstance.balanceOf(beneficiary)
        const refundAddressBalanceBefore = await planqTokenInstance.balanceOf(refundAddress)
        const [, , releasedBalanceAtRevoke] = await releasePlanqInstance.revocationInfo()
        const beneficiaryRefundAmount = new BigNumber(releasedBalanceAtRevoke).minus(
          await releasePlanqInstance.totalWithdrawn()
        )
        const refundAddressRefundAmount = new BigNumber(
          await planqTokenInstance.balanceOf(releasePlanqInstance.address)
        ).minus(beneficiaryRefundAmount)
        await releasePlanqInstance.refundAndFinalize({ from: releaseOwner })
        const contractBalanceAfterFinalize = await planqTokenInstance.balanceOf(
          releasePlanqInstance.address
        )
        const beneficiaryBalanceAfter = await planqTokenInstance.balanceOf(beneficiary)
        const refundAddressBalanceAfter = await planqTokenInstance.balanceOf(refundAddress)

        assertEqualBN(
          new BigNumber(beneficiaryBalanceAfter).minus(new BigNumber(beneficiaryBalanceBefore)),
          beneficiaryRefundAmount
        )
        assertEqualBN(
          new BigNumber(refundAddressBalanceAfter).minus(new BigNumber(refundAddressBalanceBefore)),
          refundAddressRefundAmount
        )

        assertEqualBN(contractBalanceAfterFinalize, 0)
      })

      it('should destruct releasePlanq instance after finalizing and prevent calling further actions', async () => {
        await releasePlanqInstance.refundAndFinalize({ from: releaseOwner })
        try {
          await releasePlanqInstance.getRemainingUnlockedBalance()
        } catch (ex) {
          return assert.isTrue(true)
        }

        return assert.isTrue(false)
      })
    })
  })

  describe('#lockPlanq', () => {
    let lockAmount = null

    beforeEach(async () => {
      await createNewReleasePlanqInstance(releasePlanqDefaultSchedule, web3)
      lockAmount = releasePlanqDefaultSchedule.amountReleasedPerPeriod.multipliedBy(
        releasePlanqDefaultSchedule.numReleasePeriods
      )
    })

    it('beneficiary should lock up any unlocked amount', async () => {
      // beneficiary shall make the released planq instance an account
      await releasePlanqInstance.createAccount({ from: beneficiary })
      await releasePlanqInstance.lockPlanq(lockAmount, {
        from: beneficiary,
      })
      assertEqualBN(
        await lockedPlanqInstance.getAccountTotalLockedPlanq(releasePlanqInstance.address),
        lockAmount
      )
      assertEqualBN(
        await lockedPlanqInstance.getAccountNonvotingLockedPlanq(releasePlanqInstance.address),
        lockAmount
      )
      assertEqualBN(await lockedPlanqInstance.getNonvotingLockedPlanq(), lockAmount)
      assertEqualBN(await lockedPlanqInstance.getTotalLockedPlanq(), lockAmount)
    })

    it('should revert if releasePlanq instance is not an account', async () => {
      await assertTransactionRevertWithReason(
        releasePlanqInstance.lockPlanq(lockAmount, {
          from: beneficiary,
        }),
        'Must first register address with Account.createAccount'
      )
    })

    it('should revert if beneficiary tries to lock up more than there is remaining in the contract', async () => {
      await releasePlanqInstance.createAccount({ from: beneficiary })
      await assertTransactionRevertWithoutReason(
        releasePlanqInstance.lockPlanq(lockAmount.multipliedBy(1.1), {
          from: beneficiary,
        })
      )
    })

    it('should revert if non-beneficiary tries to lock up any unlocked amount', async () => {
      await releasePlanqInstance.createAccount({ from: beneficiary })
      await assertTransactionRevertWithReason(
        releasePlanqInstance.lockPlanq(lockAmount, { from: accounts[6] }),
        'Sender must be the beneficiary and state must not be revoked'
      )
    })
  })

  describe('#unlockPlanq', () => {
    let lockAmount: any

    beforeEach(async () => {
      await createNewReleasePlanqInstance(releasePlanqDefaultSchedule, web3)
      // beneficiary shall make the released planq instance an account
      await releasePlanqInstance.createAccount({ from: beneficiary })
      lockAmount = releasePlanqDefaultSchedule.amountReleasedPerPeriod.multipliedBy(
        releasePlanqDefaultSchedule.numReleasePeriods
      )
    })

    it('beneficiary should unlock his locked planq and add a pending withdrawal', async () => {
      await releasePlanqInstance.lockPlanq(lockAmount, {
        from: beneficiary,
      })
      await releasePlanqInstance.unlockPlanq(lockAmount, {
        from: beneficiary,
      })

      const [values, timestamps] = await lockedPlanqInstance.getPendingWithdrawals(
        releasePlanqInstance.address
      )
      assert.equal(values.length, 1)
      assert.equal(timestamps.length, 1)
      assertEqualBN(values[0], lockAmount)
      assertEqualBN(timestamps[0], (await getCurrentBlockchainTimestamp(web3)) + UNLOCKING_PERIOD)

      assertEqualBN(
        await lockedPlanqInstance.getAccountTotalLockedPlanq(releasePlanqInstance.address),
        0
      )
      // ReleasePlanq locked balance should still reflect pending withdrawals
      assertEqualBN(await releasePlanqInstance.getRemainingLockedBalance(), lockAmount)
      assertEqualBN(
        await lockedPlanqInstance.getAccountNonvotingLockedPlanq(releasePlanqInstance.address),
        0
      )
      assertEqualBN(await lockedPlanqInstance.getNonvotingLockedPlanq(), 0)
      assertEqualBN(await lockedPlanqInstance.getTotalLockedPlanq(), 0)
    })

    it('should revert if non-beneficiary tries to unlock the locked amount', async () => {
      // lock the entire releasePlanq amount
      await releasePlanqInstance.lockPlanq(lockAmount, {
        from: beneficiary,
      })
      // unlock the latter
      await assertTransactionRevertWithReason(
        releasePlanqInstance.unlockPlanq(lockAmount, { from: accounts[5] }),
        'Must be called by releaseOwner when revoked or beneficiary before revocation'
      )
    })

    it('should revert if beneficiary in voting tries to unlock the locked amount', async () => {
      // set the contract in voting
      await mockGovernance.setVoting(releasePlanqInstance.address)
      // lock the entire releasePlanq amount
      await releasePlanqInstance.lockPlanq(lockAmount, {
        from: beneficiary,
      })
      // unlock the latter
      await assertTransactionRevertWithReason(
        releasePlanqInstance.unlockPlanq(lockAmount, { from: accounts[5] }),
        'Must be called by releaseOwner when revoked or beneficiary before revocation'
      )
    })

    it('should revert if beneficiary with balance requirements tries to unlock the locked amount', async () => {
      // set the contract in voting
      await mockGovernance.setVoting(releasePlanqInstance.address)
      // lock the entire releasePlanq amount
      await releasePlanqInstance.lockPlanq(lockAmount, {
        from: beneficiary,
      })
      // set some balance requirements
      const balanceRequirement = 10
      await mockValidators.setAccountLockedPlanqRequirement(
        releasePlanqInstance.address,
        balanceRequirement
      )
      // unlock the latter
      await assertTransactionRevertWithReason(
        releasePlanqInstance.unlockPlanq(lockAmount, { from: beneficiary }),
        "Either account doesn't have enough locked Planq or locked Planq is being used for voting."
      )
    })
  })

  describe('#withdrawLockedPlanq', () => {
    const value = 1000
    const index = 0

    describe('when a pending withdrawal exists', () => {
      beforeEach(async () => {
        // @ts-ignore: TODO(mcortesi) fix typings for TransactionDetails
        await createNewReleasePlanqInstance(releasePlanqDefaultSchedule, web3)
        await releasePlanqInstance.createAccount({ from: beneficiary })
        await releasePlanqInstance.lockPlanq(value, { from: beneficiary })
        await releasePlanqInstance.unlockPlanq(value, { from: beneficiary })
      })

      describe('when it is after the availablity time', () => {
        beforeEach(async () => {
          await timeTravel(UNLOCKING_PERIOD, web3)
          await releasePlanqInstance.withdrawLockedPlanq(index, { from: beneficiary })
        })

        it('should remove the pending withdrawal', async () => {
          const [values, timestamps] = await lockedPlanqInstance.getPendingWithdrawals(
            releasePlanqInstance.address
          )
          assert.equal(values.length, 0)
          assert.equal(timestamps.length, 0)
          assertEqualBN(await releasePlanqInstance.getRemainingLockedBalance(), 0)
        })
      })

      describe('when it is before the availablity time', () => {
        it('should revert', async () => {
          await assertTransactionRevertWithReason(
            releasePlanqInstance.withdrawLockedPlanq(index, { from: beneficiary }),
            'Pending withdrawal not available'
          )
        })
      })

      describe('when non-beneficiary attempts to withdraw the planq', () => {
        it('should revert', async () => {
          await assertTransactionRevertWithReason(
            releasePlanqInstance.withdrawLockedPlanq(index, { from: accounts[4] }),
            'Must be called by releaseOwner when revoked or beneficiary before revocation'
          )
        })
      })
    })

    describe('when a pending withdrawal does not exist', () => {
      it('should revert', async () => {
        await assertTransactionRevertWithReason(
          releasePlanqInstance.withdrawLockedPlanq(index, { from: beneficiary }),
          'Pending withdrawal not available'
        )
      })
    })
  })

  describe('#relockPlanq', () => {
    const pendingWithdrawalValue = 1000
    const index = 0

    beforeEach(async () => {
      // @ts-ignore: TODO(mcortesi) fix typings for TransactionDetails
      await createNewReleasePlanqInstance(releasePlanqDefaultSchedule, web3)
      await releasePlanqInstance.createAccount({ from: beneficiary })
      await releasePlanqInstance.lockPlanq(pendingWithdrawalValue, { from: beneficiary })
      await releasePlanqInstance.unlockPlanq(pendingWithdrawalValue, { from: beneficiary })
    })

    describe('when a pending withdrawal exists', () => {
      describe('when relocking value equal to the value of the pending withdrawal', () => {
        const value = pendingWithdrawalValue
        beforeEach(async () => {
          await releasePlanqInstance.relockPlanq(index, value, { from: beneficiary })
        })

        it("should increase the account's nonvoting locked planq balance", async () => {
          assertEqualBN(
            await lockedPlanqInstance.getAccountNonvotingLockedPlanq(releasePlanqInstance.address),
            value
          )
        })

        it("should increase the account's total locked planq balance", async () => {
          assertEqualBN(
            await lockedPlanqInstance.getAccountTotalLockedPlanq(releasePlanqInstance.address),
            value
          )
        })

        it('should increase the nonvoting locked planq balance', async () => {
          assertEqualBN(await lockedPlanqInstance.getNonvotingLockedPlanq(), value)
        })

        it('should increase the total locked planq balance', async () => {
          assertEqualBN(await lockedPlanqInstance.getTotalLockedPlanq(), value)
        })

        it('should remove the pending withdrawal', async () => {
          const [values, timestamps] = await lockedPlanqInstance.getPendingWithdrawals(
            releasePlanqInstance.address
          )
          assert.equal(values.length, 0)
          assert.equal(timestamps.length, 0)
        })
      })

      describe('when relocking value less than the value of the pending withdrawal', () => {
        const value = pendingWithdrawalValue - 1
        beforeEach(async () => {
          await releasePlanqInstance.relockPlanq(index, value, { from: beneficiary })
        })

        it("should increase the account's nonvoting locked planq balance", async () => {
          assertEqualBN(
            await lockedPlanqInstance.getAccountNonvotingLockedPlanq(releasePlanqInstance.address),
            value
          )
        })

        it("should increase the account's total locked planq balance", async () => {
          assertEqualBN(
            await lockedPlanqInstance.getAccountTotalLockedPlanq(releasePlanqInstance.address),
            value
          )
        })

        it('should increase the nonvoting locked planq balance', async () => {
          assertEqualBN(await lockedPlanqInstance.getNonvotingLockedPlanq(), value)
        })

        it('should increase the total locked planq balance', async () => {
          assertEqualBN(await lockedPlanqInstance.getTotalLockedPlanq(), value)
        })

        it('should decrement the value of the pending withdrawal', async () => {
          const [values, timestamps] = await lockedPlanqInstance.getPendingWithdrawals(
            releasePlanqInstance.address
          )
          assert.equal(values.length, 1)
          assert.equal(timestamps.length, 1)
          assertEqualBN(values[0], 1)
        })
      })

      describe('when relocking value greater than the value of the pending withdrawal', () => {
        const value = pendingWithdrawalValue + 1
        it('should revert', async () => {
          await assertTransactionRevertWithReason(
            releasePlanqInstance.relockPlanq(index, value, { from: beneficiary }),
            'Requested value larger than pending value'
          )
        })
      })
    })

    describe('when a pending withdrawal does not exist', () => {
      it('should revert', async () => {
        await assertTransactionRevertWithReason(
          releasePlanqInstance.relockPlanq(index, pendingWithdrawalValue),
          'Sender must be the beneficiary and state must not be revoked'
        )
      })
    })
  })

  describe('#withdraw', () => {
    let initialreleasePlanqAmount: any

    beforeEach(async () => {
      const releasePlanqSchedule = _.clone(releasePlanqDefaultSchedule)
      releasePlanqSchedule.releaseStartTime = Math.round(Date.now() / 1000)
      releasePlanqSchedule.initialDistributionRatio = 0
      await createNewReleasePlanqInstance(releasePlanqSchedule, web3)
      initialreleasePlanqAmount = releasePlanqSchedule.amountReleasedPerPeriod.multipliedBy(
        releasePlanqSchedule.numReleasePeriods
      )
    })

    it('should revert before the release cliff has passed', async () => {
      await releasePlanqInstance.setMaxDistribution(1000, { from: releaseOwner })
      const timeToTravel = 0.5 * HOUR
      await timeTravel(timeToTravel, web3)
      await assertTransactionRevertWithReason(
        releasePlanqInstance.withdraw(initialreleasePlanqAmount.div(20), { from: beneficiary }),
        'Requested amount is greater than available released funds'
      )
    })

    it('should revert when withdrawable amount is zero', async () => {
      await releasePlanqInstance.setMaxDistribution(1000, { from: releaseOwner })
      const timeToTravel = 3 * MONTH + 1 * DAY
      await timeTravel(timeToTravel, web3)
      await assertTransactionRevertWithReason(
        releasePlanqInstance.withdraw(new BigNumber(0), { from: beneficiary }),
        'Requested withdrawal amount must be greater than zero'
      )
    })

    describe('when not revoked', () => {
      describe('when max distribution is 100%', () => {
        beforeEach(async () => {
          await releasePlanqInstance.setMaxDistribution(1000, { from: releaseOwner })
        })
        it('should revert since beneficiary should not be able to withdraw anything within the first quarter', async () => {
          const beneficiaryBalanceBefore = await planqTokenInstance.balanceOf(beneficiary)
          const timeToTravel = 2.9 * MONTH
          await timeTravel(timeToTravel, web3)
          const expectedWithdrawalAmount = await releasePlanqInstance.getCurrentReleasedTotalAmount()
          const beneficiaryBalanceAfter = await planqTokenInstance.balanceOf(beneficiary)
          assertEqualBN(expectedWithdrawalAmount, 0)
          await assertTransactionRevertWithReason(
            releasePlanqInstance.withdraw(expectedWithdrawalAmount, { from: beneficiary }),
            'Requested withdrawal amount must be greater than zero'
          )
          assertEqualBN(
            new BigNumber(beneficiaryBalanceAfter).minus(new BigNumber(beneficiaryBalanceBefore)),
            0
          )
        })

        it('should allow the beneficiary to withdraw 25% of the released amount of planq right after the beginning of the first quarter', async () => {
          const beneficiaryBalanceBefore = await planqTokenInstance.balanceOf(beneficiary)
          const timeToTravel = 3 * MONTH + 1 * DAY
          await timeTravel(timeToTravel, web3)
          const expectedWithdrawalAmount = initialreleasePlanqAmount.div(4)
          await releasePlanqInstance.withdraw(expectedWithdrawalAmount, { from: beneficiary })
          const totalWithdrawn = await releasePlanqInstance.totalWithdrawn()
          const beneficiaryBalanceAfter = await planqTokenInstance.balanceOf(beneficiary)
          assertEqualBN(new BigNumber(totalWithdrawn), expectedWithdrawalAmount)
          assertEqualBN(
            new BigNumber(beneficiaryBalanceAfter).minus(new BigNumber(beneficiaryBalanceBefore)),
            expectedWithdrawalAmount
          )
        })

        it('should allow the beneficiary to withdraw 50% the released amount of planq when half of the release periods have passed', async () => {
          const beneficiaryBalanceBefore = await planqTokenInstance.balanceOf(beneficiary)
          const timeToTravel = 6 * MONTH + 1 * DAY
          await timeTravel(timeToTravel, web3)
          const expectedWithdrawalAmount = initialreleasePlanqAmount.div(2)
          await releasePlanqInstance.withdraw(expectedWithdrawalAmount, { from: beneficiary })
          const totalWithdrawn = await releasePlanqInstance.totalWithdrawn()
          const beneficiaryBalanceAfter = await planqTokenInstance.balanceOf(beneficiary)
          assertEqualBN(new BigNumber(totalWithdrawn), expectedWithdrawalAmount)
          assertEqualBN(
            new BigNumber(beneficiaryBalanceAfter).minus(new BigNumber(beneficiaryBalanceBefore)),
            expectedWithdrawalAmount
          )
        })

        it('should allow the beneficiary to withdraw 75% of the released amount of planq right after the beginning of the third quarter', async () => {
          const beneficiaryBalanceBefore = await planqTokenInstance.balanceOf(beneficiary)
          const timeToTravel = 9 * MONTH + 1 * DAY
          await timeTravel(timeToTravel, web3)
          const expectedWithdrawalAmount = initialreleasePlanqAmount.multipliedBy(3).div(4)
          await releasePlanqInstance.withdraw(expectedWithdrawalAmount, { from: beneficiary })
          const beneficiaryBalanceAfter = await planqTokenInstance.balanceOf(beneficiary)
          const totalWithdrawn = await releasePlanqInstance.totalWithdrawn()
          assertEqualBN(new BigNumber(totalWithdrawn), expectedWithdrawalAmount)
          assertEqualBN(
            new BigNumber(beneficiaryBalanceAfter).minus(new BigNumber(beneficiaryBalanceBefore)),
            expectedWithdrawalAmount
          )
        })

        it('should allow the beneficiary to withdraw 100% of the amount right after the end of the release period', async () => {
          const beneficiaryBalanceBefore = await planqTokenInstance.balanceOf(beneficiary)
          const timeToTravel = 12 * MONTH + 1 * DAY
          await timeTravel(timeToTravel, web3)
          const expectedWithdrawalAmount = initialreleasePlanqAmount
          await releasePlanqInstance.withdraw(expectedWithdrawalAmount, { from: beneficiary })
          const beneficiaryBalanceAfter = await planqTokenInstance.balanceOf(beneficiary)

          assertEqualBN(
            new BigNumber(beneficiaryBalanceAfter).minus(new BigNumber(beneficiaryBalanceBefore)),
            expectedWithdrawalAmount
          )
        })

        it('should destruct releasePlanq instance when the entire balance is withdrawn', async () => {
          const timeToTravel = 12 * MONTH + 1 * DAY
          await timeTravel(timeToTravel, web3)
          const expectedWithdrawalAmount = initialreleasePlanqAmount
          await releasePlanqInstance.withdraw(expectedWithdrawalAmount, { from: beneficiary })

          try {
            await releasePlanqInstance.totalWithdrawn()
            return assert.isTrue(false)
          } catch (ex) {
            return assert.isTrue(true)
          }
        })

        describe('when rewards are simulated', () => {
          beforeEach(async () => {
            // Simulate rewards of 0.5 Planq
            await planqTokenInstance.transfer(releasePlanqInstance.address, ONE_PLANQTOKEN.div(2), {
              from: owner,
            })
            // Default distribution is 100%
          })

          describe('when the grant has fully released', () => {
            beforeEach(async () => {
              const timeToTravel = 12 * MONTH + 1 * DAY
              await timeTravel(timeToTravel, web3)
            })

            it('should allow distribution of initial balance and rewards', async () => {
              const expectedWithdrawalAmount = TOTAL_AMOUNT.plus(ONE_PLANQTOKEN.div(2))
              await releasePlanqInstance.withdraw(expectedWithdrawalAmount, { from: beneficiary })
            })
          })

          describe('when the grant is only halfway released', () => {
            beforeEach(async () => {
              const timeToTravel = 6 * MONTH + 1 * DAY
              await timeTravel(timeToTravel, web3)
            })

            it('should scale released amount to 50% of initial balance plus rewards', async () => {
              const expectedWithdrawalAmount = TOTAL_AMOUNT.plus(ONE_PLANQTOKEN.div(2)).div(2)
              await releasePlanqInstance.withdraw(expectedWithdrawalAmount, { from: beneficiary })
            })

            it('should not allow withdrawal of more than 50% planq', async () => {
              const unexpectedWithdrawalAmount = TOTAL_AMOUNT.plus(ONE_PLANQTOKEN).div(2).plus(1)
              await assertTransactionRevertWithReason(
                releasePlanqInstance.withdraw(unexpectedWithdrawalAmount, { from: beneficiary }),
                'Requested amount is greater than available released funds'
              )
            })
          })
        })
      })

      // Max distribution should set a static value of `ratio` of total funds at call time of `setMaxDistribution`
      // So this is testing that the maxDistribution is unrelated to rewards, except the 100% special case.
      describe('when max distribution is 50% and all planq is released', () => {
        beforeEach(async () => {
          await releasePlanqInstance.setMaxDistribution(500, { from: releaseOwner })
          // Simulate rewards of 0.5 Planq
          // Have to send after setting max distribution as mentioned above
          await planqTokenInstance.transfer(releasePlanqInstance.address, ONE_PLANQTOKEN.div(2), {
            from: owner,
          })
          const timeToTravel = 12 * MONTH + 1 * DAY
          await timeTravel(timeToTravel, web3)
        })

        it('should only allow withdrawal of 50% of initial grant (not including rewards)', async () => {
          const expectedWithdrawalAmount = TOTAL_AMOUNT.div(2)
          await releasePlanqInstance.withdraw(expectedWithdrawalAmount, { from: beneficiary })
          const unexpectedWithdrawalAmount = 1
          await assertTransactionRevertWithReason(
            releasePlanqInstance.withdraw(unexpectedWithdrawalAmount, { from: beneficiary }),
            'Requested amount exceeds current alloted maximum distribution'
          )
        })
      })
    })

    describe('when revoked', () => {
      describe('when max distribution is 100%', () => {
        beforeEach(async () => {
          await releasePlanqInstance.setMaxDistribution(1000, { from: releaseOwner })
        })
        it('should allow the beneficiary to withdraw up to the releasedBalanceAtRevoke', async () => {
          const beneficiaryBalanceBefore = await planqTokenInstance.balanceOf(beneficiary)
          const timeToTravel = 6 * MONTH + 1 * DAY
          await timeTravel(timeToTravel, web3)
          await releasePlanqInstance.revoke({ from: releaseOwner })
          const [, , expectedWithdrawalAmount] = await releasePlanqInstance.revocationInfo()
          await releasePlanqInstance.withdraw(expectedWithdrawalAmount, { from: beneficiary })
          const totalWithdrawn = await releasePlanqInstance.totalWithdrawn()
          const beneficiaryBalanceAfter = await planqTokenInstance.balanceOf(beneficiary)
          assertEqualBN(new BigNumber(totalWithdrawn), expectedWithdrawalAmount)
          assertEqualBN(
            new BigNumber(beneficiaryBalanceAfter).minus(new BigNumber(beneficiaryBalanceBefore)),
            expectedWithdrawalAmount
          )
        })

        it('should revert if beneficiary attempts to withdraw more than releasedBalanceAtRevoke', async () => {
          const timeToTravel = 6 * MONTH + 1 * DAY
          await timeTravel(timeToTravel, web3)
          await releasePlanqInstance.revoke({ from: releaseOwner })
          const [, , expectedWithdrawalAmount] = await releasePlanqInstance.revocationInfo()
          await assertTransactionRevertWithReason(
            releasePlanqInstance.withdraw(
              new BigNumber(expectedWithdrawalAmount).multipliedBy(1.1),
              {
                from: beneficiary,
              }
            ),
            'Requested amount is greater than available released funds'
          )
        })

        it('should selfdestruct if beneficiary withdraws the entire amount', async () => {
          const beneficiaryBalanceBefore = await planqTokenInstance.balanceOf(beneficiary)
          const timeToTravel = 12 * MONTH + 1 * DAY
          await timeTravel(timeToTravel, web3)
          await releasePlanqInstance.revoke({ from: releaseOwner })
          const [, , expectedWithdrawalAmount] = await releasePlanqInstance.revocationInfo()
          await releasePlanqInstance.withdraw(expectedWithdrawalAmount, { from: beneficiary })
          const beneficiaryBalanceAfter = await planqTokenInstance.balanceOf(beneficiary)

          assertEqualBN(
            new BigNumber(beneficiaryBalanceAfter).minus(new BigNumber(beneficiaryBalanceBefore)),
            expectedWithdrawalAmount
          )

          try {
            await releasePlanqInstance.totalWithdrawn()
            return assert.isTrue(false)
          } catch (ex) {
            return assert.isTrue(true)
          }
        })
      })
    })

    describe('when max distribution is set lower', () => {
      let beneficiaryBalanceBefore: any
      beforeEach(async () => {
        beneficiaryBalanceBefore = await planqTokenInstance.balanceOf(beneficiary)
        const timeToTravel = 12 * MONTH + 1 * DAY
        await timeTravel(timeToTravel, web3)
      })

      describe('when max distribution is 50%', () => {
        beforeEach(async () => {
          await releasePlanqInstance.setMaxDistribution(500, { from: releaseOwner })
        })

        it('should allow withdrawal of 50%', async () => {
          const expectedWithdrawalAmount = initialreleasePlanqAmount.multipliedBy(0.5)
          await releasePlanqInstance.withdraw(expectedWithdrawalAmount, { from: beneficiary })
          const beneficiaryBalanceAfter = await planqTokenInstance.balanceOf(beneficiary)

          assertEqualBN(
            new BigNumber(beneficiaryBalanceAfter).minus(new BigNumber(beneficiaryBalanceBefore)),
            expectedWithdrawalAmount
          )
        })

        it('should revert on withdrawal of more than 50%', async () => {
          await assertTransactionRevertWithReason(
            releasePlanqInstance.withdraw(initialreleasePlanqAmount, { from: beneficiary }),
            'Requested amount exceeds current alloted maximum distribution'
          )
        })
      })

      describe('when max distribution is 100%', () => {
        beforeEach(async () => {
          await releasePlanqInstance.setMaxDistribution(1000, { from: releaseOwner })
        })

        it('should allow withdrawal of all planq', async () => {
          const expectedWithdrawalAmount = initialreleasePlanqAmount
          await releasePlanqInstance.withdraw(expectedWithdrawalAmount, { from: beneficiary })
          const beneficiaryBalanceAfter = await planqTokenInstance.balanceOf(beneficiary)

          assertEqualBN(
            new BigNumber(beneficiaryBalanceAfter).minus(new BigNumber(beneficiaryBalanceBefore)),
            expectedWithdrawalAmount
          )
        })
      })
    })

    describe('when the liquidity provision is observed and set false', () => {
      beforeEach(async () => {
        const releasePlanqSchedule = _.clone(releasePlanqDefaultSchedule)
        releasePlanqSchedule.subjectToLiquidityProvision = true
        await createNewReleasePlanqInstance(releasePlanqSchedule, web3)
        // Withdraw `beforeEach` creates one instance, have to grab the second
        const timeToTravel = 12 * MONTH + 1 * DAY
        await timeTravel(timeToTravel, web3)
      })

      it('should revert on withdraw of any amount', async () => {
        await assertTransactionRevertWithReason(
          releasePlanqInstance.withdraw(initialreleasePlanqAmount.multipliedBy(0.5), {
            from: beneficiary,
          }),
          'Requested withdrawal before liquidity provision is met'
        )
        await assertTransactionRevertWithReason(
          releasePlanqInstance.withdraw(initialreleasePlanqAmount, { from: beneficiary }),
          'Requested withdrawal before liquidity provision is met'
        )
      })
    })
  })

  describe('#getCurrentReleasedTotalAmount', () => {
    let initialreleasePlanqAmount: any

    beforeEach(async () => {
      const releasePlanqSchedule = _.clone(releasePlanqDefaultSchedule)
      releasePlanqSchedule.releaseStartTime = Math.round(Date.now() / 1000)
      await createNewReleasePlanqInstance(releasePlanqSchedule, web3)
      initialreleasePlanqAmount = releasePlanqSchedule.amountReleasedPerPeriod.multipliedBy(
        releasePlanqSchedule.numReleasePeriods
      )
    })

    it('should return zero if before cliff start time', async () => {
      const timeToTravel = 0.5 * HOUR
      await timeTravel(timeToTravel, web3)
      const expectedWithdrawalAmount = 0
      assertEqualBN(
        await releasePlanqInstance.getCurrentReleasedTotalAmount(),
        expectedWithdrawalAmount
      )
    })

    it('should return 25% of the released amount of planq right after the beginning of the first quarter', async () => {
      const timeToTravel = 3 * MONTH + 1 * DAY
      await timeTravel(timeToTravel, web3)
      const expectedWithdrawalAmount = initialreleasePlanqAmount.div(4)
      assertEqualBN(
        await releasePlanqInstance.getCurrentReleasedTotalAmount(),
        expectedWithdrawalAmount
      )
    })

    it('should return 50% the released amount of planq right after the beginning of the second quarter', async () => {
      const timeToTravel = 6 * MONTH + 1 * DAY
      await timeTravel(timeToTravel, web3)
      const expectedWithdrawalAmount = initialreleasePlanqAmount.div(2)
      assertEqualBN(
        await releasePlanqInstance.getCurrentReleasedTotalAmount(),
        expectedWithdrawalAmount
      )
    })

    it('should return 75% of the released amount of planq right after the beginning of the third quarter', async () => {
      const timeToTravel = 9 * MONTH + 1 * DAY
      await timeTravel(timeToTravel, web3)
      const expectedWithdrawalAmount = initialreleasePlanqAmount.multipliedBy(3).div(4)
      assertEqualBN(
        await releasePlanqInstance.getCurrentReleasedTotalAmount(),
        expectedWithdrawalAmount
      )
    })

    it('should return 100% of the amount right after the end of the releasePlanq period', async () => {
      const timeToTravel = 12 * MONTH + 1 * DAY
      await timeTravel(timeToTravel, web3)
      const expectedWithdrawalAmount = initialreleasePlanqAmount
      assertEqualBN(
        await releasePlanqInstance.getCurrentReleasedTotalAmount(),
        expectedWithdrawalAmount
      )
    })
  })

  describe('#getWithdrawableAmount', () => {
    let initialReleasePlanqAmount: any

    beforeEach(async () => {
      const releasePlanqSchedule = _.clone(releasePlanqDefaultSchedule)
      releasePlanqSchedule.canValidate = true
      releasePlanqSchedule.revocable = false
      releasePlanqSchedule.refundAddress = '0x0000000000000000000000000000000000000000'
      releasePlanqSchedule.releaseStartTime = Math.round(Date.now() / 1000)
      releasePlanqSchedule.initialDistributionRatio = 500
      await createNewReleasePlanqInstance(releasePlanqSchedule, web3)
      initialReleasePlanqAmount = releasePlanqSchedule.amountReleasedPerPeriod.multipliedBy(
        releasePlanqSchedule.numReleasePeriods
      )

      await releasePlanqInstance.createAccount({ from: beneficiary })
    })

    describe('should return 50% of the released amount of planq right after the beginning of the second quarter', async () => {
      beforeEach(async () => {
        await releasePlanqInstance.setMaxDistribution(1000, { from: releaseOwner })

        const timeToTravel = 6 * MONTH + 1 * DAY
        await timeTravel(timeToTravel, web3)
      })

      it('should return the full amount available for this release period', async () => {
        const expectedWithdrawalAmount = initialReleasePlanqAmount.div(2)
        const withdrawableAmount = await releasePlanqInstance.getWithdrawableAmount()
        assertEqualBN(withdrawableAmount, expectedWithdrawalAmount)
      })

      it('should return only amount not yet withdrawn', async () => {
        const expectedWithdrawalAmount = initialReleasePlanqAmount.div(2)
        await releasePlanqInstance.withdraw(expectedWithdrawalAmount.div(2), { from: beneficiary })

        const afterWithdrawal = await releasePlanqInstance.getWithdrawableAmount()
        await releasePlanqInstance.getWithdrawableAmount()
        assertEqualBN(afterWithdrawal, expectedWithdrawalAmount.div(2))
      })
    })

    it('should return only up to its own balance', async () => {
      await releasePlanqInstance.setMaxDistribution(1000, { from: releaseOwner })
      const timeToTravel = 6 * MONTH + 1 * DAY
      await timeTravel(timeToTravel, web3)
      const signerFund = new BigNumber('1000000000000000000')
      const expectedWithdrawalAmount = initialReleasePlanqAmount.minus(signerFund).div(2)

      const authorized = accounts[4]
      const ecdsaPublicKey = await addressToPublicKey(authorized, web3.eth.sign)
      const sig = await getParsedSignatureOfAddress(web3, releasePlanqInstance.address, authorized)
      // this will send 1 PLQ from release planq balance to authorized
      await releasePlanqInstance.authorizeValidatorSignerWithPublicKey(
        authorized,
        sig.v,
        sig.r,
        sig.s,
        ecdsaPublicKey as any,
        { from: beneficiary }
      )

      const withdrawableAmount = await releasePlanqInstance.getWithdrawableAmount()
      assertEqualBN(withdrawableAmount, expectedWithdrawalAmount)
    })

    it('should return only up to max distribution', async () => {
      const timeToTravel = 6 * MONTH + 1 * DAY
      await timeTravel(timeToTravel, web3)
      const expectedWithdrawalAmount = initialReleasePlanqAmount.div(2)

      await releasePlanqInstance.setMaxDistribution(250, { from: releaseOwner })

      const withdrawableAmount = await releasePlanqInstance.getWithdrawableAmount()
      assertEqualBN(withdrawableAmount, expectedWithdrawalAmount.div(2))
    })
  })
})
