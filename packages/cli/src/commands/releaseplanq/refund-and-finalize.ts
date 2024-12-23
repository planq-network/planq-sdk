import { newCheckBuilder } from '../../utils/checks'
import { displaySendTx } from '../../utils/cli'
import { ReleasePlanqBaseCommand } from '../../utils/release-planq-base'

export default class RefundAndFinalize extends ReleasePlanqBaseCommand {
  static description =
    "Refund the given contract's balance to the appopriate parties and destroy the contact. Can only be called by the release owner of revocable ReleasePlanq instances."

  static flags = {
    ...ReleasePlanqBaseCommand.flags,
  }

  static args = []

  static examples = ['refund-and-finalize --contract 0x5409ED021D9299bf6814279A6A1411A7e866A631']

  async run() {
    const isRevoked = await this.releasePlanqWrapper.isRevoked()
    const remainingLockedBalance = await this.releasePlanqWrapper.getRemainingLockedBalance()

    await newCheckBuilder(this)
      .addCheck('Contract is revoked', () => isRevoked)
      .addCheck('All contract planq is unlocked', () => remainingLockedBalance.eq(0))
      .runChecks()

    this.kit.defaultAccount = await this.releasePlanqWrapper.getReleaseOwner()
    await displaySendTx('refundAndFinalize', await this.releasePlanqWrapper.refundAndFinalize())
  }
}
