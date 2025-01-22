import {PlanqTokenType, StableToken, Token} from "@planq-network/base";
import {BigNumber} from "bignumber.js";
import {AddressRegistry} from "./address-registry";
import {
  PlanqContract,
  PlanqTokenContract,
  ExchangeContract,
  StableTokenContract,
} from "./base";
import {ContractCacheType} from "./basic-contract-cache-type";
import {PlanqTokenWrapper} from "./wrappers/PlanqTokenWrapper";
import {StableTokenWrapper} from "./wrappers/StableTokenWrapper";
import {PlanqToken} from "./generated/PlanqToken";
export {PlanqTokenType, StableToken, Token} from "@planq-network/base";

export type EachPlanqToken<T> = {
  [key in PlanqTokenType]?: T;
};

export type PlanqTokensWrapper =
  | PlanqTokenWrapper<PlanqToken>
  | StableTokenWrapper;

export interface PlanqTokenInfo {
  contract: PlanqTokenContract;
  symbol: PlanqTokenType;
}

export interface StableTokenInfo extends PlanqTokenInfo {
  contract: StableTokenContract;
  exchangeContract: ExchangeContract;
}

/** Basic info for each stable token */
export const stableTokenInfos: {
  [key in StableToken]: StableTokenInfo;
} = {
  [StableToken.aUSD]: {
    contract: PlanqContract.StableToken,
    exchangeContract: PlanqContract.Exchange,
    symbol: StableToken.aUSD,
  },
  [StableToken.aEUR]: {
    contract: PlanqContract.StableTokenEUR,
    exchangeContract: PlanqContract.ExchangeEUR,
    symbol: StableToken.aEUR,
  },
  [StableToken.aREAL]: {
    contract: PlanqContract.StableTokenBRL,
    exchangeContract: PlanqContract.ExchangeBRL,
    symbol: StableToken.aREAL,
  },
};

/** Basic info for each supported planq token, including stable tokens */
export const planqTokenInfos: {
  [key in PlanqTokenType]: PlanqTokenInfo;
} = {
  [Token.PLQ]: {
    contract: PlanqContract.PlanqToken,
    symbol: Token.PLQ,
  },
  ...stableTokenInfos,
};

/**
 * A helper class to interact with all Planq tokens, ie PLQ and stable tokens
 */
export class PlanqTokens {
  constructor(
    readonly contracts: ContractCacheType,
    readonly registry: AddressRegistry
  ) {}

  /**
   * Gets an address's balance for each planq token.
   * @param address the address to look up the balances for
   * @return a promise resolving to an object containing the address's balance
   *  for each planq token
   */
  balancesOf(address: string): Promise<EachPlanqToken<BigNumber>> {
    return this.forEachPlanqToken(async (info: PlanqTokenInfo) => {
      const wrapper = await this.contracts.getContract(info.contract);
      return wrapper.balanceOf(address);
    });
  }

  /**
   * Gets the wrapper for each planq token.
   * @return an promise resolving to an object containing the wrapper for each planq token.
   */
  getWrappers(): Promise<EachPlanqToken<PlanqTokensWrapper>> {
    return this.forEachPlanqToken((info: PlanqTokenInfo) =>
      this.contracts.getContract(info.contract)
    );
  }

  /**
   * Gets the address for each planq token proxy contract.
   * @return an promise resolving to an object containing the address for each planq token proxy.
   */
  getAddresses(): Promise<EachPlanqToken<string>> {
    return this.forEachPlanqToken((info: PlanqTokenInfo) =>
      this.registry.addressFor(info.contract)
    );
  }

  async getStablesConfigs(humanReadable: boolean = false) {
    return this.forStablePlanqToken(async (info: StableTokenInfo) => {
      const stableWrapper = await this.contracts.getContract(info.contract);
      if (humanReadable) {
        return stableWrapper.getHumanReadableConfig();
      }
      return stableWrapper.getConfig();
    });
  }

  async getExchangesConfigs(humanReadable: boolean = false) {
    return this.forStablePlanqToken(async (info: StableTokenInfo) => {
      const exchangeWrapper = await this.contracts.getContract(
        info.exchangeContract
      );
      if (humanReadable) {
        return exchangeWrapper.getHumanReadableConfig();
      }
      return exchangeWrapper.getConfig();
    });
  }

  /**
   * Runs fn for each planq token found in planqTokenInfos, and returns the
   * value of each call in an object keyed by the token.
   * @param fn the function to be called for each PlanqTokenInfo.
   * @return an object containing the resolved value the call to fn for each
   *  planq token.
   */
  async forEachPlanqToken<T>(
    fn: (info: PlanqTokenInfo) => T | Promise<T>
  ): Promise<EachPlanqToken<T>> {
    const wrapperInfoFunction = async () =>
      Promise.all(
        (await this.validPlanqTokenInfos()).map(async (info) => {
          const fnResult = fn(info);
          return {
            symbol: info.symbol,
            data: await fnResult,
          };
        })
      );
    return this.forEachWrapperInfo(wrapperInfoFunction);
  }

  /**
   * Runs fn for each stable token found in stableTokenInfos, and returns the
   * value of each call in an object keyed by the token.
   * @param fn the function to be called for each StableTokenInfo.
   * @return an object containing the resolved value the call to fn for each
   *  planq token.
   */
  async forStablePlanqToken<T>(
    fn: (info: StableTokenInfo) => T | Promise<T>
  ): Promise<EachPlanqToken<T>> {
    const wrapperInfoFunction = async () =>
      Promise.all(
        (await this.validStableTokenInfos()).map(async (info) => {
          const fnResult = fn(info);
          return {
            symbol: info.symbol,
            data: await fnResult,
          };
        })
      );
    return this.forEachWrapperInfo(wrapperInfoFunction);
  }

  private async forEachWrapperInfo<T>(
    fn: () => Promise<Array<{symbol: PlanqTokenType; data: T}>>
  ): Promise<EachPlanqToken<T>> {
    return (await fn()).reduce(
      (
        obj: {
          [key in PlanqTokenType]?: T;
        },
        wrapperInfo
      ) => ({
        ...obj,
        [wrapperInfo.symbol]: wrapperInfo.data,
      }),
      {}
    ) as EachPlanqToken<T>;
  }

  async validPlanqTokenInfos(): Promise<PlanqTokenInfo[]> {
    const results = await Promise.all(
      Object.values(planqTokenInfos).map(async (info) => {
        try {
          // The registry add the valid addresses to a cache
          await this.registry.addressFor(info.contract);
          return true;
        } catch {
          // The contract was not deployed in the chain
          return false;
        }
      })
    );

    return Object.values(planqTokenInfos).filter((_v, index) => results[index]);
  }

  async validStableTokenInfos(): Promise<StableTokenInfo[]> {
    const results = await Promise.all(
      Object.values(stableTokenInfos).map(async (info) => {
        try {
          // The registry add the valid addresses to a cache
          await this.registry.addressFor(info.contract);
          await this.registry.addressFor(info.exchangeContract);
          return true;
        } catch {
          // The contract was not deployed in the chain
          return false;
        }
      })
    );

    return Object.values(stableTokenInfos).filter(
      (_v, index) => results[index]
    );
  }

  /**
   * Gets the wrapper for a given planq token.
   * @param token the token to get the appropriate wrapper for
   * @return an promise resolving to the wrapper for the token
   */
  getWrapper(token: StableToken): Promise<StableTokenWrapper>;
  getWrapper(token: Token): Promise<PlanqTokensWrapper>;
  getWrapper(token: PlanqTokenType): Promise<PlanqTokensWrapper>;
  getWrapper(token: PlanqTokenType): Promise<PlanqTokensWrapper> {
    return this.contracts.getContract(planqTokenInfos[token].contract);
  }

  /**
   * Gets the contract for the provided token
   * @param token the token to get the contract of
   * @return The contract for the token
   */
  getContract(token: StableToken): StableTokenContract;
  getContract(token: PlanqTokenType): PlanqTokenContract {
    return planqTokenInfos[token].contract;
  }

  /**
   * Gets the exchange contract for the provided stable token
   * @param token the stable token to get exchange contract of
   * @return The exchange contract for the token
   */
  getExchangeContract(token: StableToken) {
    return stableTokenInfos[token].exchangeContract;
  }

  /**
   * Gets the address of the contract for the provided token.
   * @param token the token to get the (proxy) contract address for
   * @return A promise resolving to the address of the token's contract
   */
  getAddress = (token: PlanqTokenType) =>
    this.registry.addressFor(planqTokenInfos[token].contract);

  /**
   * Gets the address to use as the feeCurrency when paying for gas with the
   *  provided token.
   * @param token the token to get the feeCurrency address for
   * @return If not PLQ, the address of the token's contract. If PLQ, undefined.
   */
  getFeeCurrencyAddress(token: PlanqTokenType) {
    if (token === Token.PLQ) {
      return undefined;
    }
    return this.getAddress(token);
  }

  /**
   * Returns if the provided token is a StableToken
   * @param token the token
   * @return if token is a StableToken
   */
  isStableToken(token: PlanqTokenType) {
    // We cast token as StableToken to make typescript happy
    return Object.values(StableToken).includes(token as StableToken);
  }

  isStableTokenContract = isStableTokenContract;
}

export function isStableTokenContract(contract: PlanqContract) {
  const allStableTokenContracts = Object.values(StableToken).map(
    (token) => stableTokenInfos[token].contract
  );
  // We cast token as StableTokenContract to make typescript happy
  return allStableTokenContracts.includes(contract as StableTokenContract);
}
