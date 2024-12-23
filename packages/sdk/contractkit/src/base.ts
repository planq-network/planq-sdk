export enum PlanqContract {
  Accounts = 'Accounts',
  Attestations = 'Attestations',
  BlockchainParameters = 'BlockchainParameters',
  DoubleSigningSlasher = 'DoubleSigningSlasher',
  DowntimeSlasher = 'DowntimeSlasher',
  Election = 'Election',
  EpochRewards = 'EpochRewards',
  ERC20 = 'ERC20',
  Escrow = 'Escrow',
  Exchange = 'Exchange',
  ExchangeEUR = 'ExchangeEUR',
  ExchangeBRL = 'ExchangeBRL',
  FederatedAttestations = 'FederatedAttestations',
  FeeCurrencyWhitelist = 'FeeCurrencyWhitelist',
  Freezer = 'Freezer',
  GasPriceMinimum = 'GasPriceMinimum',
  PlanqToken = 'PlanqToken',
  Governance = 'Governance',
  GrandaMento = 'GrandaMento',
  LockedPlanq = 'LockedPlanq',
  MetaTransactionWallet = 'MetaTransactionWallet',
  MetaTransactionWalletDeployer = 'MetaTransactionWalletDeployer',
  MultiSig = 'MultiSig',
  OdisPayments = 'OdisPayments',
  Random = 'Random',
  Registry = 'Registry',
  Reserve = 'Reserve',
  SortedOracles = 'SortedOracles',
  StableToken = 'StableToken',
  StableTokenEUR = 'StableTokenEUR',
  StableTokenBRL = 'StableTokenBRL',
  Validators = 'Validators',
}

export type StableTokenContract =
  | PlanqContract.StableToken
  | PlanqContract.StableTokenEUR
  | PlanqContract.StableTokenBRL

export type ExchangeContract =
  | PlanqContract.Exchange
  | PlanqContract.ExchangeEUR
  | PlanqContract.ExchangeBRL

export type PlanqTokenContract = StableTokenContract | PlanqContract.PlanqToken
/**
 * Deprecated alias for PlanqTokenContract.
 * @deprecated Use PlanqTokenContract instead
 */
export type PlanqToken = PlanqTokenContract

export const AllContracts = Object.keys(PlanqContract) as PlanqContract[]
const AuxiliaryContracts = [
  PlanqContract.MultiSig,
  PlanqContract.MetaTransactionWalletDeployer,
  PlanqContract.MetaTransactionWallet,
  PlanqContract.ERC20,
]
export const RegisteredContracts = AllContracts.filter((v) => !AuxiliaryContracts.includes(v))

/** @internal */
export const stripProxy = (contract: PlanqContract) => contract.replace('Proxy', '') as PlanqContract

/** @internal */
export const suffixProxy = (contract: PlanqContract) =>
  contract.endsWith('Proxy') ? contract : (`${contract}Proxy` as PlanqContract)

export const ProxyContracts = AllContracts.map((c) => suffixProxy(c))
