import {
  generateKeys,
  generateMnemonic,
  MnemonicLanguages,
  MnemonicStrength,
  normalizeMnemonic,
  validateMnemonic,
} from '@planq-network/cryptographic-utils/lib/account'
import { privateKeyToAddress } from '@planq-network/utils/lib/address'
import { toChecksumAddress } from '@ethereumjs/util'
import { flags } from '@oclif/command'
import * as fs from 'fs-extra'
import { BaseCommand } from '../../base'
import { printValueMap } from '../../utils/cli'

const ETHEREUM_DERIVATION_PATH = "m/44'/60'/0'"

export default class NewAccount extends BaseCommand {
  static description =
    "Creates a new account locally using the Planq Derivation Path (m/44'/60'/0/changeIndex/addressIndex) and print out the key information. Save this information for local transaction signing or import into a Planq node. Ledger: this command has been tested swapping mnemonics with the Ledger successfully (only supports english)"

  static flags = {
    ...BaseCommand.flags,
    passphrasePath: flags.string({
      description:
        'Path to a file that contains the BIP39 passphrase to combine with the mnemonic specified using the mnemonicPath flag and the index specified using the addressIndex flag. Every passphrase generates a different private key and wallet address.',
    }),
    changeIndex: flags.integer({
      default: 0,
      description: 'Choose the change index for the derivation path',
    }),
    addressIndex: flags.integer({
      default: 0,
      description: 'Choose the address index for the derivation path',
    }),
    language: flags.string({
      options: [
        'chinese_simplified',
        'chinese_traditional',
        'english',
        'french',
        'italian',
        'japanese',
        'korean',
        'spanish',
      ],
      default: 'english',
      description:
        "Language for the mnemonic words. **WARNING**, some hardware wallets don't support other languages",
    }),
    mnemonicPath: flags.string({
      description:
        'Instead of generating a new mnemonic (seed phrase), use the user-supplied mnemonic instead. Path to a file that contains all the mnemonic words separated by a space (example: "word1 word2 word3 ... word24"). If the words are a language other than English, the --language flag must be used. Only BIP39 mnemonics are supported',
    }),
    derivationPath: flags.string({
      description:
        "Choose a different derivation Path (Planq's default is \"m/44'/60'/0'\"). Use \"eth\" as an alias of the Ethereum derivation path (\"m/44'/60'/0'\"). Recreating the same account requires knowledge of the mnemonic, passphrase (if any), and the derivation path",
    }),
  }

  static examples = [
    'new',
    'new --passphrasePath myFolder/my_passphrase_file',
    'new --language spanish',
    'new --passphrasePath some_folder/my_passphrase_file --language japanese --addressIndex 5',
    'new --passphrasePath some_folder/my_passphrase_file --mnemonicPath some_folder/my_mnemonic_file --addressIndex 5',
  ]

  static languageOptions(language: string): MnemonicLanguages | undefined {
    if (language) {
      // @ts-ignore
      const enumLanguage = MnemonicLanguages[language]
      return enumLanguage as MnemonicLanguages
    }
    return undefined
  }

  static sanitizeDerivationPath(derivationPath?: string) {
    if (derivationPath) {
      derivationPath = derivationPath.endsWith('/') ? derivationPath.slice(0, -1) : derivationPath
    }
    return derivationPath !== 'eth' ? derivationPath : ETHEREUM_DERIVATION_PATH
  }

  static readFile(file?: string): string | undefined {
    if (!file) {
      return undefined
    }
    if (fs.pathExistsSync(file)) {
      return fs
        .readFileSync(file)
        .toString()
        .replace(/(\r\n|\n|\r)/gm, '')
    }
    throw new Error(`Invalid path: ${file}`)
  }

  requireSynced = false

  async run() {
    const res = this.parse(NewAccount)
    let mnemonic = NewAccount.readFile(res.flags.mnemonicPath)
    if (mnemonic) {
      mnemonic = normalizeMnemonic(mnemonic)
      if (!validateMnemonic(mnemonic)) {
        throw Error('Invalid mnemonic. Should be a bip39 mnemonic')
      }
    } else {
      mnemonic = await generateMnemonic(
        MnemonicStrength.s256_24words,
        NewAccount.languageOptions(res.flags.language!)
      )
    }
    const derivationPath = NewAccount.sanitizeDerivationPath(res.flags.derivationPath)
    const passphrase = NewAccount.readFile(res.flags.passphrasePath)
    const keys = await generateKeys(
      mnemonic,
      passphrase,
      res.flags.changeIndex,
      res.flags.addressIndex,
      undefined,
      derivationPath
    )
    const accountAddress = toChecksumAddress(privateKeyToAddress(keys.privateKey))
    this.log(
      'This is not being stored anywhere. Save the mnemonic somewhere to use this account at a later point.\n'
    )
    printValueMap({ mnemonic, accountAddress, ...keys })
  }
}
