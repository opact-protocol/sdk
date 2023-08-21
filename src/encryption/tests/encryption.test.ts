/* eslint-disable */
import chai from 'chai';
import utxo from './stubs/utxo.json'
import { encrypt, decrypt, getUtxoFromDecrypted } from '../index'
import { generateMnemonic, getHDWalletFromMnemonic } from '../../keys';

const { expect } = chai;

describe('Encryption tests', function test() {
  this.timeout(120000);

  it('The code must be create encrypt and decrypt an UTXO ', async () => {
    const mnemonic = generateMnemonic()

    const wallet = await getHDWalletFromMnemonic(mnemonic)

    const encrypted = await encrypt(JSON.stringify(utxo), wallet.pubkey)

    const decrypted = await decrypt(encrypted, wallet.pvtkey)

    const decryptedUtxo = getUtxoFromDecrypted(decrypted)

    expect(decryptedUtxo.txo.token).to.equal(utxo.txo.token);
  });
});
