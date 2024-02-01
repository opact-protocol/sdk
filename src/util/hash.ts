import { poseidon } from "circomlibjs"
import { base64urlToBigInt } from "./string"
import { hash } from '@kadena/cryptography-utils'
import type { ExtDataInterface } from '../kadena/command'
import { KadenaTokenInterface } from '../constants'

export const getBlakeMessageHash = (extData: ExtDataInterface) => {
  return hash(`${extData.sender.toString()},${extData.recipient.toString()},${extData.tokenType},${extData.tokenAmount},${extData.tokenId},${(extData.encryptedReceipts || []).join('')},${extData.encryptedCommitments.join('').toString()},${extData.outputCommitments.join('').toString()}`)
}

export const getPoseidonMessageHash = (extData: ExtDataInterface) => {
  const blakeHash = getBlakeMessageHash(extData)

  return poseidon([base64urlToBigInt(blakeHash)])
}

export const getBlakeTokenHash = ({ namespace }: KadenaTokenInterface) => {
  let preffix = namespace.refName.name === 'coin' ? 'coin' : `test.${namespace?.refName?.name}`

  if (namespace.refName.name === 'poly-fungible-v2-reference') {
    preffix = 'free.poly-fungible-v2-reference'
  }

  return hash(preffix)
}

export const getPoseidonTokenHash = (selected: KadenaTokenInterface) => {
  const blakeHash = getBlakeTokenHash(selected)

  return poseidon([base64urlToBigInt(blakeHash)])
}
