import {newKit} from "@planq-network/contractkit";
import {
  EncryptionKeySigner,
  OdisContextName,
  WalletKeySigner,
} from "@planq-network/identity/lib/odis/query";
import {AuthenticationMethod} from "@planq-network/phone-number-privacy-common";
import {PhoneNumberUtils} from "@planq-network/phone-utils";
import {
  ensureLeading0x,
  normalizeAddressWith0x,
  privateKeyToAddress,
} from "@planq-network/utils/lib/address";
import "isomorphic-fetch";

require("dotenv").config();

export const getTestContextName = (): OdisContextName => {
  switch (process.env.CONTEXT_NAME) {
    case "atlas":
      return OdisContextName.ATLAS;
    case "staging":
      return OdisContextName.STAGING;
    case "mainnet":
      return OdisContextName.MAINNET;
    default:
      throw new Error("CONTEXT_NAME env var is undefined or invalid");
  }
};

/**
 * CONSTS
 */
export const DEFAULT_FORNO_URL =
  process.env.ODIS_BLOCKCHAIN_PROVIDER ?? "https://evm-atlas.planq.network";

export const PRIVATE_KEY =
  "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
export const ACCOUNT_ADDRESS = normalizeAddressWith0x(
  privateKeyToAddress(PRIVATE_KEY)
); // 0x1be31a94361a391bbafb2a4ccd704f57dc04d4bb

export const PRIVATE_KEY_NO_QUOTA =
  "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890000000";
export const ACCOUNT_ADDRESS_NO_QUOTA =
  privateKeyToAddress(PRIVATE_KEY_NO_QUOTA);

export const PHONE_NUMBER = "+17777777777";
export const BLINDING_FACTOR = Buffer.from(
  "0IsBvRfkBrkKCIW6HV0/T1zrzjQSe8wRyU3PKojCnww=",
  "base64"
);
// BLINDED_PHONE_NUMBER value is dependent on PHONE_NUMBER AND BLINDING_FACTOR
// hardcoding to avoid importing blind_threshols_bls library
export const BLINDED_PHONE_NUMBER =
  "hZXDhpC5onzBSFa1agZ9vfHzqwJ/QeJg77NGvWiQG/sFWsvHETzZvdWr2GpF3QkB";

export const PHONE_HASH_IDENTIFIER =
  PhoneNumberUtils.getPhoneHash(PHONE_NUMBER);

export const CONTACT_PHONE_NUMBER = "+14155559999";
export const CONTACT_PHONE_NUMBERS = [CONTACT_PHONE_NUMBER];

/**
 * RESOURCES AND UTILS
 */
export const contractKit = newKit(DEFAULT_FORNO_URL);
contractKit.addAccount(PRIVATE_KEY_NO_QUOTA);
contractKit.addAccount(PRIVATE_KEY);
contractKit.defaultAccount = ACCOUNT_ADDRESS;

interface DEK {
  privateKey: string;
  publicKey: string;
  address: string;
}

export const deks: DEK[] = [
  {
    privateKey:
      "bf8a2b73baf8402f8fe906ad3f42b560bf14b39f7df7797ece9e293d6f162188",
    publicKey:
      "034846bc781cacdafc66f3a77aa9fc3c56a9dadcd683c72be3c446fee8da041070",
    address: "0x7b33dF2607b85e3211738a49A6Ad6E8Ed4d13F6E",
  },
  {
    privateKey:
      "0975b0c565abc75b6638a749ea3008cb52676af3eabe4b80e19c516d82330364",
    publicKey:
      "03b1ac8c445f0796978018c087b97e8213b32c39e6a8642ae63dce71da33a19f65",
    address: "0x34332049B07Fab9a2e843A7C8991469d93cF6Ae6",
  },
];
// The following code can be used to generate more test DEKs
// const generateDEKs = (n: number): Promise<DEK[]> => Promise.all([...Array(n).keys()].map(
//   async () => await deriveDek(await generateMnemonic())
// ))

export const dekAuthSigner = (index: number): EncryptionKeySigner => {
  return {
    authenticationMethod: AuthenticationMethod.ENCRYPTION_KEY,
    rawKey: ensureLeading0x(deks[index].privateKey),
  };
};

export const walletAuthSigner: WalletKeySigner = {
  authenticationMethod: AuthenticationMethod.WALLET_KEY,
  contractKit,
};
