import Pact from 'pact-lang-api'
import { KadenaTokenInterface, getConfig } from '../constants'
import { getContractAddress } from '../util'

export const getTokenDetails = async (
  accountName: string,
  token: KadenaTokenInterface
) => {
  const {
    nodeUrl,
    chainId,
  } = getConfig()

  const contractAddress = getContractAddress(token)

  const {
    result: { status, data }
  } = await Pact.fetch.local(
    {
      pactCode: `(${contractAddress}.details "${accountName}")`,
      meta: {
        creationTime: Math.round(new Date().getTime() / 1000) - 10,
        ttl: 600,
        chainId,
        gasLimit: 600,
        gasPrice: 0.0000001,
        sender: '',
      },
    },
    nodeUrl
  )

  if (status === 'failure') {
    throw new Error(data)
  }

  return data
}
