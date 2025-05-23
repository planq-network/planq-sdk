import {assertTransactionRevertWithReason} from "@planq-network/protocol/lib/test-utils";
import {
  FeeCurrencyWhitelistContract,
  FeeCurrencyWhitelistInstance,
} from "types";

const FeeCurrencyWhitelist: FeeCurrencyWhitelistContract = artifacts.require(
  "FeeCurrencyWhitelist"
);

contract("FeeCurrencyWhitelist", (accounts: string[]) => {
  let feeCurrencyWhitelist: FeeCurrencyWhitelistInstance;

  const aTokenAddress = "0x9DabFe01de024C681320eb80FBc64EccEaa58ca2";

  const nonOwner = accounts[1];

  beforeEach(async () => {
    feeCurrencyWhitelist = await FeeCurrencyWhitelist.new(true);
    await feeCurrencyWhitelist.initialize();
  });

  describe("#initialize()", () => {
    it("should have set the owner", async () => {
      const owner: string = await feeCurrencyWhitelist.owner();
      assert.equal(owner, accounts[0]);
    });

    it("should not be callable again", async () => {
      await assertTransactionRevertWithReason(
        feeCurrencyWhitelist.initialize(),
        "contract already initialized"
      );
    });
  });

  describe("#addToken()", () => {
    it("should allow the owner to add a token", async () => {
      await feeCurrencyWhitelist.addToken(aTokenAddress);
      const tokens = await feeCurrencyWhitelist.getWhitelist();
      assert.sameMembers(tokens, [aTokenAddress]);
    });

    it("should not allow a non-owner to add a token", async () => {
      await assertTransactionRevertWithReason(
        feeCurrencyWhitelist.addToken(aTokenAddress, {from: nonOwner}),
        "Ownable: caller is not the owner"
      );
    });
  });
});
