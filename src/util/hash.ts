import Pact from 'pact-lang-api'
import { poseidon } from "circomlibjs"
import { base64urlToBigInt } from "./string"
import type { ExtDataInterface } from '../kadena/transaction'
import { KadenaTokenInterface } from '../constants'

export const getBlakeMessageHash = (extData: ExtDataInterface) => {
  return Pact.crypto.hash(`${extData.sender.toString()},${extData.recipient.toString()},${extData.tokenType},${extData.tokenAmount},${extData.tokenId},${(extData.encryptedReceipts || []).join('')},${extData.encryptedCommitments.join('').toString()},${extData.outputCommitments.join('').toString()}`)
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

  return Pact.crypto.hash(preffix)
}

export const getPoseidonTokenHash = (selected: KadenaTokenInterface) => {
  const blakeHash = getBlakeTokenHash(selected)

  return poseidon([base64urlToBigInt(blakeHash)])
}
