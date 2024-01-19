import { hash } from '@kadena/cryptography-utils'
import { getPoseidonMessageHash } from '../util'
import { ExtDataInterface } from './transaction'

export const blake = (value: any): string => hash(JSON.stringify(value)) as string

export interface GetKdaMessageInterface {
  extData: ExtDataInterface
}

export const getKdaMessage = ({
  extData,
}: GetKdaMessageInterface) => {
  return getPoseidonMessageHash(extData)
}
