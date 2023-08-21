/* eslint-disable */
import { decode } from 'js-base64'
import { bigintToText } from 'bigint-conversion'
import { decryptRaw, genEcdhSharedKey } from './utils';

export const getUtxoFromDecrypted = (decrypted: any) => {
  return JSON.parse(JSON.parse(decrypted.map((e: any) => bigintToText(e)).reduce((curr: string, init: string) => curr + init, '')))
}

export const decrypt = (
  encrypted: any,
  pvtkey: any,
): any => {
  const {
    ciphertext,
  } = JSON.parse(decode(encrypted))

  ciphertext.iv = BigInt(ciphertext.iv)

  const [
    point1,
    point2,
    ...data
] = ciphertext.data

  const ephemeral = [point1, point2]

  ciphertext.data = data.map((num: string) => BigInt(num))

  const sharedKey = genEcdhSharedKey(pvtkey, ephemeral.map((value: string) => BigInt(value)));

  return decryptRaw(
    ciphertext,
    sharedKey,
  )
};
