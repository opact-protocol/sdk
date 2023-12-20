import Pact from 'pact-lang-api'
import { getPoseidonMessageHash } from '../util'

export const blake = (value: any): string => Pact.crypto.hash(JSON.stringify(value)) as string

export const getKdaMessage = ({
  another,
  extData,
}: any) => {
  return getPoseidonMessageHash(extData)
}
