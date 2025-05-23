import { flags } from '@oclif/command'
import prompts from 'prompts'
import { newCheckBuilder } from '../../utils/checks'
import { displaySendTx } from '../../utils/cli'
import { Flags } from '../../utils/command'
import { ReleasePlanqBaseCommand } from '../../utils/release-planq-base'

export default class SetBeneficiary extends ReleasePlanqBaseCommand {
  static description =
    "Set the beneficiary of the ReleasePlanq contract. This command is gated via a multi-sig, so this is expected to be called twice: once by the contract's beneficiary and once by the contract's releaseOwner. Once both addresses call this command with the same parameters, the tx will execute."

  static flags = {
    ...ReleasePlanqBaseCommand.flags,
    from: Flags.address({
      required: true,
      description: 'Address to submit multisig transaction from (one of the owners)',
    }),
    beneficiary: Flags.address({
      required: true,
      description: 'Address of the new beneficiary',
    }),
    yesreally: flags.boolean({
      description: 'Override prompt to set new beneficiary (be careful!)',
    }),
  }

  static args = []

  static examples = [
    'set-beneficiary --contract 0x5409ED021D9299bf6814279A6A1411A7e866A631 --from 0xE36Ea790bc9d7AB70C55260C66D52b1eca985f84 --beneficiary 0x6Ecbe1DB9EF729CBe972C83Fb886247691Fb6beb',
  ]

  async run() {
    // tslint:disable-next-line
    const { flags } = this.parse(SetBeneficiary)
    const newBeneficiary = flags.beneficiary

    const owner = await this.releasePlanqWrapper.getOwner()
    const releasePlanqMultiSig = await this.kit.contracts.getMultiSig(owner)

    await newCheckBuilder(this).isMultiSigOwner(flags.from, releasePlanqMultiSig).runChecks()

    if (!flags.yesreally) {
      const response = await prompts({
        type: 'confirm',
        name: 'confirmation',
        message:
          "Are you sure you want to set a new beneficiary? This will forfeit the current beneficiary's controls. (y/n)",
      })

      if (!response.confirmation) {
        console.info('Aborting due to user response')
        process.exit(0)
      }
    }

    const currentBeneficiary = await this.releasePlanqWrapper.getBeneficiary()
    const setBeneficiaryTx = this.releasePlanqWrapper.setBeneficiary(newBeneficiary)
    const setBeneficiaryMultiSigTx = await releasePlanqMultiSig.submitOrConfirmTransaction(
      this.contractAddress,
      setBeneficiaryTx.txo
    )
    await displaySendTx<any>(
      'setBeneficiary',
      setBeneficiaryMultiSigTx,
      { from: flags.from },
      'BeneficiarySet'
    )
    const replaceOwnerTx = releasePlanqMultiSig.replaceOwner(currentBeneficiary, newBeneficiary)
    const replaceOwnerMultiSigTx = await releasePlanqMultiSig.submitOrConfirmTransaction(
      releasePlanqMultiSig.address,
      replaceOwnerTx.txo
    )
    await displaySendTx<any>('replaceMultiSigOwner', replaceOwnerMultiSigTx, { from: flags.from })
  }
}
