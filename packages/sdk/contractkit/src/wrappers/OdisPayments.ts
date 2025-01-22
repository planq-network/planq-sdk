import {Address, PlanqTransactionObject} from "@planq-network/connect";
import {BigNumber} from "bignumber.js";
import {OdisPayments} from "../generated/OdisPayments";
import {
  BaseWrapper,
  proxyCall,
  proxySend,
  valueToBigNumber,
} from "./BaseWrapper";

export class OdisPaymentsWrapper extends BaseWrapper<OdisPayments> {
  /**
   * @notice Fetches total amount sent (all-time) for given account to odisPayments
   * @param account The account to fetch total amount of funds sent
   */
  totalPaidAUSD: (account: Address) => Promise<BigNumber> = proxyCall(
    this.contract.methods.totalPaidAUSD,
    undefined,
    valueToBigNumber
  );

  /**
   * @notice Sends aUSD to this contract to pay for ODIS quota (for queries).
   * @param account The account whose balance to increment.
   * @param value The amount in aUSD to pay.
   * @dev Throws if aUSD transfer fails.
   */
  payInAUSD: (
    account: Address,
    value: number | string
  ) => PlanqTransactionObject<void> = proxySend(
    this.connection,
    this.contract.methods.payInAUSD
  );
}

export type OdisPaymentsWrapperType = OdisPaymentsWrapper;
