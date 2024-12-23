import {
  Callback,
  PlanqTx,
  Connection,
  JsonRpcPayload,
  JsonRpcResponse,
  Provider,
} from '@planq-network/connect'
import { privateKeyToAddress } from '@planq-network/utils/lib/address'
import { recoverTransaction } from '@planq-network/wallet-base'
import debugFactory from 'debug'
import Web3 from 'web3'
import { LocalWallet } from './local-wallet'

const debug = debugFactory('kit:txtest:sign')

// Random private keys
const PRIVATE_KEY1 = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
const ACCOUNT_ADDRESS1 = privateKeyToAddress(PRIVATE_KEY1)
const PRIVATE_KEY2 = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890fdeccc'
const ACCOUNT_ADDRESS2 = privateKeyToAddress(PRIVATE_KEY2)

debug(`Private key 1: ${PRIVATE_KEY1}`)
debug(`Account Address 1: ${ACCOUNT_ADDRESS1}`)
debug(`Private key 2: ${PRIVATE_KEY2}`)
debug(`Account Address 2: ${ACCOUNT_ADDRESS2}`)

async function verifyLocalSigning(web3: Web3, planqTransaction: PlanqTx): Promise<void> {
  debug('Signer Testing using Account: %s', planqTransaction.from)
  const signedTransaction = await web3.eth.signTransaction(planqTransaction)
  debug('Singer Testing: Signed transaction %o', signedTransaction)
  const rawTransaction: string = signedTransaction.raw
  const [signedPlanqTransaction, recoveredSigner] = recoverTransaction(rawTransaction)
  debug(
    'Transaction was signed by "%s", recovered signer is "%s"',
    planqTransaction.from,
    recoveredSigner
  )
  expect(recoveredSigner.toLowerCase()).toEqual(planqTransaction.from!.toString().toLowerCase())

  if (planqTransaction.nonce != null) {
    debug(
      'Checking nonce actual: %o expected: %o',
      signedPlanqTransaction.nonce,
      parseInt(planqTransaction.nonce.toString(), 16)
    )
    expect(signedPlanqTransaction.nonce).toEqual(parseInt(planqTransaction.nonce.toString(), 16))
  }
  if (planqTransaction.gas != null) {
    debug(
      'Checking gas actual %o expected %o',
      signedPlanqTransaction.gas,
      parseInt(planqTransaction.gas.toString(), 16)
    )
    expect(signedPlanqTransaction.gas).toEqual(parseInt(planqTransaction.gas.toString(), 16))
  }
  if (planqTransaction.gasPrice != null) {
    debug(
      'Checking gas price actual %o expected %o',
      signedPlanqTransaction.gasPrice,
      parseInt(planqTransaction.gasPrice.toString(), 16)
    )
    expect(signedPlanqTransaction.gasPrice).toEqual(
      parseInt(planqTransaction.gasPrice.toString(), 16)
    )
  }
  if (planqTransaction.feeCurrency != null) {
    debug(
      'Checking fee currency actual %o expected %o',
      signedPlanqTransaction.feeCurrency,
      planqTransaction.feeCurrency
    )
    expect(signedPlanqTransaction.feeCurrency!.toLowerCase()).toEqual(
      planqTransaction.feeCurrency.toLowerCase()
    )
  }
  if (planqTransaction.gatewayFeeRecipient != null) {
    debug(
      'Checking gateway fee recipient actual ' +
        `${signedPlanqTransaction.gatewayFeeRecipient} expected ${planqTransaction.gatewayFeeRecipient}`
    )
    expect(signedPlanqTransaction.gatewayFeeRecipient!.toLowerCase()).toEqual(
      planqTransaction.gatewayFeeRecipient.toLowerCase()
    )
  }
  if (planqTransaction.gatewayFee != null) {
    debug(
      'Checking gateway fee value actual %o expected %o',
      signedPlanqTransaction.gatewayFee,
      planqTransaction.gatewayFee.toString()
    )
    expect(signedPlanqTransaction.gatewayFee).toEqual(planqTransaction.gatewayFee.toString())
  }
  if (planqTransaction.data != null) {
    debug(`Checking data actual ${signedPlanqTransaction.data} expected ${planqTransaction.data}`)
    expect(signedPlanqTransaction.data!.toLowerCase()).toEqual(planqTransaction.data.toLowerCase())
  }
}

async function verifyLocalSigningInAllPermutations(
  web3: Web3,
  from: string,
  to: string
): Promise<void> {
  const amountInWei: string = Web3.utils.toWei('1', 'ether')
  const nonce = 0
  const badNonce = 100
  const gas = 10
  const gasPrice = 99
  const feeCurrency = ACCOUNT_ADDRESS1
  const gatewayFeeRecipient = ACCOUNT_ADDRESS2
  const gatewayFee = '0x5678'
  const data = '0xabcdef'
  const chainId = 1

  // tslint:disable:no-bitwise
  // Test all possible combinations for rigor.
  for (let i = 0; i < 16; i++) {
    const planqTransaction: PlanqTx = {
      from,
      to,
      value: amountInWei,
      nonce,
      gasPrice,
      chainId,
      gas,
      feeCurrency: i & 1 ? feeCurrency : undefined,
      gatewayFeeRecipient: i & 2 ? gatewayFeeRecipient : undefined,
      gatewayFee: i & 4 ? gatewayFee : undefined,
      data: i & 8 ? data : undefined,
    }
    await verifyLocalSigning(web3, planqTransaction)
  }
  // tslint:enable:no-bitwise

  // A special case.
  // An incorrect nonce  will only work, if no implict calls to estimate gas are required.
  await verifyLocalSigning(web3, { from, to, nonce: badNonce, gas, gasPrice, chainId })
}

// These tests verify the signTransaction WITHOUT the ParamsPopulator
describe('Transaction Utils', () => {
  // only needed for the eth_coinbase rcp call
  let connection: Connection
  const mockProvider: Provider = {
    send: (payload: JsonRpcPayload, callback: Callback<JsonRpcResponse>): void => {
      if (payload.method === 'eth_coinbase') {
        const response: JsonRpcResponse = {
          jsonrpc: payload.jsonrpc,
          id: Number(payload.id),
          result: '0xc94770007dda54cF92009BFF0dE90c06F603a09f',
        }
        callback(null, response)
      } else {
        callback(new Error(payload.method))
      }
    },
  }
  const web3: Web3 = new Web3()

  beforeEach(() => {
    web3.setProvider(mockProvider as any)
    connection = new Connection(web3)
    connection.wallet = new LocalWallet()
  })

  afterEach(() => {
    connection.stop()
  })

  describe('Signer Testing with single local account and pay gas in PLQ', () => {
    it('Test1 should be able to sign and get the signer back with single local account', async () => {
      jest.setTimeout(60 * 1000)
      connection.addAccount(PRIVATE_KEY1)
      await verifyLocalSigningInAllPermutations(web3, ACCOUNT_ADDRESS1, ACCOUNT_ADDRESS2)
    })
  })

  describe('Signer Testing with multiple local accounts', () => {
    it('Test2 should be able to sign with first account and get the signer back with multiple local accounts', async () => {
      jest.setTimeout(60 * 1000)
      connection.addAccount(PRIVATE_KEY1)
      connection.addAccount(PRIVATE_KEY2)
      await verifyLocalSigningInAllPermutations(web3, ACCOUNT_ADDRESS1, ACCOUNT_ADDRESS2)
    })

    it('Test3 should be able to sign with second account and get the signer back with multiple local accounts', async () => {
      jest.setTimeout(60 * 1000)
      connection.addAccount(PRIVATE_KEY1)
      connection.addAccount(PRIVATE_KEY2)
      await verifyLocalSigningInAllPermutations(web3, ACCOUNT_ADDRESS2, ACCOUNT_ADDRESS1)
    })
  })
})
