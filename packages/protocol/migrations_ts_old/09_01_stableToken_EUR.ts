/* tslint:disable:no-console */
import { ensureLeading0x, eqAddress, NULL_ADDRESS } from '@planq-network/base/lib/address'
import { PlanqContractName } from '@planq-network/protocol/lib/registry-utils'
import {
  deploymentForCoreContract,
  getDeployedProxiedContract,
} from '@planq-network/protocol/lib/web3-utils'
import { config } from '@planq-network/protocol/migrationsConfig'
import { toFixed } from '@planq-network/utils/lib/fixidity'
import { FeeCurrencyWhitelistInstance, FreezerInstance, SortedOraclesInstance } from 'types'
import { ReserveInstance, StableTokenEURInstance } from 'types/mento'
import Web3 from 'web3'
import { ASTONIC_PACKAGE } from '../contractPackages'
import { ArtifactsSingleton } from '../lib/artifactsSingleton'

const truffle = require('@planq-network/protocol/truffle-config.js')

const initializeArgs = async (): Promise<any[]> => {
  const rate = toFixed(config.stableTokenEUR.inflationRate)
  return [
    config.stableTokenEUR.tokenName,
    config.stableTokenEUR.tokenSymbol,
    config.stableTokenEUR.decimals,
    config.registry.predeployedProxyAddress,
    rate.toString(),
    config.stableTokenEUR.inflationPeriod,
    config.stableTokenEUR.initialBalances.addresses,
    config.stableTokenEUR.initialBalances.values,
    'ExchangeEUR',
  ]
}

// TODO make this general (do it!)
module.exports = deploymentForCoreContract<StableTokenEURInstance>(
  web3,
  artifacts,
  PlanqContractName.StableTokenEUR,
  initializeArgs,
  async (stableToken: StableTokenEURInstance, _web3: Web3, networkName: string) => {
    if (config.stableTokenEUR.frozen) {
      const freezer: FreezerInstance = await getDeployedProxiedContract<FreezerInstance>(
        'Freezer',
        artifacts
      )
      await freezer.freeze(stableToken.address)
    }
    const sortedOracles: SortedOraclesInstance =
      await getDeployedProxiedContract<SortedOraclesInstance>('SortedOracles', artifacts)

    for (const oracle of config.stableTokenEUR.oracles) {
      console.info(`Adding ${oracle} as an Oracle for StableToken (EUR)`)
      await sortedOracles.addOracle(stableToken.address, ensureLeading0x(oracle))
    }

    const planqPrice = config.stableTokenEUR.planqPrice
    if (planqPrice) {
      const fromAddress = truffle.networks[networkName].from
      const isOracle = config.stableTokenEUR.oracles.some((o) => eqAddress(o, fromAddress))
      if (!isOracle) {
        console.warn(
          `Planq price specified in migration but ${fromAddress} not explicitly authorized as oracle, authorizing...`
        )
        await sortedOracles.addOracle(stableToken.address, ensureLeading0x(fromAddress))
      }
      console.info('Reporting price of StableToken (EUR) to oracle')
      await sortedOracles.report(
        stableToken.address,
        toFixed(planqPrice),
        NULL_ADDRESS,
        NULL_ADDRESS
      )
      const reserve: ReserveInstance = await getDeployedProxiedContract<ReserveInstance>(
        'Reserve',
        ArtifactsSingleton.getInstance(ASTONIC_PACKAGE)
      )
      console.info('Adding StableToken (EUR) to Reserve')
      await reserve.addToken(stableToken.address)
    }

    console.info('Whitelisting StableToken (EUR) as a fee currency')
    const feeCurrencyWhitelist: FeeCurrencyWhitelistInstance =
      await getDeployedProxiedContract<FeeCurrencyWhitelistInstance>(
        'FeeCurrencyWhitelist',
        artifacts
      )
    await feeCurrencyWhitelist.addToken(stableToken.address)
  },
  ASTONIC_PACKAGE
)
