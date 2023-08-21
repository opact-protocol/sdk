/* eslint-disable */
import { babyjub } from 'circomlibjs'
import { hmac } from '@noble/hashes/hmac';
import { sha512 } from '@noble/hashes/sha512';
import { utf8ToBytes } from '@noble/hashes/utils';
import { toHex } from 'ethereum-cryptography/utils';
import * as bip39 from 'ethereum-cryptography/bip39';
import { wordlist } from 'ethereum-cryptography/bip39/wordlists/english';
import { MnemonicType, MnemonicStrengthType, MnemonicPasswordType } from './types/bip39.types';

const MASTER_SECRET = utf8ToBytes('babyjubjub seed');

export const generateMnemonic = (strength: MnemonicStrengthType = 128): string => bip39.generateMnemonic(wordlist, strength);

export const validateMnemonic = (mnemonic: MnemonicType): boolean => bip39.validateMnemonic(mnemonic, wordlist)

export const mnemonicToSeed = (mnemonic: MnemonicType, password: MnemonicPasswordType = ''): any => {
  const seed = bip39.mnemonicToSeedSync(mnemonic, password)

  return {
    seed,
    seedHex: toHex(seed)
  }
}

export const isPrefixed = (str: string): boolean => str.startsWith('0x');

export const strip0x = (str: string): string => (isPrefixed(str) ? str.slice(2) : str);

export const masterKey = (seed: any) => {
  const L = hmac(sha512, MASTER_SECRET, seed)

  const k = BigInt(`0x${toHex(L.slice(0, 32))}`) % babyjub.subOrder;

  const c = L.slice(32, 64);

  return {
    c,
    k,
  }
}

export function getHDWalletFromMnemonic(mnemonic: string): any {
  const seed = bip39.mnemonicToSeedSync(mnemonic)

  const {
    k: pvtkey,
  } = masterKey(seed) as any

  const rawBig = babyjub.mulPointEscalar(babyjub.Base8, pvtkey)

  let pubkey = rawBig[0];

  return {
    seed,
    pubkey,
    pvtkey,
    rawBig,
    mnemonic,
    hexPvt: pvtkey.toString(16),
    hexPub: pubkey.toString(16),
  };
}
