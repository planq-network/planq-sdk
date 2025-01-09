import { PlanqContractName } from '@planq-network/protocol/lib/registry-utils'
import { deploymentForCoreContract } from '@planq-network/protocol/lib/web3-utils'
import { config } from '@planq-network/protocol/migrationsConfig'
import { toFixed } from '@planq-network/utils/lib/fixidity'
import { ValidatorsInstance } from 'types'

const initializeArgs = async (): Promise<any[]> => {
  return [
    config.registry.predeployedProxyAddress,
    config.validators.groupLockedPlanqRequirements.value,
    config.validators.groupLockedPlanqRequirements.duration,
    config.validators.validatorLockedPlanqRequirements.value,
    config.validators.validatorLockedPlanqRequirements.duration,
    config.validators.validatorScoreParameters.exponent,
    toFixed(config.validators.validatorScoreParameters.adjustmentSpeed).toFixed(),
    config.validators.membershipHistoryLength,
    config.validators.slashingPenaltyResetPeriod,
    config.validators.maxGroupSize,
    config.validators.commissionUpdateDelay,
    config.validators.downtimeGracePeriod,
  ]
}

module.exports = deploymentForCoreContract<ValidatorsInstance>(
  web3,
  artifacts,
  PlanqContractName.Validators,
  initializeArgs
)
