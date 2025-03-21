import { ensureLeading0x } from '@planq-network/utils/lib/address'
import { flags } from '@oclif/command'
import { BaseCommand } from '../../base'
import { displayWeb3Tx } from '../../utils/cli'
import { Flags } from '../../utils/command'

const DKG = require('./DKG.json')

export default class DKGRegister extends BaseCommand {
  static description = 'Allowlist an address in the DKG'

  static flags = {
    ...BaseCommand.flags,
    participantAddress: flags.string({
      required: true,
      description: 'Address of the participant to allowlist',
    }),
    address: Flags.address({ required: true, description: 'DKG Contract Address' }),
    from: Flags.address({ required: true, description: 'Address of the sender' }),
  }

  async run() {
    const res = this.parse(DKGRegister)
    const web3 = this.kit.connection.web3

    const dkg = new web3.eth.Contract(DKG.abi, res.flags.address)

    const participantAddress = res.flags.participantAddress
    await displayWeb3Tx('allowlist', dkg.methods.allowlist(ensureLeading0x(participantAddress)), {
      from: res.flags.from,
    })
  }
}
