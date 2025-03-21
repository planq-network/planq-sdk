import {testWithGanache} from "@planq-network/dev-utils/lib/ganache-test";
import {StableToken} from "../planq-tokens";
import {ContractKit, newKitFromWeb3} from "../kit";
import {StableTokenWrapper} from "./StableTokenWrapper";

// TEST NOTES: balances defined in test-utils/migration-override

testWithGanache("StableToken Wrapper", async (web3) => {
  const kit = newKitFromWeb3(web3);

  const stableTokenInfos: {
    [key in StableToken]: {
      stableToken: StableToken;
      name: string;
      symbol: string;
    };
  } = {
    [StableToken.aUSD]: {
      stableToken: StableToken.aUSD,
      name: "Planq Dollar",
      symbol: "aUSD",
    },
    [StableToken.aEUR]: {
      stableToken: StableToken.aEUR,
      name: "Planq Euro",
      symbol: "aEUR",
    },
    [StableToken.aREAL]: {
      stableToken: StableToken.aREAL,
      name: "Planq Brazilian Real",
      symbol: "aREAL",
    },
  };

  for (const stableTokenInfo of Object.values(stableTokenInfos)) {
    describe(stableTokenInfo.symbol, () => {
      testStableToken(
        kit,
        stableTokenInfo.stableToken,
        stableTokenInfo.name,
        stableTokenInfo.symbol
      );
    });
  }
});

export function testStableToken(
  kit: ContractKit,
  stableTokenName: StableToken,
  expectedName: string,
  expectedSymbol: string
) {
  const web3 = kit.web3;
  const ONE_STABLE = web3.utils.toWei("1", "ether");

  let accounts: string[] = [];
  let stableToken: StableTokenWrapper;

  beforeAll(async () => {
    accounts = await web3.eth.getAccounts();
    kit.defaultAccount = accounts[0];
    stableToken = await kit.contracts.getStableToken(stableTokenName);
  });

  test("SBAT check balance", () =>
    expect(stableToken.balanceOf(accounts[0])).resolves.toBeBigNumber());
  test("SBAT check decimals", () =>
    expect(stableToken.decimals()).resolves.toBe(18));
  test("SBAT check name", () =>
    expect(stableToken.name()).resolves.toBe(expectedName));
  test("SBAT check symbol", () =>
    expect(stableToken.symbol()).resolves.toBe(expectedSymbol));
  test("SBAT check totalSupply", () =>
    expect(stableToken.totalSupply()).resolves.toBeBigNumber());

  test("SBAT transfer", async () => {
    const before = await stableToken.balanceOf(accounts[1]);
    const tx = await stableToken.transfer(accounts[1], ONE_STABLE).send();
    await tx.waitReceipt();

    const after = await stableToken.balanceOf(accounts[1]);
    expect(after.minus(before)).toEqBigNumber(ONE_STABLE);
  });

  test("SBAT approve spender", async () => {
    const before = await stableToken.allowance(accounts[0], accounts[1]);
    expect(before).toEqBigNumber(0);

    await stableToken.approve(accounts[1], ONE_STABLE).sendAndWaitForReceipt();
    const after = await stableToken.allowance(accounts[0], accounts[1]);
    expect(after).toEqBigNumber(ONE_STABLE);
  });

  test("SBAT tranfer from", async () => {
    const before = await stableToken.balanceOf(accounts[3]);
    // account1 approves account0
    await stableToken
      .approve(accounts[1], ONE_STABLE)
      .sendAndWaitForReceipt({from: accounts[0]});

    const tx = await stableToken
      .transferFrom(accounts[0], accounts[3], ONE_STABLE)
      .send({from: accounts[1]});
    await tx.waitReceipt();
    const after = await stableToken.balanceOf(accounts[3]);
    expect(after.minus(before)).toEqBigNumber(ONE_STABLE);
  });
}
