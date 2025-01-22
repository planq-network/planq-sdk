/* tslint:disable:no-console */

import {PlanqContractName} from "@planq-network/protocol/lib/registry-utils";
import {
  deploymentForCoreContract,
  getDeployedProxiedContract,
} from "@planq-network/protocol/lib/web3-utils";
import {config} from "@planq-network/protocol/migrationsConfig";
import {toFixed} from "@planq-network/utils/lib/fixidity";
import {FreezerInstance} from "types";
import {ExchangeBRLInstance, ReserveInstance} from "types/mento";
import {ASTONIC_PACKAGE} from "../contractPackages";
import {ArtifactsSingleton} from "../lib/artifactsSingleton";

const initializeArgs = async (): Promise<any[]> => {
  return [
    config.registry.predeployedProxyAddress,
    PlanqContractName.StableTokenBRL,
    toFixed(config.exchange.spread).toString(),
    toFixed(config.exchange.reserveFraction).toString(),
    config.exchange.updateFrequency,
    config.exchange.minimumReports,
  ];
};

module.exports = deploymentForCoreContract<ExchangeBRLInstance>(
  web3,
  artifacts,
  PlanqContractName.ExchangeBRL,
  initializeArgs,
  async (exchange: ExchangeBRLInstance) => {
    if (config.exchange.frozen) {
      const freezer: FreezerInstance =
        await getDeployedProxiedContract<FreezerInstance>("Freezer", artifacts);
      await freezer.freeze(exchange.address);
    }

    const reserve: ReserveInstance =
      await getDeployedProxiedContract<ReserveInstance>(
        "Reserve",
        ArtifactsSingleton.getInstance(ASTONIC_PACKAGE)
      );
    // aUSD doesn't need to be added as it is currently harcoded in Reserve.sol
    await reserve.addExchangeSpender(exchange.address);
    await exchange.activateStable();
  },
  ASTONIC_PACKAGE
);
