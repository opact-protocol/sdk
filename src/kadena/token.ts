import Pact from 'pact-lang-api'
import { getConfig } from '../constants'

export const getTokenDetails = async (
  accountName: string,
  prefix: string
) => {
  const {
    nodeUrl
  } = getConfig()

  const createdAt =
    Math.round(new Date().getTime() / 1000) - 10

  const {
    result: { status, data }
  } = await Pact.fetch.local(
    {
      pactCode: `(${prefix}.details ${JSON.stringify(
        accountName
      )})`,
      meta: Pact.lang.mkMeta('', '0', 0, 0, createdAt, 0)
    },
    nodeUrl
  )

  if (status === 'failure') {
    throw new Error(data)
  }

  return data
}
