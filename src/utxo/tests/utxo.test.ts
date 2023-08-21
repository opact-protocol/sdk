// /* eslint-disable */
// import chai from 'chai';
// import utxo from './stubs/utxo.json'
// import keys from './stubs/keys.json'
// import { encrypt, decrypt } from '../../encryption'

// const { expect } = chai;

// describe('Utxo Tests', function test() {
//   this.timeout(120000);

//   it('The code must be decrypt an UTXO ', async () => {
//     const decrypted = await decrypt({ ciphertext: utxo.encrypted, pvtkey: keys.pvtkey })

//     expect(JSON.parse(decrypted).token).to.equal(utxo.raw.token);
//   });

//   it('The code must be create a valid new transact', async () => {
//     const decrypted = await decrypt({ ciphertext: utxo.encrypted, pvtkey: keys.pvtkey })

//     expect(JSON.parse(decrypted).token).to.equal(utxo.raw.token);
//   });
// });
