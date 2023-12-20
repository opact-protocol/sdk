/* eslint-disable */
import chai from 'chai';
import seed from './stubs/seed.json'
import wallet from './stubs/wallet.json'
import babyjub from './stubs/babyjub.json'
import { WalletInterface, getWalletFromSeed } from '../wallet'
import { generateMnemonic, mnemonicToSeed, validateMnemonic } from '../bip39';
import { deriveBabyJubKeysFromEth } from '../babyjub';

const { expect } = chai;

describe('Key derivation tests', function test() {
  this.timeout(120000);

  it('The code must create and validate a random mnemonic ', async () => {
    const mnemonic = generateMnemonic()

    const isValid = validateMnemonic(mnemonic)

    expect(isValid).to.equal(true);
  });

  it('Generate a valid seed from mnemonic', async () => {
    const { seedHex } = mnemonicToSeed(wallet.mnemonic)

    expect(seedHex).to.equal(wallet.seed);
  });

  it('Recovery Wallet from seed', async () => {
    const { pvtkey, pubkey } = getWalletFromSeed({ seed: new Uint8Array([ ...seed]) })

    expect(pubkey).to.equal(`0x${wallet.pubkey}`);
    expect(pvtkey).to.equal(`0x${wallet.pvtkey}`);

    const derivedKeys = deriveBabyJubKeysFromEth({ pvtkey } as WalletInterface)

    expect(derivedKeys.pubkey.toString()).to.equal(babyjub.pubkey);
    expect(derivedKeys.pvtkey.toString()).to.equal(babyjub.pvtkey);
  });
});
