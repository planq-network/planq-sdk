import { flags } from '@oclif/command'
import { BaseCommand } from '../../base'
import { printValueMapRecursive } from '../../utils/cli'

export default class Parameters extends BaseCommand {
  static description =
    'View parameters of the network, including but not limited to configuration for the various Planq core smart contracts.'

  static flags = {
    ...BaseCommand.flags,
    raw: flags.boolean({
      description: 'Display raw numerical configuration',
      required: false,
      default: false,
    }),
  }

  async run() {
    const res = this.parse(Parameters)
    const config = await this.kit.getNetworkConfig(!res.flags.raw)
    printValueMapRecursive(config)
  }
}
