import { displaySendTx } from '../../utils/cli'
import { Flags } from '../../utils/command'
import { ReleasePlanqBaseCommand } from '../../utils/release-planq-base'

export default class TransferDollars extends ReleasePlanqBaseCommand {
  static description =
    'Transfer Planq Dollars from the given contract address. Dollars may be accrued to the ReleasePlanq contract via validator epoch rewards.'

  static flags = {
    ...ReleasePlanqBaseCommand.flags,
    to: Flags.address({
      required: true,
      description: 'Address of the recipient of Planq Dollars transfer',
    }),
    value: Flags.wei({ required: true, description: 'Value (in Wei) of Planq Dollars to transfer' }),
  }

  static args = []

  static examples = [
    'transfer-dollars --contract 0x5409ED021D9299bf6814279A6A1411A7e866A631 --to 0x6Ecbe1DB9EF729CBe972C83Fb886247691Fb6beb --value 10000000000000000000000',
  ]

  async run() {
    // tslint:disable-next-line
    const { flags } = this.parse(TransferDollars)
    const isRevoked = await this.releasePlanqWrapper.isRevoked()
    this.kit.defaultAccount = isRevoked
      ? await this.releasePlanqWrapper.getReleaseOwner()
      : await this.releasePlanqWrapper.getBeneficiary()

    await displaySendTx('transfer', this.releasePlanqWrapper.transfer(flags.to, flags.value))
  }
}
