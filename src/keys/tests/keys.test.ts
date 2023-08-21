/* eslint-disable */
import chai from 'chai';
import keys from './stubs/keys.json'
import { getRandomWallet, generateMnemonic, mnemonicToSeed, validateMnemonic, getWallet } from '../';

const { expect } = chai;

describe('Key derivation tests', function test() {
  this.timeout(120000);

  it('The code must create and validate a random mnemonic ', async () => {
    const mnemonic = generateMnemonic()

    const isValid = validateMnemonic(mnemonic)

    expect(isValid).to.equal(true);
  });

  it('Generate a valid seed from mnemonic', async () => {
    const { seedHex } = mnemonicToSeed(keys.mnemonic)

    expect(seedHex).to.equal(keys.seed);
  });

  // it('Recovery Wallet from seed', async () => {
  //   const { pvtkey, pubkey } = getWallet({ seed: new Uint8Array([ ...keys.uint8seed]) })

  //   expect(pubkey).to.equal(keys.pubkey);
  //   expect(pvtkey).to.equal(keys.pvtkey);
  // });
});
