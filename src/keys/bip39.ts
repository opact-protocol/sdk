/* eslint-disable */
import { toHex } from 'ethereum-cryptography/utils';
import * as bip39 from 'ethereum-cryptography/bip39';
import { wordlist } from 'ethereum-cryptography/bip39/wordlists/english';

export type MnemonicType = string

export type MnemonicPasswordType = string

export type MnemonicStrengthType = 128 | 192 | 256

export type KeyNode = {
  chainKey: string;
  chainCode: string;
};


export const generateMnemonic = (strength: MnemonicStrengthType = 128): string => bip39.generateMnemonic(wordlist, strength);

export const validateMnemonic = (mnemonic: MnemonicType): boolean => bip39.validateMnemonic(mnemonic, wordlist)

export const mnemonicToSeed = (mnemonic: MnemonicType, password: MnemonicPasswordType = ''): any => {
  const seed = bip39.mnemonicToSeedSync(mnemonic, password)

  return {
    seed,
    seedHex: toHex(seed)
  }
}
