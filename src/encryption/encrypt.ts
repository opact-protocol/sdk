/* eslint-disable */
import { encode } from 'js-base64'
import { encryptRaw, genEcdhSharedKey } from './utils';
import { textToBigint } from 'bigint-conversion'
import { generateMnemonic, getHDWalletFromMnemonic } from '../keys';
import { babyjub } from 'circomlibjs';

export function splitIntoChunks(str: any, chunkSize: any) {
  const chunks = [];

  for (let i = 0; i < str.length; i += chunkSize) {
    chunks.push(str.substring(i, i + chunkSize));
  }

  return chunks;
}

export function subgroupDecompress(x: bigint | number): [bigint, bigint] {
  x = BigInt(x);

  const p: bigint = babyjub.p;
  const one: bigint = BigInt(1);

  const x2: bigint = (x * x) % p;
  const A: bigint = babyjub.A;
  const D: bigint = babyjub.D;

  // Função auxiliar para calcular o inverso modular usando o Algoritmo Estendido de Euclides
  function modInverse(a: bigint, mod: bigint): bigint {
      const b: bigint = BigInt(mod);
      let [lastRem, rem] = [a, b];
      let [x, lastX]: [bigint, bigint] = [0n, 1n];

      while (rem) {
          let quotient: bigint = lastRem / rem;
          [lastRem, rem] = [rem, lastRem % rem];
          [x, lastX] = [lastX - quotient * x, x];
      }

      return (lastX < 0) ? lastX + mod : lastX;
  }

  const t: bigint = (A * x2 - one) * modInverse(D * x2 - one, p) % p;
  const y: bigint = BigInt(babyjub.F.sqrt(t));

  if (babyjub.inSubgroup([x, y])) return [x, y];
  if (babyjub.inSubgroup([x, babyjub.p - y])) return [x, babyjub.p - y];

  throw new Error("Not a compressed point at subgroup");
}

export const encrypt = (
  data: any,
  pubkey: any,
): any => {
  let value = data

  if (typeof data !== 'string') {
    value = JSON.stringify(data, (_, value) => {
      return typeof value === 'bigint' ? value.toString() : value;
    })
  }

  const decompress = subgroupDecompress(BigInt(pubkey))

  const mnemonic = generateMnemonic()

  const ephemeral = getHDWalletFromMnemonic(mnemonic)

  const sharedKey = genEcdhSharedKey(ephemeral.pvtkey, decompress);

  let plaintext = splitIntoChunks(JSON.stringify(value), 30)

  plaintext = plaintext.map((item: string) => textToBigint(item))

  const ciphertext = (encryptRaw(
    plaintext,
    sharedKey,
  )) as any

  ciphertext.data = ciphertext.data.map((num: bigint) => num.toString())

  ciphertext.data = [...ephemeral.rawBig.map((value: bigint) => value.toString()), ...ciphertext.data]

  return encode(JSON.stringify({
    ciphertext,
  }, (_, value) => {
    return typeof value === 'bigint' ? value.toString() : value;
  }))
}
