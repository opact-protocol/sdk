import { Pact } from '@kadena/client';
import { PactNumber } from '@kadena/pactjs'
import { NamespaceInterface, getConfig, kadenaTokens } from '../constants'
import { getFaucetCode, getOpactCode } from './code';
import { stripK } from '../util';
import { getTokenDetails } from './local';

export const getPartialFaucetCommand = async (receiver: string) => {
  const {
    chainId,
    networkId,
  } = getConfig() as any

  let isRegistered = true

  try {
    await getTokenDetails(receiver, kadenaTokens[0])
  } catch {
    isRegistered = false
  }

  const command = Pact.builder
  .execution(getFaucetCode(receiver, isRegistered))
  .setNetworkId(networkId)
  .setMeta({
    chainId,
    ttl: 2880,
    gasLimit: 150000,
    gasPrice: 0.0000001,
    senderAccount: "c:Ecwy85aCW3eogZUnIQxknH8tG8uXHM5QiC__jeI0nWA",
  })

  if (isRegistered) {
    return command
  }

  return command
    .addKeyset('new_keyset', 'keys-all', stripK(receiver))
}

export interface ExtDataInterface {
  sender: string,
  tokenType: string,
  recipient: string,
  tokenId: string | number,
  outputCommitments: string[],
  tokenAmount: string | number,
  encryptedCommitments: string[],
  encryptedReceipts?: string[],
}

export interface GetPartialOpactCommandInterface {
  proof: any,
  senderAccount: string,
  extData: ExtDataInterface,
  tokenSpec: NamespaceInterface,
}

export const getPartialOpactCommand = ({
  proof,
  extData,
  tokenSpec,
  senderAccount,
}: GetPartialOpactCommandInterface): any => {
  const {
    chainId,
    networkId,
  } = getConfig() as any

  return Pact.builder
    .execution(getOpactCode())
    .setNetworkId(networkId)
    .addData('language', 'Pact')
    .addData('name', 'transact-deposit')
    .addData('extData', {
      ...extData,
      encryptedReceipts: [''],
      tokenId: `${extData.tokenId}`,
      tokenAmount: new PactNumber(extData.tokenAmount).toPactInteger(),
      outputCommitments: extData.outputCommitments.map((item: any) => new PactNumber(item).toPactInteger())
    })
    .setMeta({
      chainId,
      ttl: 2880,
      senderAccount,
      gasLimit: 150000,
      gasPrice: 0.00001,
    })
    .addData('proof', {
      public_values: proof.public_values.map((item: any) => new PactNumber(item).toPactInteger()),
      a: {
        x: new PactNumber(proof.a.x).toPactInteger(),
        y: new PactNumber(proof.a.y).toPactInteger()
      },
      b: {
        x: proof.b.x.map((item: any) => new PactNumber(item).toPactInteger()),
        y: proof.b.y.map((item: any) => new PactNumber(item).toPactInteger())
      },
      c: {
        x: new PactNumber(proof.c.x).toPactInteger(),
        y: new PactNumber(proof.c.y).toPactInteger()
      }
    })
    .addData('token-instance', {
      refSpec: [
        {
          name: tokenSpec.refSpec.name,
          namespace:
            tokenSpec.refSpec.namespace ||
            undefined
        }
      ],
      refName: {
        name: tokenSpec.refName.name,
        namespace:
          tokenSpec.refName.namespace || undefined
      }
    })
}
