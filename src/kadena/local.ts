import { Pact, createClient } from '@kadena/client'
import { getContractAddress } from '../util'
import { KadenaTokenInterface, getConfig } from '../constants'

export const getTokenDetails = async (
  accountName: string,
  token: KadenaTokenInterface
) => {
  const {
    nodeUrl,
    chainId,
    networkId,
  } = getConfig() as any

  const contractAddress = getContractAddress(token)

  const { local } = createClient(nodeUrl);

  const transaction = Pact.builder
    .execution(`(${contractAddress}.details "${accountName}")`)
    .setMeta({
      chainId,
    })
    .setNetworkId(networkId)
    .createTransaction();

  const {
    result
  } = await local(transaction, {
    preflight: false,
    signatureVerification: false,
  }) as any;

  if (result.status === 'failure') {
    throw new Error(result.error)
  }

  return result.data
}
