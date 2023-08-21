// @ts-expect-error
import Pact from 'pact-lang-api'

export const blake = (value: any): string => Pact.crypto.hash(JSON.stringify(value)) as string
