import { printValueMapRecursive } from '../../utils/cli'
import { ReleasePlanqBaseCommand } from '../../utils/release-planq-base'

export default class Show extends ReleasePlanqBaseCommand {
  static description = 'Show info on a ReleasePlanq instance contract.'

  static flags = {
    ...ReleasePlanqBaseCommand.flags,
  }

  static examples = ['show --contract 0x47e172F6CfB6c7D01C1574fa3E2Be7CC73269D95']

  async run() {
    const balanceStateData = {
      totalWithdrawn: await this.releasePlanqWrapper.getTotalWithdrawn(),
      maxDistribution: await this.releasePlanqWrapper.getMaxDistribution(),
      totalBalance: await this.releasePlanqWrapper.getTotalBalance(),
      remainingTotalBalance: await this.releasePlanqWrapper.getRemainingTotalBalance(),
      remainingUnlockedBalance: await this.releasePlanqWrapper.getRemainingUnlockedBalance(),
      remainingLockedBalance: await this.releasePlanqWrapper.getRemainingLockedBalance(),
      currentReleasedTotalAmount: await this.releasePlanqWrapper.getCurrentReleasedTotalAmount(),
    }
    const accounts = await this.kit.contracts.getAccounts()
    const isAccount = await accounts.isAccount(this.releasePlanqWrapper.address)
    const authorizedSigners = isAccount
      ? {
          voter: await accounts.getVoteSigner(this.releasePlanqWrapper.address),
          validator: await accounts.getValidatorSigner(this.releasePlanqWrapper.address),
          attestations: await accounts.getAttestationSigner(this.releasePlanqWrapper.address),
        }
      : { voter: null, validator: null, attestations: null }
    const releasePlanqInfo = {
      releasePlanqWrapperAddress: this.releasePlanqWrapper.address,
      beneficiary: await this.releasePlanqWrapper.getBeneficiary(),
      authorizedSigners,
      releaseOwner: await this.releasePlanqWrapper.getReleaseOwner(),
      owner: await this.releasePlanqWrapper.getOwner(),
      refundAddress: await this.releasePlanqWrapper.getRefundAddress(),
      liquidityProvisionMet: await this.releasePlanqWrapper.getLiquidityProvisionMet(),
      canValidate: await this.releasePlanqWrapper.getCanValidate(),
      canVote: await this.releasePlanqWrapper.getCanVote(),
      releaseSchedule: await this.releasePlanqWrapper.getHumanReadableReleaseSchedule(),
      isRevoked: await this.releasePlanqWrapper.isRevoked(),
      revokedStateData: await this.releasePlanqWrapper.getRevocationInfo(),
      balanceStateData: balanceStateData,
    }
    printValueMapRecursive(releasePlanqInfo)
  }
}
