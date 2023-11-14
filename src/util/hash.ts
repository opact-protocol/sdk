import Pact from 'pact-lang-api'
import { poseidon } from "circomlibjs"
import { base64urlToBigInt } from "./string"

export const getBlakeMessageHash = (extData: any) => {
  return Pact.crypto.hash(`${extData.sender.toString() as string},${extData.recipient.toString() as string},${extData.tokenType as string},${extData.tokenAmount as string},${extData.tokenId as string},${extData.encryptedReceipts.join('') as string},${extData.encryptedCommitments.join('').toString() as string},${extData.outputCommitments.join('').toString() as string}`)
}

export const getPoseidonMessageHash = (extData: any) => {
  const blakeHash = getBlakeMessageHash(extData)

  return poseidon([base64urlToBigInt(blakeHash)])
}

export const getBlakeTokenHash = ({ namespace }: any) => {
  let preffix = namespace.refName.name === 'coin' ? 'coin' : `test.${namespace?.refName?.name as string}`

  if (namespace.refName.name === 'poly-fungible-v2-reference') {
    preffix = 'free.poly-fungible-v2-reference'
  }

  return Pact.crypto.hash(preffix)
}

export const getPoseidonTokenHash = (selected: any) => {
  const blakeHash = getBlakeTokenHash(selected)

  return poseidon([base64urlToBigInt(blakeHash)])
}
