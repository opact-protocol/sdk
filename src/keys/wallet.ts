import * as nacl from 'tweetnacl';
import { HDKey } from "ethereum-cryptography/hdkey";
import { toHex } from "ethereum-cryptography/utils";
import { generateMnemonic, mnemonicToSeed } from './bip39'
import { deriveBabyJubKeysFromEth } from './babyjub';
import { combineHex } from '../util/hex';

export const getWalletFromSeed = ({ seed }: { seed: Uint8Array }, mnemonic?: string) => {
  const hdkey = HDKey.fromMasterSeed(seed);

  const address = getWalletAddress(hdkey)

  const pubkey = `0x${toHex(hdkey.publicKey as Uint8Array)}`;
  const pvtkey = `0x${toHex(hdkey.privateKey as Uint8Array)}`;

  return {
    hdkey,
    pubkey,
    pvtkey,
    address,
    mnemonic,
  }
}

export const getWalletFromMnemonic = (mnemonic: string): any => {
  const seed = mnemonicToSeed(mnemonic)

  return getWalletFromSeed({ ...seed }, mnemonic)
}

export const getRandomWallet = (): any => {
  const mnemonic = generateMnemonic()

  const seed = mnemonicToSeed(mnemonic)

  return getWalletFromSeed({ ...seed }, mnemonic)
}

export const getWalletAddress = (hdkey: HDKey): string => {
  const encryptionPubkeyUint8 = nacl.box.keyPair.fromSecretKey(hdkey.privateKey as Uint8Array).publicKey;

  const encryptionPubkey = `0x${toHex(encryptionPubkeyUint8)}`;

  const pvtkey = `0x${toHex(hdkey.privateKey as Uint8Array)}`;

  const derivedKeys = deriveBabyJubKeysFromEth({ pvtkey })

  return combineHex({
    derivedKeys,
    encryptionPubkey,
  })
}
