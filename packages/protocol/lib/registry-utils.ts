/**
 * Be careful when adding to this file or relying on this file.
 * The verification tooling uses the PlanqContractName enum as a
 * source of truth for what contracts are considered "core" and
 * need to be checked for backwards compatability and bytecode on
 * an environment.
 */

import { ASTONIC_PACKAGE } from "../contractPackages"

export const planqRegistryAddress = '0x000000000000000000000000000000000000ce10'

export enum PlanqContractName {
  Accounts = 'Accounts',
  Attestations = 'Attestations',
  BlockchainParameters = 'BlockchainParameters',
  DoubleSigningSlasher = 'DoubleSigningSlasher',
  DowntimeSlasher = 'DowntimeSlasher',
  Election = 'Election',
  EpochRewards = 'EpochRewards',
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
  GovernanceSlasher = 'GovernanceSlasher',
  GovernanceApproverMultiSig = 'GovernanceApproverMultiSig',
  GrandaMento = 'GrandaMento',
  LockedPlanq = 'LockedPlanq',
  OdisPayments = 'OdisPayments',
  Random = 'Random',
  Reserve = 'Reserve',
  ReserveSpenderMultiSig = 'ReserveSpenderMultiSig',
  SortedOracles = 'SortedOracles',
  StableToken = 'StableToken',
  StableTokenEUR = 'StableTokenEUR',
  StableTokenBRL = 'StableTokenBRL',
  Validators = 'Validators',
}

export const usesRegistry = [
  PlanqContractName.Reserve,
  PlanqContractName.StableToken,
]

export const hasEntryInRegistry= [
  {
    contracts:[
      PlanqContractName.Accounts,
      PlanqContractName.Attestations,
      PlanqContractName.BlockchainParameters,
      PlanqContractName.DoubleSigningSlasher,
      PlanqContractName.DowntimeSlasher,
      PlanqContractName.Election,
      PlanqContractName.Escrow,
      PlanqContractName.FederatedAttestations,
      PlanqContractName.FeeCurrencyWhitelist,
      PlanqContractName.Freezer,
      PlanqContractName.GasPriceMinimum,
      PlanqContractName.PlanqToken,
      PlanqContractName.GovernanceSlasher,
      PlanqContractName.OdisPayments,
      PlanqContractName.Random,
      PlanqContractName.SortedOracles,
    ]
  },
  {
    ...ASTONIC_PACKAGE,
    // not all Mentro contracts are supposed to be in the Registry
    contracts:[
      PlanqContractName.Exchange,
      PlanqContractName.GrandaMento,
      PlanqContractName.Reserve,
      PlanqContractName.StableToken,
    ],
  }
]
