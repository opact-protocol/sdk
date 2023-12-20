import * as nacl from 'tweetnacl';
import { HDKey } from "ethereum-cryptography/hdkey";
import { toHex } from "ethereum-cryptography/utils";
import { generateMnemonic, mnemonicToSeed } from './bip39'
// eslint-disable-next-line import/no-cycle
import { deriveBabyJubKeysFromEth } from './babyjub';
import { combineHex } from '../util/hex';

export interface WalletInterface {
  hdkey: HDKey,
  pubkey: string,
  pvtkey: string,
  address: string,
  mnemonic: string,
}

export interface GetWalletFromSeedInterface {
  seed: Uint8Array
}

export const getWalletFromSeed = ({ seed }: GetWalletFromSeedInterface, mnemonic?: string): WalletInterface => {
  const hdkey = HDKey.fromMasterSeed(seed);

  const address = getWalletAddress(hdkey)

  const pubkey = `0x${toHex(hdkey.publicKey as Uint8Array)}`;
  const pvtkey = `0x${toHex(hdkey.privateKey as Uint8Array)}`;

  return {
    hdkey,
    pubkey,
    pvtkey,
    address,
    mnemonic: mnemonic || '',
  }
}

export const getWalletFromMnemonic = (mnemonic: string): WalletInterface => {
  const seed = mnemonicToSeed(mnemonic)

  return getWalletFromSeed({ ...seed }, mnemonic)
}

export const getRandomWallet = (): WalletInterface => {
  const mnemonic = generateMnemonic()

  const seed = mnemonicToSeed(mnemonic)

  return getWalletFromSeed({ ...seed }, mnemonic)
}

export const getWalletAddress = (hdkey: HDKey): string => {
  const encryptionPubkeyUint8 = nacl.box.keyPair.fromSecretKey(hdkey.privateKey as Uint8Array).publicKey;

  const encryptionPubkey = `0x${toHex(encryptionPubkeyUint8)}`;

  const pvtkey = `0x${toHex(hdkey.privateKey as Uint8Array)}`;

  const derivedKeys = deriveBabyJubKeysFromEth({ pvtkey } as WalletInterface)

  return combineHex({
    derivedKeys,
    encryptionPubkey,
  })
}
