import Web3 from 'web3'
import { PlanqContract } from './base'
import { PlanqTokenInfo, PlanqTokens, StableToken, Token } from './planq-tokens'
import { ContractKit, newKitFromWeb3 } from './kit'

describe('PlanqTokens', () => {
  let kit: ContractKit
  let planqTokens: PlanqTokens

  beforeEach(() => {
    kit = newKitFromWeb3(new Web3('http://localhost:8545'))
    planqTokens = kit.planqTokens
  })

  describe('forEachPlanqToken()', () => {
    it('returns an object with a key for each planq token and the value from a provided async fn', async () => {
      const result = await planqTokens.forEachPlanqToken(async (info: PlanqTokenInfo) =>
        Promise.resolve(info.symbol)
      )
      for (const [key, value] of Object.entries(result)) {
        expect(key).toEqual(value)
      }
    })

    it('returns an object with a key for each planq token and the value from a provided non-async fn', async () => {
      const result = await planqTokens.forEachPlanqToken(async (info: PlanqTokenInfo) => info.symbol)
      for (const [key, value] of Object.entries(result)) {
        expect(key).toEqual(value)
      }
    })
  })

  describe('isStableToken()', () => {
    it('returns true if the token is a stable token', () => {
      expect(planqTokens.isStableToken(StableToken.pUSD)).toEqual(true)
    })

    it('returns false if the token is not a stable token', () => {
      expect(planqTokens.isStableToken(Token.PLQ)).toEqual(false)
    })
  })

  describe('isStableTokenContract()', () => {
    it('returns true if the contract is a stable token contract', () => {
      expect(planqTokens.isStableTokenContract(PlanqContract.StableToken)).toEqual(true)
    })

    it('returns false if the contract is not a stable token contract', () => {
      expect(planqTokens.isStableTokenContract(PlanqContract.Exchange)).toEqual(false)
    })
  })
})
