import { flags } from '@oclif/command'
import prompts from 'prompts'
import { newCheckBuilder } from '../../utils/checks'
import { displaySendTx } from '../../utils/cli'
import { ReleasePlanqBaseCommand } from '../../utils/release-planq-base'

export default class Revoke extends ReleasePlanqBaseCommand {
  static description =
    'Revoke the given contract instance. Once revoked, any Locked Planq can be unlocked by the release owner. The beneficiary will then be able to withdraw any released Planq that had yet to be withdrawn, and the remainder can be transferred by the release owner to the refund address. Note that not all ReleasePlanq instances are revokable.'

  static flags = {
    ...ReleasePlanqBaseCommand.flags,
    yesreally: flags.boolean({ description: 'Override prompt to set liquidity (be careful!)' }),
  }

  static args = []

  static examples = ['revoke --contract 0x5409ED021D9299bf6814279A6A1411A7e866A631']

  async run() {
    // tslint:disable-next-line
    const { flags } = this.parse(Revoke)

    const isRevoked = await this.releasePlanqWrapper.isRevoked()
    const isRevocable = await this.releasePlanqWrapper.isRevocable()

    await newCheckBuilder(this)
      .addCheck('Contract is not revoked', () => !isRevoked)
      .addCheck('Contract is revocable', () => isRevocable)
      .runChecks()

    if (!flags.yesreally) {
      const response = await prompts({
        type: 'confirm',
        name: 'confirmation',
        message: 'Are you sure you want to revoke this contract? (y/n)',
      })

      if (!response.confirmation) {
        console.info('Aborting due to user response')
        process.exit(0)
      }
    }

    this.kit.defaultAccount = await this.releasePlanqWrapper.getReleaseOwner()
    await displaySendTx('revokeReleasing', await this.releasePlanqWrapper.revokeReleasing())
  }
}
