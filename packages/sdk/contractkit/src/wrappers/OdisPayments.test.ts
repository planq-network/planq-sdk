import {StableToken} from "@planq-network/base";
import {testWithGanache} from "@planq-network/dev-utils/lib/ganache-test";
import {newKitFromWeb3} from "../kit";
import {OdisPaymentsWrapper} from "./OdisPayments";
import {StableTokenWrapper} from "./StableTokenWrapper";

testWithGanache("OdisPayments Wrapper", (web3) => {
  const kit = newKitFromWeb3(web3);
  let accounts: string[] = [];
  let odisPayments: OdisPaymentsWrapper;
  let stableToken: StableTokenWrapper;

  beforeAll(async () => {
    accounts = await web3.eth.getAccounts();
    kit.defaultAccount = accounts[0];
    odisPayments = await kit.contracts.getOdisPayments();
    stableToken = await kit.contracts.getStableToken(StableToken.aUSD);
  });

  describe("#payInAUSD", () => {
    const testValue = 10000;

    const payAndCheckState = async (
      sender: string,
      receiver: string,
      transferValue: number
    ) => {
      // Approve aUSD that OdisPayments contract may transfer from sender
      await stableToken
        .approve(odisPayments.address, transferValue)
        .sendAndWaitForReceipt({from: sender});

      const senderBalanceBefore = await stableToken.balanceOf(sender);
      await odisPayments
        .payInAUSD(receiver, transferValue)
        .sendAndWaitForReceipt({from: sender});
      const balanceAfter = await stableToken.balanceOf(sender);
      expect(senderBalanceBefore.minus(balanceAfter)).toEqBigNumber(
        transferValue
      );
      expect(await stableToken.balanceOf(odisPayments.address)).toEqBigNumber(
        transferValue
      );
      expect(await odisPayments.totalPaidAUSD(receiver)).toEqBigNumber(
        transferValue
      );
    };

    it("should allow sender to make a payment on their behalf", async () => {
      await payAndCheckState(accounts[0], accounts[0], testValue);
    });

    it("should allow sender to make a payment for another account", async () => {
      await payAndCheckState(accounts[0], accounts[1], testValue);
    });

    it("should revert if transfer fails", async () => {
      await stableToken
        .approve(odisPayments.address, testValue)
        .sendAndWaitForReceipt();
      expect.assertions(2);
      await expect(
        odisPayments
          .payInAUSD(accounts[0], testValue + 1)
          .sendAndWaitForReceipt()
      ).rejects.toThrow();
      expect(await odisPayments.totalPaidAUSD(accounts[0])).toEqBigNumber(0);
    });
  });
});
