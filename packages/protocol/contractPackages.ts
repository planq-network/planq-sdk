export interface ContractPackage {
  path?: string;
  name?: string;
  contracts: string[];
  proxyContracts?: string[];
}

export const ASTONIC_PACKAGE: ContractPackage = {
  path: "astonic-core",
  name: "astonic",
  contracts: [
    "Exchange",
    "ExchangeEUR",
    "ExchangeBRL",
    "GrandaMento",
    "Reserve",
    "ReserveSpenderMultiSig",
    "StableToken",
    "StableTokenEUR",
    "StableTokenBRL",
  ],
  proxyContracts: [
    "ExchangeBRLProxy",
    "ExchangeEURProxy",
    "ExchangeProxy",
    "GrandaMentoProxy",
    "ReserveProxy",
    "ReserveSpenderMultiSigProxy",
    "StableTokenBRLProxy",
    "StableTokenEURProxy",
    "StableTokenProxy",
  ],
};
