import { flags } from '@oclif/command'
import prompts from 'prompts'
import { newCheckBuilder } from '../../utils/checks'
import { displaySendTx } from '../../utils/cli'
import { ReleasePlanqBaseCommand } from '../../utils/release-planq-base'

export default class SetCanExpire extends ReleasePlanqBaseCommand {
  static description = 'Set the canExpire flag for the given ReleasePlanq contract'

  static expireOptions = ['true', 'false', 'True', 'False']

  static flags = {
    ...ReleasePlanqBaseCommand.flags,
    value: flags.enum({
      options: SetCanExpire.expireOptions,
      required: true,
      description: 'canExpire value',
    }),
    yesreally: flags.boolean({
      description: 'Override prompt to set expiration flag (be careful!)',
    }),
  }

  static args = []

  static examples = [
    'set-can-expire --contract 0x5409ED021D9299bf6814279A6A1411A7e866A631 --value true',
  ]

  async run() {
    // tslint:disable-next-line
    const { flags } = this.parse(SetCanExpire)
    const canExpire = flags.value === 'true' || flags.value === 'True' ? true : false

    await newCheckBuilder(this)
      .addCheck('New expire value is different', async () => {
        const revocationInfo = await this.releasePlanqWrapper.getRevocationInfo()
        return revocationInfo.canExpire !== canExpire
      })
      .runChecks()

    if (!flags.yesreally) {
      const response = await prompts({
        type: 'confirm',
        name: 'confirmation',
        message: 'Are you sure you want to change the `canExpire` parameter? (y/n)',
      })

      if (!response.confirmation) {
        console.info('Aborting due to user response')
        process.exit(0)
      }
    }

    this.kit.defaultAccount = await this.releasePlanqWrapper.getBeneficiary()
    await displaySendTx('setCanExpire', this.releasePlanqWrapper.setCanExpire(canExpire))
  }
}
