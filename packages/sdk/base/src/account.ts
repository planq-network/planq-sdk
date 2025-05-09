export const PLQ_DERIVATION_PATH_BASE = "m/44'/60'/0'"

export enum MnemonicStrength {
  s128_12words = 128,
  s256_24words = 256,
}

export enum MnemonicLanguages {
  chinese_simplified,
  chinese_traditional,
  english,
  french,
  italian,
  japanese,
  korean,
  spanish,
  portuguese,
}

export type RandomNumberGenerator = (
  size: number,
  callback: (err: Error | null, buf: Buffer) => void
) => void

export interface Bip39 {
  mnemonicToSeedSync: (mnemonic: string, password?: string) => Buffer
  mnemonicToSeed: (mnemonic: string, password?: string) => Promise<Buffer>
  generateMnemonic: (
    strength?: number,
    rng?: RandomNumberGenerator,
    wordlist?: string[]
  ) => Promise<string>
  validateMnemonic: (mnemonic: string, wordlist?: string[]) => boolean
}
