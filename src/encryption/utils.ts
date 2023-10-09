/* eslint-disable @typescript-eslint/restrict-plus-operands */
// @ts-expect-error
import { babyjub, mimc7 } from 'circomlibjs'

type SnarkBigInt = bigint
type PrivKey = bigint
type PubKey = bigint[]
type EcdhSharedKey = bigint
type Plaintext = bigint[]

interface Ciphertext {
  // The initialisation vector
  iv: bigint;

  // The encrypted data
  data: bigint[];
}

/*
 * Generates an Elliptic-curve Diffie–Hellman shared key given a private key
 * and a public key.
 * @return The ECDH shared key.
 */
const genEcdhSharedKey = (
  privKey: PrivKey,
  pubKey: PubKey,
): EcdhSharedKey => {
  return babyjub.mulPointEscalar(pubKey, privKey)[0]
}

/*
 * Encrypts a plaintext using a given key.
 * @return The ciphertext.
 */
const encryptRaw = (
    plaintext: Plaintext,
    sharedKey: EcdhSharedKey,
): Ciphertext => {
  // Generate the IV
  const iv = mimc7.multiHash(plaintext, BigInt(0))

  const ciphertext: Ciphertext = {
    iv,
    data: plaintext.map((e: bigint, i: number): bigint => {
      return e + mimc7.hash(
        sharedKey,
        iv + BigInt(i),
      )
    }),
  }

  // TODO: add asserts here
  return ciphertext
}

/*
 * Decrypts a ciphertext using a given key.
 * @return The plaintext.
 */
const decryptRaw = (
  ciphertext: Ciphertext,
  sharedKey: EcdhSharedKey,
): Plaintext => {
  const plaintext: Plaintext = ciphertext.data.map(
    (e: bigint, i: number): bigint => {
      const value = BigInt(e) - BigInt(mimc7.hash(sharedKey, BigInt(ciphertext.iv) + BigInt(i)))

      if (value < BigInt(0)) {
        throw new Error('Invalid ciphertext')
      }

      return value
    }
  )

  return plaintext
}

export {
  PrivKey,
  PubKey,
  Ciphertext,
  Plaintext,
  SnarkBigInt,
  EcdhSharedKey,

  encryptRaw,
  decryptRaw,
  genEcdhSharedKey,
}
