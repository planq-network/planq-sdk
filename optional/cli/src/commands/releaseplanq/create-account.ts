import { newCheckBuilder } from '../../utils/checks'
import { displaySendTx } from '../../utils/cli'
import { ReleasePlanqBaseCommand } from '../../utils/release-planq-base'
export default class CreateAccount extends ReleasePlanqBaseCommand {
  static description = 'Creates a new account for the ReleasePlanq instance'

  static flags = {
    ...ReleasePlanqBaseCommand.flags,
  }

  static args = []

  static examples = ['create-account --contract 0x5409ED021D9299bf6814279A6A1411A7e866A631']

  async run() {
    const isRevoked = await this.releasePlanqWrapper.isRevoked()
    await newCheckBuilder(this)
      .isNotAccount(this.releasePlanqWrapper.address)
      .addCheck('Contract is not revoked', () => !isRevoked)
      .runChecks()

    this.kit.defaultAccount = await this.releasePlanqWrapper.getBeneficiary()
    await displaySendTx('createAccount', this.releasePlanqWrapper.createAccount())
  }
}
