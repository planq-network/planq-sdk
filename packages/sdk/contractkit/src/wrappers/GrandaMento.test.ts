import {Address} from "@planq-network/base/lib/address";
import {
  NetworkConfig,
  testWithGanache,
  timeTravel,
} from "@planq-network/dev-utils/lib/ganache-test";
import {toFixed} from "@planq-network/utils/src/fixidity";
import BigNumber from "bignumber.js";
import Web3 from "web3";
import {StableToken} from "../planq-tokens";
import {newKitFromWeb3} from "../kit";
import {setGrandaMentoLimits} from "../test-utils/grandaMento";
import {assumeOwnership} from "../test-utils/transferownership";
import {PlanqTokenWrapper} from "./PlanqTokenWrapper";
import {ExchangeProposalState, GrandaMentoWrapper} from "./GrandaMento";
import {StableTokenWrapper} from "./StableTokenWrapper";

const expConfig = NetworkConfig.grandaMento;

testWithGanache("GrandaMento Wrapper", (web3: Web3) => {
  const kit = newKitFromWeb3(web3);
  let accounts: Address[] = [];
  let grandaMento: GrandaMentoWrapper;
  let planqToken: PlanqTokenWrapper;
  let stableToken: StableTokenWrapper;
  const newLimitMin = new BigNumber("1000");
  const newLimitMax = new BigNumber("1000000000000");
  let sellAmount: BigNumber;

  beforeAll(async () => {
    accounts = await web3.eth.getAccounts();
    kit.defaultAccount = accounts[0];
    grandaMento = await kit.contracts.getGrandaMento();

    stableToken = await kit.contracts.getStableToken(StableToken.aUSD);
    planqToken = await kit.contracts.getPlanqToken();
    // Reset limits
    await assumeOwnership(web3, accounts[0]);
    const zero = new BigNumber(0);
    await setLimits("StableToken", zero, zero);
    await setLimits("StableTokenEUR", zero, zero);
  });

  const setLimits = async (
    registryId: string = "StableToken",
    min: BigNumber = newLimitMin,
    max: BigNumber = newLimitMax
  ) => {
    await setGrandaMentoLimits(grandaMento, min, max, registryId);
  };

  describe("No limits sets", () => {
    it("gets the proposals", async () => {
      const activeProposals = await grandaMento.getActiveProposalIds();
      expect(activeProposals).toEqual([]);
    });

    it("fetches empty limits", async () => {
      const limits = await grandaMento.stableTokenExchangeLimits(
        StableToken.aUSD
      );
      expect(limits.minExchangeAmount).toEqBigNumber(new BigNumber(0));
      expect(limits.maxExchangeAmount).toEqBigNumber(new BigNumber(0));
    });
  });

  it("fetchs a proposal it doesn't exist", async () => {
    await expect(grandaMento.getExchangeProposal(0)).rejects.toThrow(
      "Proposal doesn't exist"
    );
  });

  describe("When Granda Mento is enabled", () => {
    beforeEach(async () => {
      await setLimits();
    });

    it("updated the config", async () => {
      const config = await grandaMento.getConfig();
      expect(
        config.exchangeLimits.get(kit.planqTokens.getContract(StableToken.aUSD))
          ?.minExchangeAmount
      ).toEqBigNumber(new BigNumber(newLimitMin));
      expect(
        config.exchangeLimits.get(kit.planqTokens.getContract(StableToken.aUSD))
          ?.maxExchangeAmount
      ).toEqBigNumber(new BigNumber(newLimitMax));
      expect(
        config.exchangeLimits.get(kit.planqTokens.getContract(StableToken.aEUR))
          ?.minExchangeAmount
      ).toEqBigNumber(new BigNumber(0));
      expect(
        config.exchangeLimits.get(kit.planqTokens.getContract(StableToken.aEUR))
          ?.maxExchangeAmount
      ).toEqBigNumber(new BigNumber(0));
    });

    it("has new limits", async () => {
      const limits = await grandaMento.stableTokenExchangeLimits(
        StableToken.aUSD
      );
      expect(limits.minExchangeAmount).toEqBigNumber(newLimitMin);
      expect(limits.maxExchangeAmount).toEqBigNumber(newLimitMax);
    });

    describe("Has a proposal", () => {
      beforeEach(async () => {
        sellAmount = new BigNumber("100000000");
        await planqToken
          .increaseAllowance(grandaMento.address, sellAmount)
          .sendAndWaitForReceipt();

        await (
          await grandaMento.createExchangeProposal(
            kit.planqTokens.getContract(StableToken.aUSD),
            sellAmount,
            true
          )
        ).sendAndWaitForReceipt();
      });

      it("executes", async () => {
        const activeProposals = await grandaMento.getActiveProposalIds();
        expect(activeProposals).not.toEqual([]);

        let proposal = await grandaMento.getExchangeProposal(
          activeProposals[0]
        );
        expect(proposal.exchanger).toEqual(accounts[0]);
        expect(proposal.stableToken).toEqual(stableToken.address);
        expect(proposal.sellAmount).toEqBigNumber(sellAmount);
        expect(proposal.buyAmount).toEqBigNumber(new BigNumber("99000000"));
        expect(proposal.approvalTimestamp).toEqual(new BigNumber(0));
        expect(proposal.state).toEqual(ExchangeProposalState.Proposed);
        expect(proposal.sellPlanq).toEqual(true);

        await grandaMento
          .approveExchangeProposal(activeProposals[0])
          .sendAndWaitForReceipt();

        proposal = await grandaMento.getExchangeProposal(activeProposals[0]);

        expect(proposal.state).toEqual(ExchangeProposalState.Approved);
        await timeTravel(expConfig.vetoPeriodSeconds, web3);
        await grandaMento
          .executeExchangeProposal(activeProposals[0])
          .sendAndWaitForReceipt();

        proposal = await grandaMento.getExchangeProposal(activeProposals[0]);
        expect(proposal.state).toEqual(ExchangeProposalState.Executed);
      });

      it("displays human format correctly", async () => {
        const activeProposals = await grandaMento.getActiveProposalIds();

        const proposal = await grandaMento.getHumanReadableExchangeProposal(
          activeProposals[0]
        );
        expect(proposal.exchanger).toEqual(accounts[0]);
        expect(proposal.stableToken).toEqual(
          `Planq Dollar (aUSD) at ${stableToken.address}`
        );
        expect(proposal.sellAmount).toEqBigNumber(sellAmount);
        expect(proposal.buyAmount).toEqBigNumber(new BigNumber("99000000"));
        expect(proposal.approvalTimestamp).toEqual(new BigNumber(0));
        expect(proposal.state).toEqual("Proposed");
        expect(proposal.sellPlanq).toEqual(true);
        expect(proposal.implictPricePerPlanq).toEqBigNumber(
          new BigNumber("0.99")
        );
      });

      it("cancels proposal", async () => {
        await grandaMento.cancelExchangeProposal(1).sendAndWaitForReceipt();

        const proposal = await grandaMento.getExchangeProposal("1");
        expect(proposal.state).toEqual(ExchangeProposalState.Cancelled);
      });
    });
  });

  it("#getConfig", async () => {
    const config = await grandaMento.getConfig();
    expect(config.approver).toBe(expConfig.approver);
    expect(config.spread).toEqBigNumber(expConfig.spread);
    expect(config.maxApprovalExchangeRateChange).toEqBigNumber(
      expConfig.maxApprovalExchangeRateChange
    );
    expect(config.vetoPeriodSeconds).toEqBigNumber(expConfig.vetoPeriodSeconds);
    expect(
      config.exchangeLimits.get(kit.planqTokens.getContract(StableToken.aUSD))
        ?.minExchangeAmount
    ).toEqBigNumber(new BigNumber(0));
    expect(
      config.exchangeLimits.get(kit.planqTokens.getContract(StableToken.aUSD))
        ?.maxExchangeAmount
    ).toEqBigNumber(new BigNumber(0));
    expect(
      config.exchangeLimits.get(kit.planqTokens.getContract(StableToken.aEUR))
        ?.minExchangeAmount
    ).toEqBigNumber(new BigNumber(0));
    expect(
      config.exchangeLimits.get(kit.planqTokens.getContract(StableToken.aEUR))
        ?.maxExchangeAmount
    ).toEqBigNumber(new BigNumber(0));
  });

  describe("#getBuyAmount", () => {
    it("gets the buy amount", async () => {
      const oracleRate = 1;
      const hypotheticalSellAmount = toFixed(1);
      expect(
        await grandaMento.getBuyAmount(
          toFixed(oracleRate),
          hypotheticalSellAmount,
          true
        )
      ).toEqBigNumber(
        hypotheticalSellAmount
          .times(oracleRate)
          .times(new BigNumber(1).minus(await grandaMento.spread()))
      );
    });
  });
});
