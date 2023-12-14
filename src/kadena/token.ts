import Pact from 'pact-lang-api'
import { getConfig } from '../constants'
import { getContractAddress } from '../util'

export const getTokenDetails = async (
  accountName: string,
  token: any
) => {
  const {
    nodeUrl
  } = getConfig()

  const createdAt =
    Math.round(new Date().getTime() / 1000) - 10

  const contractAddress = getContractAddress(token)

  const {
    result: { status, data }
  } = await Pact.fetch.local(
    {
      pactCode: `(${contractAddress}.details ${JSON.stringify(
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
