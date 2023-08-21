import { HDKey } from "ethereum-cryptography/hdkey";
import { toHex } from "ethereum-cryptography/utils";
/* eslint-disable */
import { generateMnemonic, getHDWalletFromMnemonic } from './bip39'

export const getWallet = ({ seed }: { seed: Uint8Array }) => {
  const hdkey = HDKey.fromMasterSeed(seed);

  return {
    hdkey,
    pubkey: '0x' + toHex(hdkey.publicKey as Uint8Array),
    pvtkey: '0x' + toHex(hdkey.privateKey as Uint8Array),
  }
}

export const getRandomWallet = (): any => {
  const mnemonic = generateMnemonic()

  return getHDWalletFromMnemonic(mnemonic)
}
