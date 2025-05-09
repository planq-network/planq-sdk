import {
  mineBlocks,
  testWithGanache,
} from "@planq-network/dev-utils/lib/ganache-test";
import {addressToPublicKey} from "@planq-network/utils/lib/signatureUtils";
import BigNumber from "bignumber.js";
import Web3 from "web3";
import {newKitFromWeb3} from "../kit";
import {AccountsWrapper} from "./Accounts";
import {LockedPlanqWrapper} from "./LockedPlanq";
import {ValidatorsWrapper} from "./Validators";

/*
TEST NOTES:
- In migrations: The only account that has aUSD is accounts[0]
*/

const minLockedPlanqValue = Web3.utils.toWei("10000", "ether"); // 10k planq

const blsPublicKey =
  "0x4fa3f67fc913878b068d1fa1cdddc54913d3bf988dbe5a36a20fa888f20d4894c408a6773f3d7bde11154f2a3076b700d345a42fd25a0e5e83f4db5586ac7979ac2053cd95d8f2efd3e959571ceccaa743e02cf4be3f5d7aaddb0b06fc9aff00";
const blsPoP =
  "0xcdb77255037eb68897cd487fdd85388cbda448f617f874449d4b11588b0b7ad8ddc20d9bb450b513bb35664ea3923900";

testWithGanache("Validators Wrapper", (web3) => {
  const kit = newKitFromWeb3(web3);
  let accounts: string[] = [];
  let accountsInstance: AccountsWrapper;
  let validators: ValidatorsWrapper;
  let lockedPlanq: LockedPlanqWrapper;

  const registerAccountWithLockedPlanq = async (
    account: string,
    value: string = minLockedPlanqValue
  ) => {
    if (!(await accountsInstance.isAccount(account))) {
      await accountsInstance
        .createAccount()
        .sendAndWaitForReceipt({from: account});
    }
    await lockedPlanq.lock().sendAndWaitForReceipt({from: account, value});
  };

  beforeAll(async () => {
    accounts = await web3.eth.getAccounts();
    validators = await kit.contracts.getValidators();
    lockedPlanq = await kit.contracts.getLockedPlanq();
    accountsInstance = await kit.contracts.getAccounts();
  });

  const setupGroup = async (groupAccount: string, members: number = 1) => {
    await registerAccountWithLockedPlanq(
      groupAccount,
      new BigNumber(minLockedPlanqValue).times(members).toFixed()
    );
    await (
      await validators.registerValidatorGroup(new BigNumber(0.1))
    ).sendAndWaitForReceipt({
      from: groupAccount,
    });
  };

  const setupValidator = async (validatorAccount: string) => {
    await registerAccountWithLockedPlanq(validatorAccount);
    const ecdsaPublicKey = await addressToPublicKey(
      validatorAccount,
      kit.connection.sign
    );
    await validators
      // @ts-ignore
      .registerValidator(ecdsaPublicKey, blsPublicKey, blsPoP)
      .sendAndWaitForReceipt({
        from: validatorAccount,
      });
  };

  test("SBAT registerValidatorGroup", async () => {
    const groupAccount = accounts[0];
    await setupGroup(groupAccount);
    await expect(validators.isValidatorGroup(groupAccount)).resolves.toBe(true);
  });

  test("SBAT registerValidator", async () => {
    const validatorAccount = accounts[1];
    await setupValidator(validatorAccount);
    await expect(validators.isValidator(validatorAccount)).resolves.toBe(true);
  });

  test("SBAT addMember", async () => {
    const groupAccount = accounts[0];
    const validatorAccount = accounts[1];
    await setupGroup(groupAccount);
    await setupValidator(validatorAccount);
    await validators
      .affiliate(groupAccount)
      .sendAndWaitForReceipt({from: validatorAccount});
    await (
      await validators.addMember(groupAccount, validatorAccount)
    ).sendAndWaitForReceipt({
      from: groupAccount,
    });

    const members = await validators
      .getValidatorGroup(groupAccount)
      .then((group) => group.members);
    expect(members).toContain(validatorAccount);
  });

  test("SBAT setNextCommissionUpdate", async () => {
    const groupAccount = accounts[0];
    await setupGroup(groupAccount);
    await validators.setNextCommissionUpdate("0.2").sendAndWaitForReceipt({
      from: groupAccount,
    });
    const commission = (await validators.getValidatorGroup(groupAccount))
      .nextCommission;
    expect(commission).toEqBigNumber("0.2");
  });

  test("SBAT updateCommission", async () => {
    const groupAccount = accounts[0];
    await setupGroup(groupAccount);
    const txOpts = {from: groupAccount};
    await validators
      .setNextCommissionUpdate("0.2")
      .sendAndWaitForReceipt(txOpts);
    await mineBlocks(3, web3);
    await validators.updateCommission().sendAndWaitForReceipt(txOpts);

    const commission = (await validators.getValidatorGroup(groupAccount))
      .commission;
    expect(commission).toEqBigNumber("0.2");
  });

  test("SBAT get group affiliates", async () => {
    const groupAccount = accounts[0];
    const validatorAccount = accounts[1];
    await setupGroup(groupAccount);
    await setupValidator(validatorAccount);
    await validators
      .affiliate(groupAccount)
      .sendAndWaitForReceipt({from: validatorAccount});
    const group = await validators.getValidatorGroup(groupAccount);
    expect(group.affiliates).toContain(validatorAccount);
  });

  describe("SBAT reorderMember", () => {
    jest.setTimeout(30 * 1000);
    let groupAccount: string, validator1: string, validator2: string;

    beforeEach(async () => {
      jest.setTimeout(30 * 1000);

      groupAccount = accounts[0];
      await setupGroup(groupAccount, 2);

      validator1 = accounts[1];
      validator2 = accounts[2];

      for (const validator of [validator1, validator2]) {
        await setupValidator(validator);
        await validators
          .affiliate(groupAccount)
          .sendAndWaitForReceipt({from: validator});
        await (
          await validators.addMember(groupAccount, validator)
        ).sendAndWaitForReceipt({
          from: groupAccount,
        });
      }

      const members = await validators
        .getValidatorGroup(groupAccount)
        .then((group) => group.members);
      expect(members).toEqual([validator1, validator2]);
    });

    test("move last to first", async () => {
      jest.setTimeout(30 * 1000);

      await validators
        .reorderMember(groupAccount, validator2, 0)
        .then((x) => x.sendAndWaitForReceipt({from: groupAccount}));

      const membersAfter = await validators
        .getValidatorGroup(groupAccount)
        .then((group) => group.members);

      expect(membersAfter).toEqual([validator2, validator1]);
    });

    test("move first to last", async () => {
      jest.setTimeout(30 * 1000);

      await validators
        .reorderMember(groupAccount, validator1, 1)
        .then((x) => x.sendAndWaitForReceipt({from: groupAccount}));

      const membersAfter = await validators
        .getValidatorGroup(groupAccount)
        .then((group) => group.members);

      expect(membersAfter).toEqual([validator2, validator1]);
    });

    test("test address normalization", async () => {
      jest.setTimeout(30 * 1000);

      await validators
        .reorderMember(groupAccount, validator2.toLowerCase(), 0)
        .then((x) => x.sendAndWaitForReceipt({from: groupAccount}));

      const membersAfter = await validators
        .getValidatorGroup(groupAccount)
        .then((group) => group.members);

      expect(membersAfter).toEqual([validator2, validator1]);
    });
  });
});
