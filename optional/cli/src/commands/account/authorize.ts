import { flags } from '@oclif/command'
import { BaseCommand } from '../../base'
import { newCheckBuilder } from '../../utils/checks'
import { displaySendTx } from '../../utils/cli'
import { Flags } from '../../utils/command'

export default class Authorize extends BaseCommand {
  static description =
    'Keep your locked Planq more secure by authorizing alternative keys to be used for signing attestations, voting, or validating. By doing so, you can continue to participate in the protocol while keeping the key with access to your locked Planq in cold storage. You must include a "proof-of-possession" of the key being authorized, which can be generated with the "account:proof-of-possession" command.'

  static flags = {
    ...BaseCommand.flags,
    from: Flags.address({ required: true }),
    role: flags.string({
      char: 'r',
      options: ['vote', 'validator', 'attestation'],
      description: 'Role to delegate',
      required: true,
    }),
    signature: Flags.proofOfPossession({
      description: 'Signature (a.k.a proof-of-possession) of the signer key',
      required: true,
    }),
    signer: Flags.address({ required: true }),
    blsKey: Flags.blsPublicKey({
      description:
        'The BLS public key that the validator is using for consensus, should pass proof of possession. 96 bytes.',
      dependsOn: ['blsPop'],
    }),
    blsPop: Flags.blsProofOfPossession({
      description:
        'The BLS public key proof-of-possession, which consists of a signature on the account address. 48 bytes.',
      dependsOn: ['blsKey'],
    }),
    force: flags.boolean({
      description:
        'Allow rotation of validator ECDSA key without rotating the BLS key. Only intended for validators with a special reason to do so.',
      default: false,
      hidden: true,
    }),
  }

  static args = []

  static examples = [
    'authorize --from 0x5409ED021D9299bf6814279A6A1411A7e866A631 --role vote --signer 0x6ecbe1db9ef729cbe972c83fb886247691fb6beb --signature 0x1b9fca4bbb5bfb1dbe69ef1cddbd9b4202dcb6b134c5170611e1e36ecfa468d7b46c85328d504934fce6c2a1571603a50ae224d2b32685e84d4d1a1eebad8452eb',
    'authorize --from 0x5409ED021D9299bf6814279A6A1411A7e866A631 --role validator --signer 0x6ecbe1db9ef729cbe972c83fb886247691fb6beb --signature 0x1b9fca4bbb5bfb1dbe69ef1cddbd9b4202dcb6b134c5170611e1e36ecfa468d7b46c85328d504934fce6c2a1571603a50ae224d2b32685e84d4d1a1eebad8452eb --blsKey 0x4fa3f67fc913878b068d1fa1cdddc54913d3bf988dbe5a36a20fa888f20d4894c408a6773f3d7bde11154f2a3076b700d345a42fd25a0e5e83f4db5586ac7979ac2053cd95d8f2efd3e959571ceccaa743e02cf4be3f5d7aaddb0b06fc9aff00 --blsPop 0xcdb77255037eb68897cd487fdd85388cbda448f617f874449d4b11588b0b7ad8ddc20d9bb450b513bb35664ea3923900',
  ]

  async run() {
    const res = this.parse(Authorize)

    const accounts = await this.kit.contracts.getAccounts()
    const sig = accounts.parseSignatureOfAddress(
      res.flags.from,
      res.flags.signer,
      res.flags.signature
    )

    // Check that the account is registered on-chain.
    // Additionally, if the authorization is for a validator, the BLS key must be provided when the
    // validator is already registered, and cannot be provided if the validator is not registered.
    // (Because the BLS key is stored on the validator entry, which would not exist yet)
    // Using the --force flag allows setting the ECDSA key on the validator without the BLS key.
    const checker = newCheckBuilder(this).isAccount(res.flags.from)
    if (res.flags.role === 'validator' && !res.flags.force) {
      if (res.flags.blsKey && res.flags.blsPop) {
        checker.isValidator(res.flags.from)
      } else {
        checker.isNotValidator(res.flags.from)
      }
    }
    await checker.runChecks()

    let tx: any
    if (res.flags.role === 'vote') {
      tx = await accounts.authorizeVoteSigner(res.flags.signer, sig)
    } else if (res.flags.role === 'validator' && res.flags.blsKey && res.flags.blsPop) {
      tx = await accounts.authorizeValidatorSignerAndBls(
        res.flags.signer,
        sig,
        res.flags.blsKey,
        res.flags.blsPop
      )
    } else if (res.flags.role === 'validator') {
      const validatorsWrapper = await this.kit.contracts.getValidators()
      tx = await accounts.authorizeValidatorSigner(res.flags.signer, sig, validatorsWrapper)
    } else if (res.flags.role === 'attestation') {
      tx = await accounts.authorizeAttestationSigner(res.flags.signer, sig)
    } else {
      this.error(`Invalid role provided`)
      return
    }
    await displaySendTx('authorizeTx', tx)
  }
}
