// tslint:disable-next-line: no-reference (Required to make this work w/ ts-node)
import { PlanqTxPending, PlanqTxReceipt, TransactionResult } from '@planq-network/connect'
import { ContractKit, newKitFromWeb3 } from '@planq-network/contractkit'
import { PlanqTokenType, EachPlanqToken, StableToken, Token } from '@planq-network/contractkit/lib/planq-tokens'
import { eqAddress, toChecksumAddress } from '@planq-network/utils/lib/address'
import { toFixed } from '@planq-network/utils/lib/fixidity'
import BigNumber from 'bignumber.js'
import { assert } from 'chai'
import Web3 from 'web3'
import { GethInstanceConfig } from '../lib/interfaces/geth-instance-config'
import { GethRunConfig } from '../lib/interfaces/geth-run-config'
import { getHooks, initAndSyncGethWithRetry, killInstance, sleep } from './utils'

const TMP_PATH = '/tmp/e2e'
const verbose = false

/**
 * Helper Class to change StableToken Inflation in tests
 */
class InflationManager {
  private kit: ContractKit
  private readonly minUpdateDelay = 10

  constructor(
    readonly validatorUri: string,
    readonly validatorAddress: string,
    readonly token: StableToken
  ) {
    this.kit = newKitFromWeb3(new Web3(validatorUri))
    this.kit.connection.defaultAccount = validatorAddress
  }

  now = async (): Promise<number> => {
    return Number((await this.kit.connection.getBlock('pending')).timestamp)
  }

  getNextUpdateRate = async (): Promise<number> => {
    const stableToken = await this.getStableToken()
    // Compute necessary `updateRate` so inflationFactor adjusment takes place on next operation
    const { factorLastUpdated } = await stableToken.getInflationParameters()

    // Wait until the minimum update delay has passed so we can set a rate that gives us some
    // buffer time to make the transaction in the next availiable update window.
    let timeSinceLastUpdated = (await this.now()) - factorLastUpdated.toNumber()
    while (timeSinceLastUpdated < this.minUpdateDelay) {
      await sleep(this.minUpdateDelay - timeSinceLastUpdated)
      timeSinceLastUpdated = (await this.now()) - factorLastUpdated.toNumber()
    }

    return timeSinceLastUpdated
  }

  getParameters = async () => {
    const stableToken = await this.getStableToken()
    return stableToken.getInflationParameters()
  }

  setInflationRateForNextTransfer = async (rate: BigNumber) => {
    // Possibly update the inflation factor and ensure it won't update again.
    await this.setInflationParameters(new BigNumber(1), Number.MAX_SAFE_INTEGER)

    const updateRate = await this.getNextUpdateRate()
    await this.setInflationParameters(rate, updateRate)
  }

  setInflationParameters = async (rate: BigNumber, updatePeriod: number) => {
    const stableToken = await this.getStableToken()
    await stableToken
      .setInflationParameters(toFixed(rate).toFixed(), updatePeriod.toFixed())
      .sendAndWaitForReceipt({ from: this.validatorAddress })
  }

  getStableToken = async () => {
    return this.kit.planqTokens.getWrapper(this.token)
  }
}

const setIntrinsicGas = async (validatorUri: string, validatorAddress: string, gasCost: number) => {
  const kit = newKitFromWeb3(new Web3(validatorUri))
  const parameters = await kit.contracts.getBlockchainParameters()
  await parameters
    .setIntrinsicGasForAlternativeFeeCurrency(gasCost.toString())
    .sendAndWaitForReceipt({ from: validatorAddress })
}

// Intrinsic gas for a basic transaction
const INTRINSIC_TX_GAS_COST = 21000

// Additional intrinsic gas for a transaction with fee currency specified
const ADDITIONAL_INTRINSIC_TX_GAS_COST = 50000

// If the To address has zero as the balance, the cost of writting that address is
const sstoreSetGasEIP2200 = 20000
const sstoreResetGasEIP2200 = 5000
const coldSloadCostEIP2929 = 800 // The Eip2929 set this to 2100, but our Cip48 back to 800
const coldAccountAccessCostEIP2929 = 900 // The Eip2929 set this to 2600, but our Cip48 back to 900
const warmStorageReadCostEIP2929 = 100 // Eip2929 and Cip48

// This number represent the gasUsed in the execution of the StableToken transfer assuming:
// - Nothing was preloaded in the state accessList, so the first storage calls will cost:
//    * ColdSloadCostEIP2929 = 800
//    * ColdAccountAccessCostEIP2929 = 900
// - The From and To address
//     * HAVE funds
//     * non of those will be zero after the transfer
//     * non those were modified before (as part of the same tx)
//     * This means that both SSTORE (From and To) will cost:
//         SstoreResetGasEIP2200 [5000] - ColdSloadCostEIP2929 [800] => 4200
// - No intrinsic gas involved BUT 630 gas charged for the amount of bytes sent
const basicStableTokenTransferGasCost = 31253

// As the basicStableTokenTransferGasCost assumes that the transfer TO have funds, we should
// only add the difference to calculate the gas (sstoreSetGasEIP2200 - 4200) => 15800
const emptyFundsBeforeForBasicCalc =
  sstoreSetGasEIP2200 - (sstoreResetGasEIP2200 - coldSloadCostEIP2929) // 15800

// The StableToken transfer, paid with the same StableToken, preloads a lot of state
// when the fee is subsctracted from the account, which generates that the basicStableTokenTransferGasCost
// cost less. The actual differences:
// - SLOADS ColdSloadCostEIP2929 -> WarmStorageReadCostEIP2929 (-700 each)
//   * 6 from the stableToken contract
//   * 2 from the planqRegistry contract
//   * 2 from the Freeze contract
// - Account Check ( EXTCODEHASH | EXTCODESIZE | ext BALANCE)
//          coldAccountAccessCostEIP2929 -> WarmStorageReadCostEIP2929 (-800 each)
//   * 3 from the stableToken contract
//   * 1 from the planqRegistry contract
//   * 1 from the Freeze contract
// - The From account as already modified the state for that address
//   * This will make that instead of SstoreResetGasEIP2200 [5000] - ColdSloadCostEIP2929 [800] => 4200
//     will cost WarmStorageReadCostEIP2929 [100] (-4100)
const savingGasStableTokenTransferPaidWithSameStable =
  (coldSloadCostEIP2929 - warmStorageReadCostEIP2929) * 10 +
  (coldAccountAccessCostEIP2929 - warmStorageReadCostEIP2929) * 5 +
  (sstoreResetGasEIP2200 - coldSloadCostEIP2929 - warmStorageReadCostEIP2929) // 15100

/** Helper to watch balance changes over accounts */
interface BalanceWatcher {
  update(): Promise<void>

  delta(address: string, token: PlanqTokenType): BigNumber

  current(address: string, token: PlanqTokenType): BigNumber

  initial(address: string, token: PlanqTokenType): BigNumber

  debugPrint(address: string, token: PlanqTokenType): void
}

async function newBalanceWatcher(kit: ContractKit, accounts: string[]): Promise<BalanceWatcher> {
  async function fetch() {
    const balances: Record<string, EachPlanqToken<BigNumber>> = {}
    await Promise.all(
      accounts.map(async (a) => {
        balances[a] = await kit.planqTokens.balancesOf(a)
      })
    )
    return balances
  }

  const initial = await fetch()
  let current = initial
  return {
    async update() {
      current = await fetch()
    },
    delta(address: string, token: PlanqTokenType) {
      return (current[address][token] || new BigNumber(0)).minus(initial[address][token] || 0)
    },
    current(address: string, token: PlanqTokenType) {
      return current[address][token] || new BigNumber(0)
    },
    initial(address: string, token: PlanqTokenType) {
      return initial[address][token] || new BigNumber(0)
    },
    debugPrint(address: string, token: PlanqTokenType) {
      // tslint:disable-next-line: no-console
      console.log({
        initial: initial[address][token]?.toString(),
        current: current[address][token]?.toString(),
        delta: (current[address][token] || new BigNumber(0))
          .minus(initial[address][token] || 0)
          .toString(),
      })
    },
  }
}

function assertEqualBN(value: BigNumber, expected: BigNumber) {
  assert.equal(value.toString(), expected.toString())
}

describe('Transfer tests', function (this: any) {
  this.timeout(0)

  let kit: ContractKit
  const TransferAmount: BigNumber = new BigNumber(Web3.utils.toWei('1', 'ether'))

  let currentGethInstance: GethInstanceConfig

  let governanceAddress: string // set later on using the contract itself
  const validatorAddress = '0x47e172f6cfb6c7d01c1574fa3e2be7cc73269d95'
  const DEF_FROM_PK = 'f2f48ee19680706196e2e339e5da3491186e0c4c5030670656b0e0164837257d'
  const FromAddress = '0x5409ed021d9299bf6814279a6a1411a7e866a631'

  // Arbitrary addresses.
  const txFeeRecipientAddress = '0x5555555555555555555555555555555555555555'
  const ToAddress = '0xbBae99F0E1EE565404465638d40827b54D343638'
  const gatewayFeeRecipientAddress = '0x4f5f8a3f45d179553e7b95119ce296010f50f6f1'

  const syncModes = ['full', 'fast', 'light', 'lightest']
  const gethConfig: GethRunConfig = {
    migrate: true,
    networkId: 1101,
    network: 'local',
    runPath: TMP_PATH,
    genesisConfig: {
      churritoBlock: 0,
      donutBlock: 0,
      espressoBlock: 0,
    },
    instances: [
      {
        name: 'validator',
        validating: true,
        minerValidator: validatorAddress,
        // Separate address for tx fees, so that we can easy identify balance changes due to them
        txFeeRecipient: txFeeRecipientAddress,
        syncmode: 'full',
        port: 30303,
        rpcport: 8545,
      },
    ],
  }

  const hooks = getHooks(gethConfig)

  before(async function (this: any) {
    this.timeout(0)
    await hooks.before()
  })

  after(async function (this: any) {
    this.timeout(0)
    await hooks.after()
  })

  // Spin up a node that we can sync with.
  const fullInstance: GethInstanceConfig = {
    name: 'txFull',
    validating: false,
    syncmode: 'full',
    lightserv: true,
    gatewayFee: new BigNumber(10000),
    port: 30305,
    rpcport: 8547,
    // We need to set an etherbase here so that the full node will accept transactions from
    // light clients.
    minerValidator: gatewayFeeRecipientAddress,
    txFeeRecipient: gatewayFeeRecipientAddress,
  }

  const restartWithCleanNodes = async () => {
    await hooks.restart()

    kit = newKitFromWeb3(new Web3('http://localhost:8545'))
    kit.connection.defaultGasInflationFactor = 1

    // TODO(mcortesi): magic sleep. without it unlockAccount sometimes fails
    await sleep(2)
    // Assuming empty password
    await kit.connection.web3.eth.personal.unlockAccount(validatorAddress, '', 1000000)

    await initAndSyncGethWithRetry(
      gethConfig,
      hooks.gethBinaryPath,
      fullInstance,
      [...gethConfig.instances, fullInstance],
      verbose,
      3
    )

    governanceAddress = (await kit._web3Contracts.getGovernance()).options.address
    // The tests below check the balance of the governance contract (i.e. the community fund)
    // before and after transactions to verify the correct amount has been received from the fees.
    // This causes flakiness due to the fund also receiving epoch rewards (if the epoch change is
    // between the blocks the balance checker uses as its before and after the test will fail due
    // to the unexpected change from the epoch rewards).
    // To avoid this, we set the community fund's fraction of epoch rewards to zero.
    // Another option would have been to make the epoch size large enough so no epoch changes happen
    // during the test.
    const epochRewards = await kit._web3Contracts.getEpochRewards()
    await epochRewards.methods.setCommunityRewardFraction(0).send({ from: validatorAddress })

    // Give the account we will send transfers as sufficient planq and dollars.
    const startBalance = TransferAmount.times(500)
    const resDollars = await transferPlanqDollars(validatorAddress, FromAddress, startBalance)
    const resPlanq = await transferPlanqPlanq(validatorAddress, FromAddress, startBalance)
    await Promise.all([resDollars.waitReceipt(), resPlanq.waitReceipt()])
  }

  const startSyncNode = async (syncmode: string) => {
    if (currentGethInstance != null) {
      await killInstance(currentGethInstance)
    }

    const light = syncmode === 'light' || syncmode === 'lightest'
    currentGethInstance = {
      name: syncmode,
      validating: false,
      syncmode,
      port: 30307,
      rpcport: 8549,
      lightserv: !light,
      // TODO(nategraf): Remove this when light clients can query for gateway fee.
      gatewayFee: light ? new BigNumber(10000) : undefined,
      privateKey: DEF_FROM_PK,
    }

    // Spin up the node to run transfers as.
    await initAndSyncGethWithRetry(
      gethConfig,
      hooks.gethBinaryPath,
      currentGethInstance,
      [fullInstance, currentGethInstance],
      verbose,
      3
    )

    // Reset contracts to send RPCs through transferring node.
    kit.connection.setProvider(new Web3.providers.HttpProvider('http://localhost:8549'))

    // Give the node time to sync the latest block.
    const upstream = await new Web3('http://localhost:8545').eth.getBlock('latest')
    while ((await kit.connection.getBlock('latest')).number < upstream.number) {
      await sleep(0.5)
    }

    // Unlock Node account
    await kit.connection.web3.eth.personal.unlockAccount(FromAddress, '', 1000000)
  }

  const transferPlanqPlanq = async (
    fromAddress: string,
    toAddress: string,
    amount: BigNumber,
    txOptions: {
      gas?: number
      gasPrice?: string
      feeCurrency?: string
      gatewayFeeRecipient?: string
      gatewayFee?: string
    } = {}
  ) => {
    const res = await kit.connection.sendTransaction({
      from: fromAddress,
      to: toAddress,
      value: amount.toString(),
      ...txOptions,
    })
    return res
  }

  const transferPlanqDollars = async (
    fromAddress: string,
    toAddress: string,
    amount: BigNumber,
    txOptions: {
      gas?: number
      gasPrice?: string
      feeCurrency?: string
      gatewayFeeRecipient?: string
      gatewayFee?: string
    } = {}
  ) => {
    const kitStableToken = await kit.contracts.getStableToken()
    const res = await kitStableToken.transfer(toAddress, amount.toString()).send({
      from: fromAddress,
      ...txOptions,
    })

    return res
  }

  const getGasPriceMinimum = async (feeCurrency: string | undefined) => {
    const gasPriceMinimum = await kit._web3Contracts.getGasPriceMinimum()
    if (feeCurrency) {
      return gasPriceMinimum.methods.getGasPriceMinimum(feeCurrency).call()
    } else {
      return gasPriceMinimum.methods.gasPriceMinimum().call()
    }
  }

  interface Fees {
    total: BigNumber
    tip: BigNumber
    base: BigNumber
  }

  interface GasUsage {
    used?: number
    expected: number
  }

  interface TestTxResults {
    ok: boolean
    fees: Fees
    gas: GasUsage
    events: any[]
  }

  const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'

  function truncateTopic(hex: string) {
    return '0x' + hex.substring(26)
  }

  function parseEvents(receipt: PlanqTxReceipt | undefined) {
    if (!receipt) {
      return []
    }
    if (receipt.events && receipt.events.Transfer) {
      let events: any = receipt.events.Transfer
      if (!(events instanceof Array)) {
        events = [events]
      }
      return events.map((a: any) => ({ to: a.returnValues.to, from: a.returnValues.from }))
    }
    if (receipt.logs) {
      return receipt.logs
        .filter((a) => a.topics[0] === TRANSFER_TOPIC)
        .map((a) => ({ to: truncateTopic(a.topics[2]), from: truncateTopic(a.topics[1]) }))
    }
  }

  const runTestTransaction = async (
    txResult: TransactionResult,
    expectedGasUsed: number,
    feeCurrency?: string
  ): Promise<TestTxResults> => {
    const minGasPrice = await getGasPriceMinimum(feeCurrency)
    assert.isAbove(parseInt(minGasPrice, 10), 0)

    let ok = false
    let receipt: PlanqTxReceipt | undefined
    try {
      receipt = await txResult.waitReceipt()
      ok = true
    } catch (err) {
      ok = false
    }

    const events = parseEvents(receipt)

    if (receipt != null && receipt.gasUsed !== expectedGasUsed) {
      // tslint:disable-next-line: no-console
      console.log('OOPSS: Different Gas', receipt.gasUsed, expectedGasUsed)
    }

    const gasVal = receipt ? receipt.gasUsed : expectedGasUsed
    assert.isAbove(gasVal, 0)
    const txHash = await txResult.getHash()
    const tx: PlanqTxPending = await kit.connection.getTransaction(txHash)
    assert.isAbove(parseInt(tx.gasPrice, 10), 0)
    const txFee = new BigNumber(gasVal).times(tx.gasPrice)
    const txFeeBase = new BigNumber(gasVal).times(minGasPrice)
    const txFeeTip = txFee.minus(txFeeBase)

    const fees: Fees = {
      total: txFee,
      base: txFeeBase,
      tip: txFeeTip,
    }
    const gas: GasUsage = {
      used: receipt && receipt.gasUsed,
      expected: expectedGasUsed,
    }
    return { ok, fees, gas, events }
  }

  function testTxPoolFiltering({
    feeToken,
    gas,
    expectedError,
  }: {
    feeToken: PlanqTokenType
    gas: number
    expectedError: string
  }) {
    it('should not add the transaction to the pool', async () => {
      const feeCurrency = await kit.planqTokens.getFeeCurrencyAddress(feeToken)
      try {
        const res = await transferPlanqPlanq(FromAddress, ToAddress, TransferAmount, {
          gas,
          feeCurrency,
        })
        await res.waitReceipt()
        assert.fail('no error was thrown')
      } catch (error: any) {
        assert.include(error.toString(), expectedError)
      }
    })
  }

  const toTemplate = '0xbBae99F0E1EE565404465638d40827b54D343' // last 3 hex digits trimmed
  // Starts with 1, otherwise the address could have the last byte as 00 which would change
  // the gas consumption
  let toCounter = 1

  function generateCleanAddress(): string {
    toCounter += 1
    // avoid the '00' at the end (check toCounter comment)
    toCounter = toCounter % 100 === 0 ? toCounter + 1 : toCounter

    return toChecksumAddress(toTemplate + toCounter.toString().padStart(3, '0'))
  }

  function testTwiceFirstAndSecondFundToANewAddress(testObject: {
    transferToken: PlanqTokenType
    feeToken: PlanqTokenType
    expectedGas: number
    expectSuccess?: boolean
    txOptions?: {
      gas?: number
      gatewayFeeRecipient?: string
      gatewayFee?: string
    }
    fromAddress?: string
    toAddress?: string
  }) {
    const expectedGasAux = testObject.expectedGas
    testObject.toAddress = generateCleanAddress()
    // Add the fee to save to an empty address
    testObject.expectedGas += emptyFundsBeforeForBasicCalc
    describe('first fund to the To account', () => {
      testTransferToken(testObject)
    })
    testObject.expectedGas = expectedGasAux
    describe('second fund to the To account', () => {
      testTransferToken(testObject)
    })
  }

  function testTransferToken({
    transferToken,
    feeToken,
    expectedGas,
    txOptions,
    expectSuccess = true,
    fromAddress = FromAddress,
    toAddress = ToAddress,
  }: {
    transferToken: PlanqTokenType
    feeToken: PlanqTokenType
    expectedGas: number
    expectSuccess?: boolean
    txOptions?: {
      gas?: number
      gatewayFeeRecipient?: string
      gatewayFee?: string
    }
    fromAddress?: string
    toAddress?: string
  }) {
    let txRes: TestTxResults
    let balances: BalanceWatcher

    before(async () => {
      const feeCurrency = await kit.planqTokens.getFeeCurrencyAddress(feeToken)

      const accounts = [
        fromAddress,
        toAddress,
        txFeeRecipientAddress,
        gatewayFeeRecipientAddress,
        governanceAddress,
      ]
      balances = await newBalanceWatcher(kit, accounts)

      const transferFn = transferToken === StableToken.pUSD ? transferPlanqDollars : transferPlanqPlanq
      const txResult = await transferFn(fromAddress, toAddress, TransferAmount, {
        ...txOptions,
        feeCurrency,
      })

      txRes = await runTestTransaction(txResult, expectedGas, feeCurrency)

      await balances.update()
    })

    if (expectSuccess) {
      it(`should succeed`, () => assert.isTrue(txRes.ok))

      it(`should use the expected amount of gas`, () =>
        assert.equal(txRes.gas.used, txRes.gas.expected))

      it(`should increment the receiver's ${transferToken} balance by the transfer amount`, () =>
        assertEqualBN(balances.delta(toAddress, transferToken), TransferAmount))

      it('should have emitted transfer events for the fee token if not using PLQ', () => {
        if (kit.planqTokens.isStableToken(feeToken)) {
          assert(
            txRes.events.find(
              (a) => eqAddress(a.to, governanceAddress) && eqAddress(a.from, fromAddress)
            )
          )
        }
      })

      if (transferToken === feeToken) {
        it(`should decrement the sender's ${transferToken} balance by the transfer amount plus fees`, () => {
          const expectedBalanceChange = txRes.fees.total.plus(TransferAmount)
          assertEqualBN(balances.delta(fromAddress, transferToken).negated(), expectedBalanceChange)
        })
      } else {
        it(`should decrement the sender's ${transferToken} balance by the transfer amount`, () =>
          assertEqualBN(balances.delta(fromAddress, transferToken).negated(), TransferAmount))

        it(`should decrement the sender's ${feeToken} balance by the total fees`, () =>
          assertEqualBN(balances.delta(fromAddress, feeToken).negated(), txRes.fees.total))
      }
    } else {
      it(`should fail`, () => assert.isFalse(txRes.ok))

      it(`should decrement the sender's ${feeToken} balance by the total fees`, () =>
        assertEqualBN(balances.delta(fromAddress, feeToken).negated(), txRes.fees.total))

      it(`should not change the receiver's ${transferToken} balance`, () => {
        assertEqualBN(
          balances.initial(toAddress, transferToken),
          balances.current(toAddress, transferToken)
        )
      })

      if (transferToken !== feeToken) {
        it(`should not change the sender's ${transferToken} balance`, () => {
          assertEqualBN(
            balances.initial(fromAddress, transferToken),
            balances.current(fromAddress, transferToken)
          )
        })
      }
    }

    it(`should increment the gateway fee recipient's ${feeToken} balance by the gateway fee`, () =>
      assertEqualBN(balances.delta(gatewayFeeRecipientAddress, feeToken), txRes.fees.total))

    it(`should increment the infrastructure fund's ${feeToken} balance by the base portion of the gas fee`, () =>
      assertEqualBN(balances.delta(governanceAddress, feeToken), txRes.fees.base))

    it(`should increment the tx fee recipient's ${feeToken} balance by the rest of the gas fee`, () => {
      assertEqualBN(balances.delta(txFeeRecipientAddress, feeToken), txRes.fees.tip)
    })
  }
  describe('Normal Transfer >', () => {
    before(restartWithCleanNodes)

    for (const syncMode of syncModes) {
      describe(`${syncMode} Node >`, () => {
        before(`start geth on sync: ${syncMode}`, () => startSyncNode(syncMode))

        describe('Transfer PlanqPlanq >', () => {
          describe('with feeCurrency = PlanqPlanq >', () => {
            if (syncMode === 'light' || syncMode === 'lightest') {
              describe('when running in light/lightest sync mode', () => {
                const recipient = (choice: string) => {
                  switch (choice) {
                    case 'peer':
                      return gatewayFeeRecipientAddress
                    case 'random':
                      return Web3.utils.randomHex(20)
                    default:
                      // unset
                      return undefined
                  }
                }
                const feeValue = (choice: string) => {
                  switch (choice) {
                    case 'sufficient':
                      return '0x10000'
                    case 'insufficient':
                      return '0x1'
                    default:
                      // unset
                      return undefined
                  }
                }
                for (const recipientChoice of ['peer', 'random', 'unset']) {
                  describe(`when the gateway fee recipient is ${recipientChoice}`, () => {
                    for (const feeValueChoice of ['sufficient', 'insufficient', 'unset']) {
                      describe(`when the gateway fee value is ${feeValueChoice}`, () => {
                        const txOptions = {
                          gatewayFeeRecipient: recipient(recipientChoice),
                          gatewayFee: feeValue(feeValueChoice),
                        }
                        if (recipientChoice === 'random' || feeValueChoice === 'insufficient') {
                          it('should get rejected by the sending node before being added to the tx pool', async () => {
                            try {
                              const res = await transferPlanqPlanq(
                                FromAddress,
                                ToAddress,
                                TransferAmount,
                                txOptions
                              )
                              await res.waitReceipt()
                              assert.fail('no error was thrown')
                            } catch (error: any) {
                              assert.include(error.toString(), `Error: no suitable peers available`)
                            }
                          })
                        } else {
                          testTransferToken({
                            expectedGas: INTRINSIC_TX_GAS_COST,
                            transferToken: Token.PLQ,
                            feeToken: Token.PLQ,
                            txOptions,
                          })
                        }
                      })
                    }
                  })
                }
              })
            } else {
              testTransferToken({
                expectedGas: INTRINSIC_TX_GAS_COST,
                transferToken: Token.PLQ,
                feeToken: Token.PLQ,
              })
            }
          })

          describe('feeCurrency = PlanqDollars >', () => {
            const intrinsicGas = INTRINSIC_TX_GAS_COST + ADDITIONAL_INTRINSIC_TX_GAS_COST

            describe('when there is no demurrage', () => {
              describe('when setting a gas amount greater than the amount of gas necessary', () =>
                testTransferToken({
                  expectedGas: intrinsicGas,
                  transferToken: Token.PLQ,
                  feeToken: StableToken.pUSD,
                }))

              describe('when setting a gas amount less than the intrinsic gas amount', () => {
                it('should not add the transaction to the pool', async () => {
                  const gas = intrinsicGas - 1
                  const feeCurrency = await kit.planqTokens.getFeeCurrencyAddress(StableToken.pUSD)
                  try {
                    const res = await transferPlanqPlanq(FromAddress, ToAddress, TransferAmount, {
                      gas,
                      feeCurrency,
                    })
                    await res.getHash()
                    assert.fail('no error was thrown')
                  } catch (error: any) {
                    assert.include(error.toString(), 'Error: intrinsic gas too low')
                  }
                })
              })
            })
          })
        })

        describe('Transfer PlanqDollars', () => {
          describe('feeCurrency = PlanqDollars >', () => {
            testTwiceFirstAndSecondFundToANewAddress({
              expectedGas:
                basicStableTokenTransferGasCost +
                INTRINSIC_TX_GAS_COST +
                ADDITIONAL_INTRINSIC_TX_GAS_COST -
                savingGasStableTokenTransferPaidWithSameStable,
              transferToken: StableToken.pUSD,
              feeToken: StableToken.pUSD,
            })
          })

          describe('feeCurrency = PlanqPlanq >', () => {
            testTwiceFirstAndSecondFundToANewAddress({
              expectedGas: basicStableTokenTransferGasCost + INTRINSIC_TX_GAS_COST,
              transferToken: StableToken.pUSD,
              feeToken: Token.PLQ,
            })
          })
        })
      })
    }
  })

  describe('Transfer with changed intrinsic gas cost >', () => {
    const changedIntrinsicGasForAlternativeFeeCurrency = 34000

    before(restartWithCleanNodes)

    for (const syncMode of syncModes) {
      describe(`${syncMode} Node >`, () => {
        before(`start geth on sync: ${syncMode}`, async () => {
          try {
            await startSyncNode(syncMode)
            await setIntrinsicGas(
              'http://localhost:8545',
              validatorAddress,
              changedIntrinsicGasForAlternativeFeeCurrency
            )
          } catch (err) {
            console.debug('some error', err)
          }
        })

        describe('Transfer PlanqPlanq >', () => {
          describe('feeCurrency = PlanqDollars >', () => {
            const intrinsicGas =
              changedIntrinsicGasForAlternativeFeeCurrency + INTRINSIC_TX_GAS_COST
            describe('when there is no demurrage', () => {
              describe('when setting a gas amount greater than the amount of gas necessary', () =>
                testTransferToken({
                  expectedGas: intrinsicGas,
                  transferToken: Token.PLQ,
                  feeToken: StableToken.pUSD,
                }))

              describe('when setting a gas amount less than the intrinsic gas amount', () => {
                testTxPoolFiltering({
                  gas: intrinsicGas - 1,
                  feeToken: StableToken.pUSD,
                  expectedError: 'Error: intrinsic gas too low',
                })
              })
            })
          })
        })

        describe('Transfer PlanqDollars', () => {
          describe('feeCurrency = PlanqDollars >', () => {
            testTwiceFirstAndSecondFundToANewAddress({
              expectedGas:
                basicStableTokenTransferGasCost +
                changedIntrinsicGasForAlternativeFeeCurrency +
                INTRINSIC_TX_GAS_COST -
                savingGasStableTokenTransferPaidWithSameStable,
              transferToken: StableToken.pUSD,
              feeToken: StableToken.pUSD,
            })
          })
        })
      })
    }
  })

  describe('Transfer with Demurrage >', () => {
    for (const syncMode of syncModes) {
      describe(`${syncMode} Node >`, () => {
        let inflationManager: InflationManager
        before(`start geth on sync: ${syncMode}`, async () => {
          await restartWithCleanNodes()
          inflationManager = new InflationManager(
            'http://localhost:8545',
            validatorAddress,
            StableToken.pUSD
          )
          await startSyncNode(syncMode)
        })

        describe('when there is demurrage of 50% applied', () => {
          describe('when setting a gas amount greater than the amount of gas necessary', () => {
            let balances: BalanceWatcher
            let expectedFees: Fees
            let txRes: TestTxResults

            before(async () => {
              balances = await newBalanceWatcher(kit, [
                FromAddress,
                ToAddress,
                gatewayFeeRecipientAddress,
                governanceAddress,
              ])

              await inflationManager.setInflationRateForNextTransfer(new BigNumber(2))
              const feeCurrency = await kit.planqTokens.getFeeCurrencyAddress(StableToken.pUSD)
              txRes = await runTestTransaction(
                await transferPlanqPlanq(FromAddress, ToAddress, TransferAmount, {
                  feeCurrency,
                }),
                INTRINSIC_TX_GAS_COST + ADDITIONAL_INTRINSIC_TX_GAS_COST,
                feeCurrency
              )

              await balances.update()
              expectedFees = txRes.fees
            })

            it('should succeed', () => assert.isTrue(txRes.ok))

            it('should use the expected amount of gas', () =>
              assert.equal(txRes.gas.used, txRes.gas.expected))

            it("should decrement the sender's Planq balance by the transfer amount", () => {
              assertEqualBN(balances.delta(FromAddress, Token.PLQ).negated(), TransferAmount)
            })

            it("should increment the receiver's Planq balance by the transfer amount", () => {
              assertEqualBN(balances.delta(ToAddress, Token.PLQ), TransferAmount)
            })

            it("should halve the sender's Planq Dollar balance due to demurrage and decrement it by the total fees", () => {
              assertEqualBN(
                balances
                  .initial(FromAddress, StableToken.pUSD)
                  .idiv(2)
                  .minus(balances.current(FromAddress, StableToken.pUSD)),
                expectedFees.total
              )
            })

            it("should halve the gateway fee recipient's Planq Dollar balance then increase it by the gateway fee", () => {
              assertEqualBN(
                balances
                  .current(gatewayFeeRecipientAddress, StableToken.pUSD)
                  .minus(balances.initial(gatewayFeeRecipientAddress, StableToken.pUSD).idiv(2)),
                expectedFees.total
              )
            })

            it("should halve the infrastructure fund's Planq Dollar balance then increment it by the base portion of the gas fees", () => {
              assertEqualBN(
                balances
                  .current(governanceAddress, StableToken.pUSD)
                  .minus(balances.initial(governanceAddress, StableToken.pUSD).idiv(2)),
                expectedFees.base
              )
            })
          })
        })
      })
    }
  })
})
