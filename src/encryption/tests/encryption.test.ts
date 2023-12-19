/* eslint-disable */
import chai from 'chai';
import { encrypt } from '../encrypt'
import { decrypt } from '../decrypt';
import { getUtxo } from '../../utxo';
import { getRandomWallet } from '../../keys';

const { expect } = chai;

describe('Encryption tests', function test() {
  this.timeout(120000);

  it('The code must be create encrypt and decrypt an UTXO ', async () => {
    const wallet = getRandomWallet()

    const utxo = getUtxo({
      token: 832719810210204902983213847411017819246076070166n,
      pubkey: BigInt(wallet.pubkey),
      receipt: {
        id: 0,
        type: 'deposit',
        address: 'coin',
        date: 1702253462204,
        amount: '15000000000000',
        sender: '123456789',
        receiver: 'OZK94b710945d49a8b2af27868cea23b9b0db3007a6aaef04223aecbb443373a7f14fc6823dfa18d8293ccb6848aa35621bd20417fc1a411af99640f7f74cbfddb'
      }
    })

    const encrypted = encrypt({ data: utxo, address: wallet.address })

    const decrypted = decrypt({ encrypted, privateKey: wallet.pvtkey })

    expect(utxo.token).to.equal(decrypted.token);

    expect(() =>
      decrypt({
        encrypted,
        privateKey: '0x1e062b363a8fb4458fd0ba4657a5d91f65caf4d9a42893a8392c25627dde8e11'
      })
    ).to.throw('Decryption failed.');
  });
});
