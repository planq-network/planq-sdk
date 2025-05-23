import { BaseCommand } from '../../base'
import { printValueMap } from '../../utils/cli'

export default class ValidatorRequirements extends BaseCommand {
  static description =
    'List the Locked Planq requirements for registering a Validator. This consists of a value, which is the amount of PLQ that needs to be locked in order to register, and a duration, which is the amount of time that PLQ must stay locked following the deregistration of the Validator.'

  static flags = {
    ...BaseCommand.flags,
  }

  static examples = ['requirements']

  async run() {
    this.parse(ValidatorRequirements)

    const validators = await this.kit.contracts.getValidators()

    const requirements = await validators.getValidatorLockedPlanqRequirements()

    printValueMap(requirements)
  }
}
