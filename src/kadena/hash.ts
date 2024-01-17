import Pact from 'pact-lang-api'
import { getPoseidonMessageHash } from '../util'
import { ExtDataInterface } from './transaction'

export const blake = (value: any): string => Pact.crypto.hash(JSON.stringify(value)) as string

export interface GetKdaMessageInterface {
  extData: ExtDataInterface
}

export const getKdaMessage = ({
  extData,
}: GetKdaMessageInterface) => {
  return getPoseidonMessageHash(extData)
}
