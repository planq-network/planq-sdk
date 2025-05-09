// tslint:disable: no-console
import { ContractKit, newKitFromWeb3 } from '@planq-network/contractkit'
import { getBlsPoP, getBlsPublicKey } from '@planq-network/cryptographic-utils/lib/bls'
import { eqAddress, privateKeyToAddress } from '@planq-network/utils/lib/address'
import { concurrentMap } from '@planq-network/utils/lib/async'
import { fromFixed, toFixed } from '@planq-network/utils/lib/fixidity'
import { bitIsSet, parseBlockExtraData } from '@planq-network/utils/lib/istanbul'
import BigNumber from 'bignumber.js'
import { assert } from 'chai'
import Web3 from 'web3'
import { AccountType, generateAddress, generatePrivateKey } from '../lib/generate_utils'
import { connectBipartiteClique, connectPeers, initAndStartGeth } from '../lib/geth'
import { GethInstanceConfig } from '../lib/interfaces/geth-instance-config'
import { GethRunConfig } from '../lib/interfaces/geth-run-config'
import {
  assertAlmostEqual,
  getHooks,
  mnemonic,
  sleep,
  waitForAnnounceToStabilize,
  waitForBlock,
  waitForEpochTransition,
  waitToFinishInstanceSyncing,
} from './utils'

interface MemberSwapper {
  swap(): Promise<void>
}

const TMP_PATH = '/tmp/e2e'
const verbose = false
const carbonOffsettingPartnerAddress = '0x1234567812345678123456781234567812345678'
const validatorAddress = '0x47e172f6cfb6c7d01c1574fa3e2be7cc73269d95'
// The tests calculate some expected values based on the rewards multiplier from the block
// before an epoch block.  However, the actual rewards multiplier used for epoch rewards is
// calculated inside the epoch block.  Since the multiplier depends on the timestamp, this means
// the expected values will never exactly match the actual values, so we need some tolerance.
// This constant defines the tolerance as a fraction of the expected value.
// values.  We use 10^-6, so they have to be match to (nearly) 6 significant figures
const tolerance = new BigNumber(10).pow(new BigNumber(-6))

async function newMemberSwapper(kit: ContractKit, members: string[]): Promise<MemberSwapper> {
  let index = 0
  const group = (await kit.connection.getAccounts())[0]
  await Promise.all(members.slice(1).map((member) => removeMember(member)))

  async function removeMember(member: string) {
    return (await kit.contracts.getValidators())
      .removeMember(member)
      .sendAndWaitForReceipt({ from: group })
  }

  async function addMember(member: string) {
    return (
      await (await kit.contracts.getValidators()).addMember(group, member)
    ).sendAndWaitForReceipt({ from: group })
  }

  async function getGroupMembers() {
    const groupInfo = await (await kit._web3Contracts.getValidators()).methods
      .getValidatorGroup(group)
      .call()
    return groupInfo[0]
  }

  return {
    async swap() {
      const removedMember = members[index % members.length]
      await removeMember(members[index % members.length])
      index = index + 1
      const addedMember = members[index % members.length]
      await addMember(members[index % members.length])
      const groupMembers = await getGroupMembers()
      assert.include(groupMembers, addedMember)
      assert.notInclude(groupMembers, removedMember)
    },
  }
}

interface KeyRotator {
  rotate(): Promise<void>
}

async function newKeyRotator(
  kit: ContractKit,
  kits: ContractKit[],
  privateKeys: string[]
): Promise<KeyRotator> {
  let index = 0
  const validator = (await kit.connection.getAccounts())[0]
  const accountsWrapper = await kit.contracts.getAccounts()

  async function authorizeValidatorSigner(
    signer: string,
    signerKit: ContractKit,
    signerPrivateKey: string
  ) {
    const blsPublicKey = getBlsPublicKey(signerPrivateKey)
    const blsPop = getBlsPoP(validator, signerPrivateKey)
    const accounts = await signerKit.contracts.getAccounts()
    const pop = await accounts.generateProofOfKeyPossession(validator, signer)
    return (
      await accountsWrapper.authorizeValidatorSignerAndBls(signer, pop, blsPublicKey, blsPop)
    ).sendAndWaitForReceipt({
      from: validator,
    })
  }

  return {
    async rotate() {
      if (index < kits.length) {
        const signerKit = kits[index]
        const signer: string = (await signerKit.connection.getAccounts())[0]
        const signerPrivateKey = privateKeys[index]
        await authorizeValidatorSigner(signer, signerKit, signerPrivateKey)
        index += 1
        assert.equal(await accountsWrapper.getValidatorSigner(validator), signer)
      }
    },
  }
}

async function calculateUptime(
  kit: ContractKit,
  validatorSetSize: number,
  lastBlockNumberOfEpoch: number,
  epochSize: number,
  lookbackWindow: number
): Promise<BigNumber[]> {
  const firstBlockNumberOfEpoch = lastBlockNumberOfEpoch - epochSize + 1

  const monitoringWindow: [number, number] = [
    firstBlockNumberOfEpoch + lookbackWindow - 1, // last block of first lookbackWindow
    lastBlockNumberOfEpoch - 2, // we ignore last 2 block fo epoch
  ]
  const monitoringWindowSize = monitoringWindow[1] - monitoringWindow[0] + 1

  // we need to obtain monitoring window blocks shifted by 1, since
  // we are interested in parentAggregatedSeal that lives on the next block
  const blocks = await concurrentMap(10, [...Array(monitoringWindowSize).keys()], (i) =>
    kit.connection.getBlock(monitoringWindow[0] + 1 + i)
  )
  const lastSignedBlock: number[] = new Array(validatorSetSize).fill(0)
  const upBlocks: number[] = new Array(validatorSetSize).fill(0)

  // Follows updateUptime() in core/blockchain.go
  for (const block of blocks) {
    const blockNumber = block.number - 1 // we are actually monitoring prev block signatures
    const bitmap = parseBlockExtraData(block.extraData).parentAggregatedSeal.bitmap

    const isMonitoredBlock =
      blockNumber >= monitoringWindow[0] && blockNumber <= monitoringWindow[1]

    const currentLookbackWindow: [number, number] = [blockNumber - lookbackWindow + 1, blockNumber]

    for (let signerIndex = 0; signerIndex < validatorSetSize; signerIndex++) {
      if (bitIsSet(bitmap, signerIndex)) {
        lastSignedBlock[signerIndex] = blockNumber
      }

      const lastSignedWithinLookbackwindow =
        lastSignedBlock[signerIndex] >= currentLookbackWindow[0] &&
        lastSignedBlock[signerIndex] <= currentLookbackWindow[1]

      if (isMonitoredBlock && lastSignedWithinLookbackwindow) {
        upBlocks[signerIndex]++
      }
    }
  }

  const maxPotentialUpBlocks = monitoringWindowSize
  return upBlocks.map((x) => new BigNumber(x / maxPotentialUpBlocks))
}

// TODO(asa): Test independent rotation of ecdsa, bls keys.
describe('governance tests', () => {
  const gethConfig: GethRunConfig = {
    runPath: TMP_PATH,
    verbosity: 3,
    migrate: true,
    networkId: 1101,
    network: 'local',
    genesisConfig: {
      churritoBlock: 0,
      donutBlock: 0,
      espressoBlock: 0,
      epoch: 10,
    },
    instances: [
      // Validators 0 and 1 are swapped in and out of the group.
      {
        name: 'validator0',
        validating: true,
        syncmode: 'full',
        port: 30303,
        rpcport: 8545,
      },
      {
        name: 'validator1',
        validating: true,
        syncmode: 'full',
        port: 30305,
        rpcport: 8547,
      },
      // Validator 2 will authorize a validating key every other epoch.
      {
        name: 'validator2',
        validating: true,
        syncmode: 'full',
        port: 30307,
        rpcport: 8549,
      },
      {
        name: 'validator3',
        validating: true,
        syncmode: 'full',
        port: 30309,
        rpcport: 8551,
      },
      {
        name: 'validator4',
        validating: true,
        syncmode: 'full',
        port: 30311,
        rpcport: 8553,
      },
    ],
  }

  const hooks: any = getHooks(gethConfig)

  let web3: Web3
  let election: any
  let stableToken: any
  let sortedOracles: any
  let epochRewards: any
  let planqToken: any
  let reserve: any
  let validators: any
  let accounts: any
  let kit: ContractKit

  before(async function (this: any) {
    this.timeout(0)
    // Comment out the following line after a local run for a quick rerun.
    await hooks.before()
  })

  after(async function (this: any) {
    this.timeout(0)
    await hooks.after()
  })

  const restart = async () => {
    await hooks.restart()
    web3 = new Web3('http://localhost:8545')
    kit = newKitFromWeb3(web3)
    // TODO(mcortesi): magic sleep. without it unlockAccount sometimes fails
    await sleep(2)
    // Assuming empty password
    await kit.connection.web3.eth.personal.unlockAccount(validatorAddress, '', 1000000)

    planqToken = await kit._web3Contracts.getPlanqToken()
    stableToken = await kit._web3Contracts.getStableToken()
    sortedOracles = await kit._web3Contracts.getSortedOracles()
    validators = await kit._web3Contracts.getValidators()
    reserve = await kit._web3Contracts.getReserve()
    election = await kit._web3Contracts.getElection()
    epochRewards = await kit._web3Contracts.getEpochRewards()
    accounts = await kit._web3Contracts.getAccounts()

    await waitForBlock(web3, 1)
    await waitForAnnounceToStabilize(web3)

    const er = await kit._web3Contracts.getEpochRewards()
    const fraction = await er.methods.getCarbonOffsettingFraction().call()
    await er.methods
      .setCarbonOffsettingFund(carbonOffsettingPartnerAddress, fraction)
      .send({ from: validatorAddress })
  }

  const getValidatorGroupMembers = async (blockNumber?: number) => {
    if (blockNumber) {
      const [groupAddress] = await validators.methods
        .getRegisteredValidatorGroups()
        .call({}, blockNumber)
      const groupInfo = await validators.methods
        .getValidatorGroup(groupAddress)
        .call({}, blockNumber)
      return groupInfo[0]
    } else {
      const [groupAddress] = await validators.methods.getRegisteredValidatorGroups().call()
      const groupInfo = await validators.methods.getValidatorGroup(groupAddress).call()
      return groupInfo[0]
    }
  }

  const getValidatorSigner = async (address: string, blockNumber?: number) => {
    if (blockNumber) {
      return accounts.methods.getValidatorSigner(address).call({}, blockNumber)
    } else {
      return accounts.methods.getValidatorSigner(address).call()
    }
  }

  const getValidatorGroupPrivateKey = async () => {
    const [groupAddress] = await validators.methods.getRegisteredValidatorGroups().call()
    // If we're using myplanq, we can just generate the validator group key directly
    const myplanqAddress = generateAddress(mnemonic, AccountType.VALIDATOR_GROUP, 0)
    if (myplanqAddress === groupAddress) {
      return '0x' + generatePrivateKey(mnemonic, AccountType.VALIDATOR_GROUP, 0)
    }
    // Otherwise, the validator group key is encoded in its name (see 25_elect_validators.ts)
    const name = await accounts.methods.getName(groupAddress).call()
    const encryptedKeystore64 = name.split(' ')[1]
    const encryptedKeystore = JSON.parse(Buffer.from(encryptedKeystore64, 'base64').toString())
    // The validator group ID is the validator group keystore encrypted with validator 0's
    // private key.
    const encryptionKey = `0x${gethConfig.instances[0].privateKey}`
    const decryptedKeystore = web3.eth.accounts.decrypt(encryptedKeystore, encryptionKey)
    return decryptedKeystore.privateKey
  }

  const isLastBlockOfEpoch = (blockNumber: number, epochSize: number) =>
    blockNumber % epochSize === 0

  const assertBalanceChanged = async (
    address: string,
    blockNumber: number,
    expected: BigNumber,
    token: any
  ) => {
    const currentBalance = new BigNumber(
      await token.methods.balanceOf(address).call({}, blockNumber)
    )
    const previousBalance = new BigNumber(
      await token.methods.balanceOf(address).call({}, blockNumber - 1)
    )
    assert.isFalse(currentBalance.isNaN())
    assert.isFalse(previousBalance.isNaN())
    const margin = expected.times(tolerance)
    assertAlmostEqual(currentBalance.minus(previousBalance), expected, margin)
  }

  const assertTargetVotingYieldChanged = async (blockNumber: number, expected: BigNumber) => {
    const currentTarget = new BigNumber(
      (await epochRewards.methods.getTargetVotingYieldParameters().call({}, blockNumber))[0]
    )
    const previousTarget = new BigNumber(
      (await epochRewards.methods.getTargetVotingYieldParameters().call({}, blockNumber - 1))[0]
    )
    const max = new BigNumber(
      (await epochRewards.methods.getTargetVotingYieldParameters().call({}, blockNumber))[1]
    )
    const expectedTarget = previousTarget.plus(expected)
    if (expectedTarget.isGreaterThanOrEqualTo(max)) {
      assert.equal(currentTarget.toFixed(), max.toFixed())
    } else if (expectedTarget.isLessThanOrEqualTo(0)) {
      assert.isTrue(currentTarget.isZero())
    } else {
      const difference = currentTarget.minus(previousTarget)
      // Assert equal to 9 decimal places due to rounding errors.
      assert.equal(fromFixed(difference).dp(9).toFixed(), fromFixed(expected).dp(9).toFixed())
    }
  }

  const assertTargetVotingYieldUnchanged = (blockNumber: number) =>
    assertTargetVotingYieldChanged(blockNumber, new BigNumber(0))

  const getLastEpochBlock = (blockNumber: number, epoch: number) => {
    const epochNumber = Math.floor((blockNumber - 1) / epoch)
    return epochNumber * epoch
  }

  const assertPlanqTokenTotalSupplyUnchanged = (blockNumber: number) =>
    assertPlanqTokenTotalSupplyChanged(blockNumber, new BigNumber(0))

  const assertPlanqTokenTotalSupplyChanged = async (blockNumber: number, expected: BigNumber) => {
    const currentSupply = new BigNumber(await planqToken.methods.totalSupply().call({}, blockNumber))
    const previousSupply = new BigNumber(
      await planqToken.methods.totalSupply().call({}, blockNumber - 1)
    )
    assertAlmostEqual(currentSupply.minus(previousSupply), expected)
  }

  describe('when the validator set is changing', () => {
    const blockNumbers: number[] = []

    let epoch: number
    let validatorAccounts: string[]

    before(async function (this: any) {
      this.timeout(0) // Disable test timeout

      await restart()

      const groupPrivateKey = await getValidatorGroupPrivateKey()

      const validatorGroup: GethInstanceConfig = {
        name: 'validatorGroup',
        validating: false,
        syncmode: 'full',
        port: 30313,
        wsport: 8555,
        rpcport: 8557,
        privateKey: groupPrivateKey.slice(2),
      }

      await initAndStartGeth(gethConfig, hooks.gethBinaryPath, validatorGroup, verbose)

      await connectPeers([...gethConfig.instances, validatorGroup], verbose)

      await waitToFinishInstanceSyncing(validatorGroup)

      validatorAccounts = await getValidatorGroupMembers()
      assert.equal(validatorAccounts.length, 5)
      epoch = new BigNumber(await validators.methods.getEpochSize().call()).toNumber()
      assert.equal(epoch, 10)

      // Wait for an epoch transition so we can activate our vote.
      await waitForEpochTransition(web3, epoch)
      await sleep(5.5)
      // Wait for an extra epoch transition to ensure everyone is connected to one another.
      await waitForEpochTransition(web3, epoch)

      const groupWeb3Url = 'ws://localhost:8555'

      // Prepare for member swapping.
      const groupWeb3 = new Web3(groupWeb3Url)

      const groupKit = newKitFromWeb3(groupWeb3)

      const group: string = (await groupWeb3.eth.getAccounts())[0]
      // Send some funds to the group, so it can afford fees
      await (
        await kit.sendTransaction({
          from: validatorAddress,
          to: group,
          value: Web3.utils.toWei('1', 'ether'),
        })
      ).waitReceipt()

      // groupKit uses a different node than kit does, so wait a second in case kit's node
      // got the new block before groupKit's node did.
      await sleep(1)
      const txos = await (await groupKit.contracts.getElection()).activate(group)
      for (const txo of txos) {
        await txo.sendAndWaitForReceipt({ from: group })
      }

      validators = await groupKit._web3Contracts.getValidators()
      const membersToSwap = [validatorAccounts[0], validatorAccounts[1]]
      const memberSwapper = await newMemberSwapper(groupKit, membersToSwap)
      // The memberSwapper makes a change when it's created, so we wait for epoch change so it takes effect
      await waitForEpochTransition(web3, epoch)

      const handled: any = {}

      let errorWhileChangingValidatorSet = ''
      const changeValidatorSet = async (header: any) => {
        try {
          if (handled[header.number]) {
            return
          }
          handled[header.number] = true
          blockNumbers.push(header.number)
          // At the start of epoch N, perform actions so the validator set is different for epoch N + 1.
          // Note that all of these actions MUST complete within the epoch.
          if (header.number % epoch === 0 && errorWhileChangingValidatorSet === '') {
            // 1. Swap validator0 and validator1 so one is a member of the group and the other is not.
            // 2. Rotate keys for validator 2 by authorizing a new validating key.
            await memberSwapper.swap()
          }
        } catch (e: any) {
          console.error(e)
          errorWhileChangingValidatorSet = e.toString()
        }
      }

      const subscription = groupWeb3.eth.subscribe('newBlockHeaders')
      subscription.on('data', changeValidatorSet)

      // Wait for a few epochs while changing the validator set.
      while (blockNumbers.length < 40) {
        // Prepare for member swapping.
        await sleep(epoch)
      }
      ;(subscription as any).unsubscribe()

      // Wait for the current epoch to complete.
      await sleep(epoch)
      assert.equal(errorWhileChangingValidatorSet, '')
    })

    const getValidatorSetSignersAtBlock = async (blockNumber: number): Promise<string[]> => {
      return election.methods.getCurrentValidatorSigners().call({}, blockNumber)
    }

    const getValidatorSetAccountsAtBlock = async (blockNumber: number) => {
      const signingKeys = await getValidatorSetSignersAtBlock(blockNumber)
      return Promise.all(
        signingKeys.map((address: string) =>
          accounts.methods.signerToAccount(address).call({}, blockNumber)
        )
      )
    }

    it('should always return a validator set size equal to the number of group members at the end of the last epoch', async () => {
      for (const blockNumber of blockNumbers) {
        const lastEpochBlock = getLastEpochBlock(blockNumber, epoch)
        const validatorSetSize = await election.methods
          .numberValidatorsInCurrentSet()
          .call({}, blockNumber)
        const groupMembership = await getValidatorGroupMembers(lastEpochBlock)
        assert.equal(validatorSetSize, groupMembership.length)
      }
    })

    it('should always return a validator set equal to the signing keys of the group members at the end of the last epoch', async function (this: any) {
      this.timeout(0)
      for (const blockNumber of blockNumbers) {
        const lastEpochBlock = getLastEpochBlock(blockNumber, epoch)
        const memberAccounts = await getValidatorGroupMembers(lastEpochBlock)
        const memberSigners = await Promise.all(
          memberAccounts.map((v: string) => getValidatorSigner(v, lastEpochBlock))
        )
        const validatorSetSigners = await getValidatorSetSignersAtBlock(blockNumber)
        const validatorSetAccounts = await getValidatorSetAccountsAtBlock(blockNumber)
        assert.sameMembers(memberSigners, validatorSetSigners)
        assert.sameMembers(memberAccounts, validatorSetAccounts)
      }
    })

    it('should block propose in a round robin fashion', async () => {
      let roundRobinOrder: string[] = []
      for (const blockNumber of blockNumbers) {
        const lastEpochBlock = getLastEpochBlock(blockNumber, epoch)
        // Fetch the round robin order if it hasn't already been set for this epoch.
        if (roundRobinOrder.length === 0 || blockNumber === lastEpochBlock + 1) {
          const validatorSet = await getValidatorSetSignersAtBlock(blockNumber)
          roundRobinOrder = await Promise.all(
            validatorSet.map(
              async (_, i) => (await web3.eth.getBlock(lastEpochBlock + i + 1)).miner
            )
          )
          assert.sameMembers(roundRobinOrder, validatorSet)
        }
        const indexInEpoch = blockNumber - lastEpochBlock - 1
        const expectedProposer = roundRobinOrder[indexInEpoch % roundRobinOrder.length]
        const block = await web3.eth.getBlock(blockNumber)
        assert(eqAddress(block.miner, expectedProposer))
      }
    })

    it('should update the validator scores at the end of each epoch', async function (this: any) {
      this.timeout(0)
      const scoreParams = await validators.methods.getValidatorScoreParameters().call()
      const exponent = new BigNumber(scoreParams[0])
      const adjustmentSpeed = fromFixed(new BigNumber(scoreParams[1]))

      const assertScoreUnchanged = async (validator: string, blockNumber: number) => {
        const score = new BigNumber(
          (await validators.methods.getValidator(validator).call({}, blockNumber)).score
        )
        const previousScore = new BigNumber(
          (await validators.methods.getValidator(validator).call({}, blockNumber - 1)).score
        )
        assert.isFalse(score.isNaN())
        assert.isFalse(previousScore.isNaN())
        assert.equal(score.toFixed(), previousScore.toFixed())
      }

      const assertScoreChanged = async (
        validator: string,
        blockNumber: number,
        uptime: BigNumber
      ) => {
        const score = new BigNumber(
          (await validators.methods.getValidator(validator).call({}, blockNumber)).score
        )
        const previousScore = new BigNumber(
          (await validators.methods.getValidator(validator).call({}, blockNumber - 1)).score
        )
        assert.isFalse(score.isNaN())
        assert.isFalse(previousScore.isNaN())

        const epochScore = uptime.exponentiatedBy(exponent)
        const expectedScore = BigNumber.minimum(
          epochScore,
          adjustmentSpeed
            .times(epochScore)
            .plus(new BigNumber(1).minus(adjustmentSpeed).times(fromFixed(previousScore)))
        )
        assertAlmostEqual(score, toFixed(expectedScore))
      }

      for (const blockNumber of blockNumbers) {
        let expectUnchangedScores: string[]
        let expectChangedScores: string[]
        let electedValidators: string[]
        let uptime: BigNumber[]
        if (isLastBlockOfEpoch(blockNumber, epoch)) {
          expectChangedScores = await getValidatorSetAccountsAtBlock(blockNumber)
          expectUnchangedScores = validatorAccounts.filter((x) => !expectChangedScores.includes(x))
          electedValidators = await getValidatorSetAccountsAtBlock(blockNumber)
          uptime = await calculateUptime(kit, electedValidators.length, blockNumber, epoch, 3)
        } else {
          expectUnchangedScores = validatorAccounts
          expectChangedScores = []
          electedValidators = []
          uptime = []
        }

        for (const validator of expectUnchangedScores) {
          await assertScoreUnchanged(validator, blockNumber)
        }

        for (const validator of expectChangedScores) {
          const signerIndex = electedValidators.map(eqAddress.bind(null, validator)).indexOf(true)
          await assertScoreChanged(validator, blockNumber, uptime[signerIndex])
        }
      }
    })

    it('should distribute epoch payments at the end of each epoch', async function (this: any) {
      this.timeout(0)
      const commission = 0.1
      const targetValidatorEpochPayment = new BigNumber(
        await epochRewards.methods.targetValidatorEpochPayment().call()
      )
      const [group] = await validators.methods.getRegisteredValidatorGroups().call()

      const assertBalanceUnchanged = async (validator: string, blockNumber: number) => {
        await assertBalanceChanged(validator, blockNumber, new BigNumber(0), stableToken)
      }

      const getExpectedTotalPayment = async (validator: string, blockNumber: number) => {
        const score = new BigNumber(
          (await validators.methods.getValidator(validator).call({}, blockNumber)).score
        )
        assert.isFalse(score.isNaN())
        // We need to calculate the rewards multiplier for the previous block, before
        // the rewards actually are awarded.
        const rewardsMultiplier = new BigNumber(
          await epochRewards.methods.getRewardsMultiplier().call({}, blockNumber - 1)
        )
        return targetValidatorEpochPayment
          .times(fromFixed(score))
          .times(fromFixed(rewardsMultiplier))
      }

      for (const blockNumber of blockNumbers) {
        let expectUnchangedBalances: string[]
        let expectChangedBalances: string[]
        if (isLastBlockOfEpoch(blockNumber, epoch)) {
          expectChangedBalances = await getValidatorSetAccountsAtBlock(blockNumber)
          expectUnchangedBalances = validatorAccounts.filter(
            (x) => !expectChangedBalances.includes(x)
          )
        } else {
          expectUnchangedBalances = validatorAccounts
          expectChangedBalances = []
        }

        for (const validator of expectUnchangedBalances) {
          await assertBalanceUnchanged(validator, blockNumber)
        }

        let expectedGroupPayment = new BigNumber(0)
        for (const validator of expectChangedBalances) {
          const expectedTotalPayment = await getExpectedTotalPayment(validator, blockNumber)
          const groupPayment = expectedTotalPayment.times(commission)
          await assertBalanceChanged(
            validator,
            blockNumber,
            expectedTotalPayment.minus(groupPayment),
            stableToken
          )
          expectedGroupPayment = expectedGroupPayment.plus(groupPayment)
        }
        await assertBalanceChanged(group, blockNumber, expectedGroupPayment, stableToken)
      }
    })

    it('should distribute epoch rewards at the end of each epoch', async function (this: any) {
      this.timeout(0)
      const lockedPlanq = await kit._web3Contracts.getLockedPlanq()
      const governance = await kit._web3Contracts.getGovernance()
      const gasPriceMinimum = await kit._web3Contracts.getGasPriceMinimum()
      const [group] = await validators.methods.getRegisteredValidatorGroups().call()

      const assertVotesChanged = async (blockNumber: number, expected: BigNumber) => {
        const currentVotes = new BigNumber(
          await election.methods.getTotalVotesForGroup(group).call({}, blockNumber)
        )
        const previousVotes = new BigNumber(
          await election.methods.getTotalVotesForGroup(group).call({}, blockNumber - 1)
        )
        const margin = expected.times(tolerance)
        assertAlmostEqual(currentVotes.minus(previousVotes), expected, margin)
      }

      // Returns the gas fee base for a given block, which is distributed to the governance contract.
      const blockBaseGasFee = async (blockNumber: number): Promise<BigNumber> => {
        const gas = (await web3.eth.getBlock(blockNumber)).gasUsed
        // @ts-ignore - TODO: remove when web3 upgrade completed
        const gpm = await gasPriceMinimum.methods.gasPriceMinimum().call({}, blockNumber)
        return new BigNumber(gpm).times(new BigNumber(gas))
      }

      const assertLockedPlanqBalanceChanged = async (blockNumber: number, expected: BigNumber) => {
        await assertBalanceChanged(lockedPlanq.options.address, blockNumber, expected, planqToken)
      }

      const assertGovernanceBalanceChanged = async (blockNumber: number, expected: BigNumber) => {
        await assertBalanceChanged(governance.options.address, blockNumber, expected, planqToken)
      }

      const assertReserveBalanceChanged = async (blockNumber: number, expected: BigNumber) => {
        await assertBalanceChanged(reserve.options.address, blockNumber, expected, planqToken)
      }

      const assertCarbonOffsettingBalanceChanged = async (
        blockNumber: number,
        expected: BigNumber
      ) => {
        await assertBalanceChanged(carbonOffsettingPartnerAddress, blockNumber, expected, planqToken)
      }

      const assertVotesUnchanged = async (blockNumber: number) => {
        await assertVotesChanged(blockNumber, new BigNumber(0))
      }

      const assertLockedPlanqBalanceUnchanged = async (blockNumber: number) => {
        await assertLockedPlanqBalanceChanged(blockNumber, new BigNumber(0))
      }

      const assertReserveBalanceUnchanged = async (blockNumber: number) => {
        await assertReserveBalanceChanged(blockNumber, new BigNumber(0))
      }

      const assertCarbonOffsettingBalanceUnchanged = async (blockNumber: number) => {
        await assertCarbonOffsettingBalanceChanged(blockNumber, new BigNumber(0))
      }

      const getStableTokenSupplyChange = async (blockNumber: number) => {
        const currentSupply = new BigNumber(
          await stableToken.methods.totalSupply().call({}, blockNumber)
        )
        const previousSupply = new BigNumber(
          await stableToken.methods.totalSupply().call({}, blockNumber - 1)
        )
        return currentSupply.minus(previousSupply)
      }

      const getStableTokenExchangeRate = async (blockNumber: number) => {
        const rate = await sortedOracles.methods
          .medianRate(stableToken.options.address)
          .call({}, blockNumber)
        return new BigNumber(rate[0]).div(rate[1])
      }

      for (const blockNumber of blockNumbers) {
        if (isLastBlockOfEpoch(blockNumber, epoch)) {
          // We use the number of active votes from the previous block to calculate the expected
          // epoch reward as the number of active votes for the current block will include the
          // epoch reward.
          const activeVotes = new BigNumber(
            await election.methods.getActiveVotes().call({}, blockNumber - 1)
          )
          assert.isFalse(activeVotes.isZero())

          // We need to calculate the rewards multiplier for the previous block, before
          // the rewards actually are awarded.
          const rewardsMultiplier = new BigNumber(
            await epochRewards.methods.getRewardsMultiplier().call({}, blockNumber - 1)
          )
          assert.isFalse(rewardsMultiplier.isZero())

          // This is the array of rewards that should have been distributed
          const targetRewards = await epochRewards.methods
            .calculateTargetEpochRewards()
            .call({}, blockNumber - 1)
          // This is with reward multiplier
          const perValidatorReward = new BigNumber(targetRewards[0])
          const validatorSetSize = await election.methods
            .numberValidatorsInCurrentSet()
            .call({}, blockNumber - 1)
          const exchangeRate = await getStableTokenExchangeRate(blockNumber)
          // Calculate total validator reward in planq to calc infra reward
          const maxPotentialValidatorReward = perValidatorReward
            .times(validatorSetSize)
            .div(exchangeRate)
          // Calculate the expected voting reward
          const targetVotingYield = new BigNumber(
            (await epochRewards.methods.getTargetVotingYieldParameters().call({}, blockNumber))[0]
          )
          assert.isFalse(targetVotingYield.isZero())
          const expectedVoterRewards = activeVotes
            .times(fromFixed(targetVotingYield))
            .times(fromFixed(rewardsMultiplier))

          // infra: (x / (1 - x)) * predicted supply increase * rewards mult
          const communityRewardFrac = new BigNumber(
            await epochRewards.methods.getCommunityRewardFraction().call({}, blockNumber)
          )
          const carbonOffsettingFrac = new BigNumber(
            await epochRewards.methods.getCarbonOffsettingFraction().call({}, blockNumber)
          )

          const fundFactor = new BigNumber(1)
            .minus(fromFixed(communityRewardFrac))
            .minus(fromFixed(carbonOffsettingFrac))

          const expectedCommunityReward = expectedVoterRewards
            .plus(maxPotentialValidatorReward)
            .times(fromFixed(communityRewardFrac))
            .div(fundFactor)

          const expectedCarbonOffsettingPartnerAward = expectedVoterRewards
            .plus(maxPotentialValidatorReward)
            .times(fromFixed(carbonOffsettingFrac))
            .div(fundFactor)

          const stableTokenSupplyChange = await getStableTokenSupplyChange(blockNumber)
          const expectedPlanqTotalSupplyChange = expectedCommunityReward
            .plus(expectedVoterRewards)
            .plus(expectedCarbonOffsettingPartnerAward)
            .plus(stableTokenSupplyChange.div(exchangeRate))
          // Check TS calc'd rewards against solidity calc'd rewards
          const totalVoterRewards = new BigNumber(targetRewards[1])
          const totalCommunityReward = new BigNumber(targetRewards[2])
          const carbonOffsettingPartnerAward = new BigNumber(targetRewards[3])
          assertAlmostEqual(expectedVoterRewards, totalVoterRewards)
          assertAlmostEqual(expectedCommunityReward, totalCommunityReward)
          assertAlmostEqual(expectedCarbonOffsettingPartnerAward, carbonOffsettingPartnerAward)
          // Check TS calc'd rewards against what happened
          await assertVotesChanged(blockNumber, expectedVoterRewards)
          await assertLockedPlanqBalanceChanged(blockNumber, expectedVoterRewards)
          await assertGovernanceBalanceChanged(
            blockNumber,
            expectedCommunityReward.plus(await blockBaseGasFee(blockNumber))
          )
          await assertReserveBalanceChanged(blockNumber, stableTokenSupplyChange.div(exchangeRate))
          await assertPlanqTokenTotalSupplyChanged(blockNumber, expectedPlanqTotalSupplyChange)
          await assertCarbonOffsettingBalanceChanged(
            blockNumber,
            expectedCarbonOffsettingPartnerAward
          )
        } else {
          await assertVotesUnchanged(blockNumber)
          await assertPlanqTokenTotalSupplyUnchanged(blockNumber)
          await assertLockedPlanqBalanceUnchanged(blockNumber)
          await assertReserveBalanceUnchanged(blockNumber)
          await assertGovernanceBalanceChanged(blockNumber, await blockBaseGasFee(blockNumber))
          await assertCarbonOffsettingBalanceUnchanged(blockNumber)
        }
      }
    })

    it('should update the target voting yield', async () => {
      for (const blockNumber of blockNumbers) {
        if (isLastBlockOfEpoch(blockNumber, epoch)) {
          // We use the voting planq fraction from before the rewards are granted.
          const votingPlanqFraction = new BigNumber(
            await epochRewards.methods.getVotingPlanqFraction().call({}, blockNumber - 1)
          )
          const targetVotingPlanqFraction = new BigNumber(
            await epochRewards.methods.getTargetVotingPlanqFraction().call({}, blockNumber)
          )
          const difference = targetVotingPlanqFraction.minus(votingPlanqFraction)
          const adjustmentFactor = fromFixed(
            new BigNumber(
              (await epochRewards.methods.getTargetVotingYieldParameters().call({}, blockNumber))[2]
            )
          )
          const delta = difference.times(adjustmentFactor)
          await assertTargetVotingYieldChanged(blockNumber, delta)
        } else {
          await assertTargetVotingYieldUnchanged(blockNumber)
        }
      }
    })

    it('should have emitted the correct events when paying epoch rewards', async () => {
      const currentBlock = (await web3.eth.getBlock('latest')).number
      const events = [
        {
          contract: epochRewards,
          name: 'TargetVotingYieldUpdated',
        },
        {
          contract: validators,
          name: 'ValidatorEpochPaymentDistributed',
        },
        {
          contract: validators,
          name: 'ValidatorScoreUpdated',
        },
        {
          contract: election,
          name: 'EpochRewardsDistributedToVoters',
        },
      ]
      for (const event of events) {
        const eventLogs = await event.contract.getPastEvents(event.name, {
          fromBlock: currentBlock - 10,
          currentBlock,
        })
        assert(
          eventLogs.every((a: any) => a.blockNumber % 10 === 0),
          `every ${event.name} event occured on the last block of the epoch`
        )
        assert(eventLogs.length > 0, `at least one ${event.name} event occured`)
      }
    })
  })

  describe('when rotating keys', () => {
    const blockNumbers: number[] = []
    const miners: string[] = []
    const rotation0PrivateKey = '0xa42ac9c99f6ab2c96ee6cae1b40d36187f65cd878737f6623cd363fb94ba7087'
    const rotation1PrivateKey = '0x4519cae145fb9499358be484ca60c80d8f5b7f9c13ff82c88ec9e13283e9de1a'

    const rotation0Address = privateKeyToAddress(rotation0PrivateKey)
    const rotation1Address = privateKeyToAddress(rotation1PrivateKey)

    let epoch: number
    let validatorAccounts: string[]

    before(async function (this: any) {
      this.timeout(0) // Disable test timeout

      await restart()

      const groupPrivateKey = await getValidatorGroupPrivateKey()

      const validatorGroup: GethInstanceConfig = {
        name: 'validatorGroup',
        validating: false,
        syncmode: 'full',
        port: 30313,
        wsport: 8555,
        rpcport: 8557,
        privateKey: groupPrivateKey.slice(2),
      }

      await initAndStartGeth(gethConfig, hooks.gethBinaryPath, validatorGroup, verbose)

      await connectPeers([...gethConfig.instances, validatorGroup], verbose)

      console.log('wait for validatorGroup to finish syncing')
      await waitToFinishInstanceSyncing(validatorGroup)

      const additionalValidatingNodes: GethInstanceConfig[] = [
        {
          name: 'validator2KeyRotation0',
          validating: true,
          syncmode: 'full',
          lightserv: false,
          port: 30315,
          wsport: 8559,
          rpcport: 9559,
          privateKey: rotation0PrivateKey.slice(2),
          minerValidator: privateKeyToAddress(rotation0PrivateKey.slice(2)),
        },
        {
          name: 'validator2KeyRotation1',
          validating: true,
          syncmode: 'full',
          lightserv: false,
          port: 30317,
          wsport: 8561,
          rpcport: 9561,
          privateKey: rotation1PrivateKey.slice(2),
          minerValidator: privateKeyToAddress(rotation1PrivateKey.slice(2)),
        },
      ]

      await Promise.all(
        additionalValidatingNodes.map((nodeConfig: GethInstanceConfig) =>
          initAndStartGeth(gethConfig, hooks.gethBinaryPath, nodeConfig, verbose)
        )
      )

      // Connect the validating nodes to the non-validating nodes, to test that announce messages are properly gossiped.
      await connectBipartiteClique(gethConfig.instances, additionalValidatingNodes, verbose)

      console.log('wait for new validators to sync')
      await Promise.all(additionalValidatingNodes.map((i) => waitToFinishInstanceSyncing(i)))

      validatorAccounts = await getValidatorGroupMembers()
      assert.equal(validatorAccounts.length, 5)
      epoch = new BigNumber(await validators.methods.getEpochSize().call()).toNumber()
      assert.equal(epoch, 10)

      console.log('wait for end of epoch')
      // Wait for an epoch transition to ensure everyone is connected to one another.
      await waitForEpochTransition(web3, epoch)

      const groupWeb3Url = 'ws://localhost:8555'
      const groupWeb3 = new Web3(groupWeb3Url)

      const groupKit = newKitFromWeb3(groupWeb3)

      // Prepare for key rotation.
      const validatorRpc = 'http://localhost:8549'
      const validatorWeb3 = new Web3(validatorRpc)
      const authWeb31 = 'ws://localhost:8559'
      const authWeb32 = 'ws://localhost:8561'
      const authorizedKits = [
        newKitFromWeb3(new Web3(authWeb31)),
        newKitFromWeb3(new Web3(authWeb32)),
      ]
      const authorizedPrivateKeys = [rotation0PrivateKey, rotation1PrivateKey]
      const keyRotator = await newKeyRotator(
        newKitFromWeb3(validatorWeb3),
        authorizedKits,
        authorizedPrivateKeys
      )

      const handled: any = {}

      let errorWhileChangingValidatorSet = ''
      let lastRotated = 0
      const changeValidatorSet = async (header: any) => {
        try {
          if (handled[header.number]) {
            return
          }
          handled[header.number] = true
          blockNumbers.push(header.number)
          miners.push(header.miner)
          // At the start of epoch N, perform actions so the validator set is different for epoch N + 1.
          // Note that all of these actions MUST complete within the epoch.
          if (
            header.number % 10 === 0 &&
            errorWhileChangingValidatorSet === '' &&
            lastRotated + 60 <= header.number
          ) {
            // 1. Swap validator0 and validator1 so one is a member of the group and the other is not.
            // 2. Rotate keys for validator 2 by authorizing a new validating key.
            lastRotated = header.number
            await keyRotator.rotate()
          }
        } catch (e: any) {
          console.error(e)
          errorWhileChangingValidatorSet = e.toString()
        }
      }

      const subscription = groupKit.connection.web3.eth.subscribe('newBlockHeaders')
      subscription.on('data', changeValidatorSet)

      // Wait for a few epochs while changing the validator set.
      while (blockNumbers.length < 180) {
        // Prepare for member swapping.
        await sleep(epoch)
      }
      ;(subscription as any).unsubscribe()

      // Wait for the current epoch to complete.
      await sleep(epoch)
      assert.equal(errorWhileChangingValidatorSet, '')
    })

    it('validator 0 should have signed at least one block', async () => {
      const rotation0MinedBlock = miners.some((a) => eqAddress(a, rotation0Address))
      if (!rotation0MinedBlock) {
        console.log(rotation0Address, rotation1Address, miners)
      }
      assert.isTrue(rotation0MinedBlock)
    })

    it('validator 1 should have signed at least one block', async () => {
      const rotation1MinedBlock = miners.some((a) => eqAddress(a, rotation1Address))
      if (!rotation1MinedBlock) {
        console.log(rotation0Address, rotation1Address, miners)
      }
      assert.isTrue(rotation1MinedBlock)
    })
  })

  describe('when rewards distribution is frozen', () => {
    let epoch: number
    let blockFrozen: number
    let latestBlock: number

    before(async function (this: any) {
      this.timeout(0)
      await restart()
      const validator = (await kit.connection.getAccounts())[0]
      await kit.connection.web3.eth.personal.unlockAccount(validator, '', 1000000)
      const freezer = await kit._web3Contracts.getFreezer()
      await freezer.methods.freeze(epochRewards.options.address).send({ from: validator })
      blockFrozen = await kit.connection.getBlockNumber()
      epoch = new BigNumber(await validators.methods.getEpochSize().call()).toNumber()
      await waitForBlock(kit.connection.web3, blockFrozen + epoch * 2)
      latestBlock = await kit.connection.getBlockNumber()
    })

    it('should not update the target voing yield', async () => {
      for (let blockNumber = blockFrozen; blockNumber < latestBlock; blockNumber++) {
        await assertTargetVotingYieldUnchanged(blockNumber)
      }
    })

    it('should not mint new Planq', async () => {
      for (let blockNumber = blockFrozen; blockNumber < latestBlock; blockNumber++) {
        await assertPlanqTokenTotalSupplyUnchanged(blockNumber)
      }
    })
  })
})
