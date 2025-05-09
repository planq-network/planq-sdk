import {PlanqTx, Connection, Provider} from "@planq-network/connect";
import {testWithGanache} from "@planq-network/dev-utils/lib/ganache-test";
import {
  normalizeAddressWith0x,
  privateKeyToAddress,
} from "@planq-network/utils/lib/address";
import {verifySignature} from "@planq-network/utils/lib/signatureUtils";
import {
  recoverTransaction,
  verifyEIP712TypedDataSigner,
} from "@planq-network/wallet-base";
import net from "net";
import Web3 from "web3";
import {RpcWallet} from "./rpc-wallet";

export const CHAIN_ID = 44378;

// Sample data from the official EIP-712 example:
// https://github.com/ethereum/EIPs/blob/master/assets/eip-712/Example.js
export const TYPED_DATA = {
  types: {
    EIP712Domain: [
      {name: "name", type: "string"},
      {name: "version", type: "string"},
      {name: "chainId", type: "uint256"},
      {name: "verifyingContract", type: "address"},
    ],
    Person: [
      {name: "name", type: "string"},
      {name: "wallet", type: "address"},
    ],
    Mail: [
      {name: "from", type: "Person"},
      {name: "to", type: "Person"},
      {name: "contents", type: "string"},
    ],
  },
  primaryType: "Mail",
  domain: {
    name: "Ether Mail",
    version: "1",
    chainId: 1,
    verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
  },
  message: {
    from: {
      name: "Cow",
      wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
    },
    to: {
      name: "Bob",
      wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
    },
    contents: "Hello, Bob!",
  },
};

export const PRIVATE_KEY1 =
  "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abbdef";
export const ACCOUNT_ADDRESS1 = normalizeAddressWith0x(
  privateKeyToAddress(PRIVATE_KEY1)
);
export const PRIVATE_KEY2 =
  "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890fdeccc";
export const ACCOUNT_ADDRESS2 = normalizeAddressWith0x(
  privateKeyToAddress(PRIVATE_KEY2)
);

const PASSPHRASE = "ce10";
const DURATION = 10000;

// ./build/bin/geth --datadir=./envs/atlasstaging --syncmode=lightest --rpcapi=net,eth,web3,personal --networkid=1101
describe.skip("rpc-wallet", () => {
  it("should work against local geth ipc", async () => {
    const ipcUrl =
      "/Users/yorhodes/planq/blockchain/envs/atlasstaging/geth.ipc";
    const ipcProvider = new Web3.providers.IpcProvider(ipcUrl, net);
    const wallet = new RpcWallet(ipcProvider);
    await wallet.init();

    const account = await wallet.addAccount(PRIVATE_KEY1, PASSPHRASE);
    await wallet.unlockAccount(account, PASSPHRASE, DURATION);

    const tx = {
      from: ACCOUNT_ADDRESS1,
      to: ACCOUNT_ADDRESS2,
      value: 1000,
    };

    const result = await wallet.signTransaction(tx);
    // tslint:disable:no-console
    console.log(result);

    const connection = new Connection(new Web3(ipcUrl), wallet);
    const txResult = await connection.sendSignedTransaction(result.raw);
    // tslint:disable:no-console
    console.log(txResult);
  });
});

testWithGanache("rpc-wallet", (web3) => {
  const provider = web3.currentProvider;
  const rpcWallet = new RpcWallet(provider as Provider);

  describe("with ganache web3 provider", () => {
    let ganacheAccounts: string[];
    beforeAll(async () => {
      await rpcWallet.init();
      ganacheAccounts = await web3.eth.getAccounts();
      ganacheAccounts = ganacheAccounts.map(normalizeAddressWith0x);
    });

    test("initalizes with provider accounts", async () => {
      const accounts = rpcWallet.getAccounts();
      expect(accounts).toEqual(ganacheAccounts);
    });

    test("fails if you add an invalid private key", async () => {
      try {
        await rpcWallet.addAccount(
          "this is not a valid private key",
          PASSPHRASE
        );
        throw new Error("Expected exception to be thrown");
      } catch (e: any) {
        expect(e.message).toBe("Expected 32 bytes of private key");
      }
    });

    test("succeeds if you add a private key without 0x", async () => {
      await rpcWallet.addAccount(PRIVATE_KEY1, PASSPHRASE);
      expect(rpcWallet.hasAccount(ACCOUNT_ADDRESS1)).toBeTruthy();
    });

    test("fails if you add a private key twice", async () => {
      try {
        await rpcWallet.addAccount(PRIVATE_KEY1, PASSPHRASE);
        throw new Error("Expected exception to be thrown");
      } catch (e: any) {
        expect(e.message).toBe(`RpcWallet: account already exists`);
      }
    });

    test("succeeds if you add a private key with 0x", async () => {
      await rpcWallet.addAccount(PRIVATE_KEY2, PASSPHRASE);
      expect(rpcWallet.hasAccount(ACCOUNT_ADDRESS2)).toBeTruthy();
    });

    describe("with added accounts", () => {
      test("all addresses can be retrieved", () => {
        expect(rpcWallet.getAccounts()).toEqual(
          ganacheAccounts.concat([ACCOUNT_ADDRESS1, ACCOUNT_ADDRESS2])
        );
      });

      describe("unlocking", () => {
        test("fails if you use an invalid passphrase", async () => {
          try {
            await rpcWallet.unlockAccount(
              ACCOUNT_ADDRESS1,
              "wrong_passphrase",
              DURATION
            );
          } catch (e: any) {
            expect(e.message).toContain(
              "could not decrypt key with given passphrase"
            );
          }
        });

        test("succeeds if you use the correct passphrase", async () => {
          await rpcWallet.unlockAccount(ACCOUNT_ADDRESS1, PASSPHRASE, DURATION);
          const unlocked = rpcWallet.isAccountUnlocked(ACCOUNT_ADDRESS1);
          expect(unlocked).toBeTruthy();
        });
      });

      describe("signing", () => {
        describe("using an unlocked address", () => {
          beforeAll(async () => {
            await rpcWallet.unlockAccount(
              ACCOUNT_ADDRESS1,
              PASSPHRASE,
              DURATION
            );
          });

          describe("when calling signTransaction", () => {
            let planqTransaction: PlanqTx;

            beforeEach(() => {
              planqTransaction = {
                from: ACCOUNT_ADDRESS1,
                to: ACCOUNT_ADDRESS2,
                chainId: CHAIN_ID,
                value: web3.utils.toWei("1", "ether"),
                nonce: 0,
                gas: "10",
                gasPrice: "99",
                data: "0xabcdef",
              };
            });

            test("succeeds", async () => {
              await expect(
                rpcWallet.signTransaction(planqTransaction)
              ).resolves.not.toBeUndefined();
            });

            // TODO(yorke): enable once fixed: https://github.com/planq-network/planq-sdk/issues/4077
            test.skip("with same signer", async () => {
              const signedTx = await rpcWallet.signTransaction(
                planqTransaction
              );
              const [, recoveredSigner] = recoverTransaction(signedTx.raw);
              expect(normalizeAddressWith0x(recoveredSigner)).toBe(
                normalizeAddressWith0x(ACCOUNT_ADDRESS1)
              );
            });

            // https://github.com/ethereum/go-ethereum/blob/38aab0aa831594f31d02c9f02bfacc0bef48405d/rlp/decode.go#L664
            test.skip("signature with 0x00 prefix is canonicalized", async () => {
              // This tx is carefully constructed to produce an S value with the first byte as 0x00
              const planqTransactionZeroPrefix = {
                from: ACCOUNT_ADDRESS1,
                to: ACCOUNT_ADDRESS2,
                chainId: CHAIN_ID,
                value: web3.utils.toWei("1", "ether"),
                nonce: 65,
                gas: "10",
                gasPrice: "99",
                data: "0xabcdef",
              };

              const signedTx = await rpcWallet.signTransaction(
                planqTransactionZeroPrefix
              );
              expect(signedTx.tx.s.startsWith("0x00")).toBeFalsy();
              const [, recoveredSigner] = recoverTransaction(signedTx.raw);
              expect(normalizeAddressWith0x(recoveredSigner)).toBe(
                normalizeAddressWith0x(ACCOUNT_ADDRESS1)
              );
            });
          });

          // ganache
          describe.skip("when calling signPersonalMessage", () => {
            test("succeeds", async () => {
              const hexStr: string = ACCOUNT_ADDRESS2;
              const signedMessage = await rpcWallet.signPersonalMessage(
                ACCOUNT_ADDRESS1,
                hexStr
              );
              expect(signedMessage).not.toBeUndefined();
              const valid = verifySignature(
                hexStr,
                signedMessage,
                ACCOUNT_ADDRESS1
              );
              expect(valid).toBeTruthy();
            });
          });

          describe.skip("when calling signTypedData", () => {
            test("succeeds", async () => {
              const signedMessage = await rpcWallet.signTypedData(
                ACCOUNT_ADDRESS1,
                TYPED_DATA
              );
              expect(signedMessage).not.toBeUndefined();
              const valid = verifyEIP712TypedDataSigner(
                TYPED_DATA,
                signedMessage,
                ACCOUNT_ADDRESS1
              );
              expect(valid).toBeTruthy();
            });
          });
        });
      });
    });
  });
});
