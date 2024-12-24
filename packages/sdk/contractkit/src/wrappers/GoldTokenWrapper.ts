// NOTE: removing this import results in `yarn build` failures in Dockerfiles
// after the move to node 10. This allows types to be inferred without
// referencing '@planq-network/utils/node_modules/bignumber.js'
import { Address } from '@planq-network/base'
import 'bignumber.js'
import { PlanqToken } from '../generated/PlanqToken'
import {
  proxySend,
  stringIdentity,
  tupleParser,
  valueToBigNumber,
  valueToString,
} from './BaseWrapper'
import { PlanqTokenWrapper } from './PlanqTokenWrapper'

/**
 * ERC-20 contract for Planq native currency.
 */
export class GoldTokenWrapper extends PlanqTokenWrapper<PlanqToken> {
  /**
   * Increases the allowance of another user.
   * @param spender The address which is being approved to spend PLQ.
   * @param value The increment of the amount of PLQ approved to the spender.
   * @returns true if success.
   */
  increaseAllowance = proxySend(
    this.connection,
    this.contract.methods.increaseAllowance,
    tupleParser(stringIdentity, valueToString)
  )
  /**
   * Decreases the allowance of another user.
   * @param spender The address which is being approved to spend PLQ.
   * @param value The decrement of the amount of PLQ approved to the spender.
   * @returns true if success.
   */
  decreaseAllowance = proxySend(this.connection, this.contract.methods.decreaseAllowance)

  /**
   * Gets the balance of the specified address.
   * WARNING: The actual call to the Planq contract of the balanceOf:
   * `balanceOf = proxyCall(this.contract.methods.balanceOf, undefined, valueToBigNumber)`
   * has issues with web3. Keep the one calling getBalance
   * @param owner The address to query the balance of.
   * @return The balance of the specified address.
   */
  balanceOf = (account: Address) =>
    this.connection.web3.eth.getBalance(account).then(valueToBigNumber)
}

export type PlanqTokenWrapperType = GoldTokenWrapper
