import {PlanqContractName} from "@planq-network/protocol/lib/registry-utils";
import {
  assertEqualBN,
  assertLogMatches2,
  assertTransactionRevertWithReason,
  assumeOwnershipWithTruffle,
} from "@planq-network/protocol/lib/test-utils";
import {
  getDeployedProxiedContract,
  makeTruffleContractForMigration,
} from "@planq-network/protocol/lib/web3-utils";
import {fixed1} from "@planq-network/utils/src/fixidity";
import {
  FreezerContract,
  FreezerInstance,
  OdisPaymentsContract,
  OdisPaymentsInstance,
  RegistryInstance,
} from "types";
import {StableTokenContract, StableTokenInstance} from "types/mento";
import {ASTONIC_PACKAGE} from "../../contractPackages";

const Freezer: FreezerContract = artifacts.require("Freezer");
const OdisPayments: OdisPaymentsContract = artifacts.require("OdisPayments");
const StableTokenAUSD: StableTokenContract = makeTruffleContractForMigration(
  "StableToken",
  ASTONIC_PACKAGE,
  web3
);

const SECONDS_IN_A_DAY = 60 * 60 * 24;

contract("OdisPayments", (accounts: string[]) => {
  let freezer: FreezerInstance;
  let odisPayments: OdisPaymentsInstance;
  let registry: RegistryInstance;
  let stableTokenAUSD: StableTokenInstance;

  const owner = accounts[0];
  const sender = accounts[1];
  const startingBalanceAUSD = 1000;

  before(async () => {
    // Mocking Registry.sol when using UsingRegistryV2.sol
    registry = await getDeployedProxiedContract("Registry", artifacts);
    if ((await registry.owner()) !== owner) {
      // In CI we need to assume ownership, locally using quicktest we don't
      await assumeOwnershipWithTruffle(["Registry"], owner);
    }
  });

  beforeEach(async () => {
    odisPayments = await OdisPayments.new(true, {from: owner});
    await odisPayments.initialize();

    stableTokenAUSD = await StableTokenAUSD.new(true, {from: owner});
    await registry.setAddressFor(
      PlanqContractName.StableToken,
      stableTokenAUSD.address
    );
    await stableTokenAUSD.initialize(
      "Planq Dollar",
      "aUSD",
      18,
      registry.address,
      fixed1,
      SECONDS_IN_A_DAY,
      // Initialize owner and sender with balances
      [owner, sender],
      [startingBalanceAUSD, startingBalanceAUSD],
      "Exchange" // USD
    );

    // StableToken is freezable so this is necessary for transferFrom calls
    freezer = await Freezer.new(true, {from: owner});
    await freezer.initialize();
    await registry.setAddressFor(PlanqContractName.Freezer, freezer.address);
  });

  describe("#initialize()", () => {
    it("should have set the owner", async () => {
      const actualOwner: string = await odisPayments.owner();
      assert.equal(actualOwner, owner);
    });

    it("should not be callable again", async () => {
      await assertTransactionRevertWithReason(
        odisPayments.initialize(),
        "contract already initialized"
      );
    });
  });

  describe("#payInAUSD", () => {
    const checkStateAUSD = async (
      ausdSender: string,
      odisPaymentReceiver: string,
      totalValueSent: number
    ) => {
      assertEqualBN(
        await stableTokenAUSD.balanceOf(ausdSender),
        startingBalanceAUSD - totalValueSent,
        "ausdSender balance"
      );
      assertEqualBN(
        await stableTokenAUSD.balanceOf(odisPayments.address),
        totalValueSent,
        "odisPayments.address balance"
      );
      assertEqualBN(
        await odisPayments.totalPaidAUSD(odisPaymentReceiver),
        totalValueSent,
        "odisPaymentReceiver balance"
      );
    };

    const valueApprovedForTransfer = 10;
    const receiver = accounts[2];

    beforeEach(async () => {
      await stableTokenAUSD.approve(
        odisPayments.address,
        valueApprovedForTransfer,
        {
          from: sender,
        }
      );
      assertEqualBN(
        await stableTokenAUSD.balanceOf(sender),
        startingBalanceAUSD
      );
    });

    it("should allow sender to make a payment on their behalf", async () => {
      await odisPayments.payInAUSD(sender, valueApprovedForTransfer, {
        from: sender,
      });
      await checkStateAUSD(sender, sender, valueApprovedForTransfer);
    });

    it("should allow sender to make a payment for another account", async () => {
      await odisPayments.payInAUSD(receiver, valueApprovedForTransfer, {
        from: sender,
      });
      await checkStateAUSD(sender, receiver, valueApprovedForTransfer);
    });

    it("should allow sender to make multiple payments to the contract", async () => {
      const valueForSecondTransfer = 5;
      const valueForFirstTransfer =
        valueApprovedForTransfer - valueForSecondTransfer;

      await odisPayments.payInAUSD(sender, valueForFirstTransfer, {
        from: sender,
      });
      await checkStateAUSD(sender, sender, valueForFirstTransfer);

      await odisPayments.payInAUSD(sender, valueForSecondTransfer, {
        from: sender,
      });
      await checkStateAUSD(sender, sender, valueApprovedForTransfer);
    });

    it("should emit the PaymentMade event", async () => {
      const receipt = await odisPayments.payInAUSD(
        receiver,
        valueApprovedForTransfer,
        {
          from: sender,
        }
      );
      assertLogMatches2(receipt.logs[0], {
        event: "PaymentMade",
        args: {
          account: receiver,
          valueInAUSD: valueApprovedForTransfer,
        },
      });
    });

    it("should revert if transfer fails", async () => {
      await assertTransactionRevertWithReason(
        odisPayments.payInAUSD(sender, valueApprovedForTransfer + 1, {
          from: sender,
        }),
        "SafeERC20: low-level call failed"
      );
      assertEqualBN(await odisPayments.totalPaidAUSD(sender), 0);
    });
  });
});
