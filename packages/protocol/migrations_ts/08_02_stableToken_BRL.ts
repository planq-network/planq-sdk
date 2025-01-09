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
import { ReserveInstance, StableTokenBRLInstance } from 'types/mento'
import Web3 from 'web3'
import { ASTONIC_PACKAGE } from '../contractPackages'
import { ArtifactsSingleton } from '../lib/artifactsSingleton'

const truffle = require('@planq-network/protocol/truffle-config.js')

const initializeArgs = async (): Promise<any[]> => {
  const rate = toFixed(config.stableTokenBRL.inflationRate)
  return [
    config.stableTokenBRL.tokenName,
    config.stableTokenBRL.tokenSymbol,
    config.stableTokenBRL.decimals,
    config.registry.predeployedProxyAddress,
    rate.toString(),
    config.stableTokenBRL.inflationPeriod,
    config.stableTokenBRL.initialBalances.addresses,
    config.stableTokenBRL.initialBalances.values,
    'ExchangeBRL',
  ]
}

// TODO make this general
module.exports = deploymentForCoreContract<StableTokenBRLInstance>(
  web3,
  artifacts,
  PlanqContractName.StableTokenBRL,
  initializeArgs,
  async (stableToken: StableTokenBRLInstance, _web3: Web3, networkName: string) => {
    if (config.stableTokenBRL.frozen) {
      const freezer: FreezerInstance = await getDeployedProxiedContract<FreezerInstance>(
        'Freezer',
        artifacts
      )
      await freezer.freeze(stableToken.address)
    }
    const sortedOracles: SortedOraclesInstance =
      await getDeployedProxiedContract<SortedOraclesInstance>('SortedOracles', artifacts)

    for (const oracle of config.stableTokenBRL.oracles) {
      console.info(`Adding ${oracle} as an Oracle for StableToken (BRL)`)
      await sortedOracles.addOracle(stableToken.address, ensureLeading0x(oracle))
    }

    const planqPrice = config.stableTokenBRL.planqPrice
    if (planqPrice) {
      const fromAddress = truffle.networks[networkName].from
      const isOracle = config.stableTokenBRL.oracles.some((o) => eqAddress(o, fromAddress))
      if (!isOracle) {
        console.warn(
          `Planq price specified in migration but ${fromAddress} not explicitly authorized as oracle, authorizing...`
        )
        await sortedOracles.addOracle(stableToken.address, ensureLeading0x(fromAddress))
      }
      console.info('Reporting price of StableToken (BRL) to oracle')
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
      console.info('Adding StableToken (BRL) to Reserve')
      await reserve.addToken(stableToken.address)
    }

    console.info('Whitelisting StableToken (BRL) as a fee currency')
    const feeCurrencyWhitelist: FeeCurrencyWhitelistInstance =
      await getDeployedProxiedContract<FeeCurrencyWhitelistInstance>(
        'FeeCurrencyWhitelist',
        artifacts
      )
    await feeCurrencyWhitelist.addToken(stableToken.address)
  },
  ASTONIC_PACKAGE
)
