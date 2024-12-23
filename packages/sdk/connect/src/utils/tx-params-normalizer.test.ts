import Web3 from 'web3'
import { Connection } from '../connection'
import { Callback, PlanqTx, JsonRpcPayload, JsonRpcResponse } from '../types'
import { RpcCaller } from './rpc-caller'
import { TxParamsNormalizer } from './tx-params-normalizer'

describe('TxParamsNormalizer class', () => {
  let populator: TxParamsNormalizer
  let mockRpcCall: any
  let mockGasEstimation: any
  const completePlanqTx: PlanqTx = {
    nonce: 1,
    chainId: 1,
    from: 'test',
    to: 'test',
    data: 'test',
    value: 1,
    gas: 1,
    gasPrice: 1,
    feeCurrency: undefined,
    gatewayFeeRecipient: '1',
    gatewayFee: '1',
  }

  beforeEach(() => {
    mockRpcCall = jest.fn((method: string, _params: any[]): Promise<JsonRpcResponse> => {
      return new Promise((resolve, _reject) =>
        resolve({
          jsonrpc: '2.0',
          id: 1,
          result: method === 'net_version' ? '27' : '0x27',
        })
      )
    })
    const rpcMock: RpcCaller = {
      call: mockRpcCall,
      // tslint:disable-next-line: no-empty
      send: (_payload: JsonRpcPayload, _callback: Callback<JsonRpcResponse>): void => {},
    }
    const connection = new Connection(new Web3('http://localhost:8545'))
    connection.rpcCaller = rpcMock
    mockGasEstimation = jest.fn(
      (
        _tx: PlanqTx,
        _gasEstimator?: (tx: PlanqTx) => Promise<number>,
        _caller?: (tx: PlanqTx) => Promise<string>
      ): Promise<number> => {
        return Promise.resolve(27)
      }
    )
    connection.estimateGas = mockGasEstimation
    populator = new TxParamsNormalizer(connection)
  })

  describe('when missing parameters', () => {
    test('will populate the chaindId', async () => {
      const planqTx: PlanqTx = { ...completePlanqTx }
      planqTx.chainId = undefined
      const newPlanqTx = await populator.populate(planqTx)
      expect(newPlanqTx.chainId).toBe(27)
      expect(mockRpcCall.mock.calls.length).toBe(1)
      expect(mockRpcCall.mock.calls[0][0]).toBe('net_version')
    })

    test('will retrieve only once the chaindId', async () => {
      const planqTx: PlanqTx = { ...completePlanqTx }
      planqTx.chainId = undefined
      const newPlanqTx = await populator.populate(planqTx)
      expect(newPlanqTx.chainId).toBe(27)

      const newPlanqTx2 = await populator.populate(planqTx)
      expect(newPlanqTx2.chainId).toBe(27)

      expect(mockRpcCall.mock.calls.length).toBe(1)
      expect(mockRpcCall.mock.calls[0][0]).toBe('net_version')
    })

    test('will populate the nonce', async () => {
      const planqTx: PlanqTx = { ...completePlanqTx }
      planqTx.nonce = undefined
      const newPlanqTx = await populator.populate(planqTx)
      expect(newPlanqTx.nonce).toBe(39) // 0x27 => 39
      expect(mockRpcCall.mock.calls.length).toBe(1)
      expect(mockRpcCall.mock.calls[0][0]).toBe('eth_getTransactionCount')
    })

    test('will populate the gas', async () => {
      const planqTx: PlanqTx = { ...completePlanqTx }
      planqTx.gas = undefined
      const newPlanqTx = await populator.populate(planqTx)
      expect(newPlanqTx.gas).toBe(27)
      expect(mockGasEstimation.mock.calls.length).toBe(1)
    })

    /* Disabled till the coinbase issue is fixed

    test('will populate the gatewayFeeRecipient', async () => {
      const planqTx: PlanqTx = { ...completePlanqTx }
      planqTx.gatewayFeeRecipient = undefined
      const newPlanqTx = await populator.populate(planqTx)
      expect(newPlanqTx.gatewayFeeRecipient).toBe('27')
      expect(mockRpcCall.mock.calls.length).toBe(1)
      expect(mockRpcCall.mock.calls[0][0]).toBe('eth_coinbase')
    })

    test('will retrieve only once the gatewayFeeRecipient', async () => {
      const planqTx: PlanqTx = { ...completePlanqTx }
      planqTx.gatewayFeeRecipient = undefined
      const newPlanqTx = await populator.populate(planqTx)
      expect(newPlanqTx.gatewayFeeRecipient).toBe('27')

      const newPlanqTx2 = await populator.populate(planqTx)
      expect(newPlanqTx2.gatewayFeeRecipient).toBe('27')

      expect(mockRpcCall.mock.calls.length).toBe(1)
      expect(mockRpcCall.mock.calls[0][0]).toBe('eth_coinbase')
    })
    */

    test('will populate the gas price without fee currency', async () => {
      const planqTx: PlanqTx = { ...completePlanqTx }
      planqTx.gasPrice = undefined
      const newPlanqTx = await populator.populate(planqTx)
      expect(newPlanqTx.gasPrice).toBe('0x27')
      expect(mockRpcCall.mock.calls.length).toBe(1)
      expect(mockRpcCall.mock.calls[0][0]).toBe('eth_gasPrice')
    })

    test('will populate the gas price with fee currency', async () => {
      const planqTx: PlanqTx = { ...completePlanqTx }
      planqTx.gasPrice = undefined
      planqTx.feeCurrency = 'planqMagic'
      const newPlanqTx = await populator.populate(planqTx)
      expect(newPlanqTx.gasPrice).toBe('0x27')
      expect(mockRpcCall.mock.calls[0]).toEqual(['eth_gasPrice', ['planqMagic']])
    })

    test('will not populate the gas price when fee currency is undefined', async () => {
      const planqTx: PlanqTx = { ...completePlanqTx }
      planqTx.gasPrice = undefined
      planqTx.feeCurrency = undefined
      const newPlanqTx = await populator.populate(planqTx)
      expect(newPlanqTx.gasPrice).toBe('0x27')
      expect(mockRpcCall.mock.calls[0]).toEqual(['eth_gasPrice', []])
    })
  })
})
