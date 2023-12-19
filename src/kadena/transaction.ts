/* eslint-disable @typescript-eslint/restrict-template-expressions */
import Pact from 'pact-lang-api'
import { getTransactionCode } from "./pact"
import { getConfig } from '../constants'
import { getCapsForTransfer } from './caps'
import { getExecCmd } from './command'

export const getKdaTransactionParams = ({
  batch,
  amount,
  sender,
  receiver,
  selectedToken,
  encryptedUtxos,
  encryptedReceipts,
}: any) => {
  return {
    sender,
    encryptedReceipts,
    tokenAmount: amount,
    tokenId: selectedToken.id,
    recipient: receiver || sender,
    encryptedCommitments: encryptedUtxos,
    tokenType: selectedToken.namespace.refSpec.name,
    outputCommitments: batch.utxosOut.map((utxo: any) => utxo.hash.toString()),
  }
}

export const sendSigned = async (cmd: any) => {
  const {
    nodeUrl,
  } = getConfig()

  const tx = await Pact.wallet.sendSigned(
    cmd.signedCmd,
    nodeUrl
  )

  const { result } = await Pact.fetch.listen(
    { listen: tx.requestKeys[0] },
    nodeUrl
  )

  if (result.status === 'failure') {
    throw new Error(result.error.message)
  }

  return result
}

export const send = async (execCmd: any) => {
  const {
    nodeUrl,
  } = getConfig()

  const tx = await Pact.fetch.send(execCmd, nodeUrl)

  const { result } = await Pact.fetch.listen(
    { listen: tx.requestKeys[0] },
    nodeUrl
  )

  if (result.status === 'failure') {
    throw new Error(result.error.message)
  }

  return result
}

export const sendOZKTransaction = async (
  receiver: any,
  { proof, extData, tokenSpec }: any,
  callbackProgress: any
) => {
  const kp = Pact.crypto.genKeyPair()

  const createdAt =
    Math.round(new Date().getTime() / 1000) - 10

  callbackProgress('Sending your proof to relayer...')

  const clist = getCapsForTransfer({
    receiver,
    amount: extData.tokenAmount,
    token: {
      namespace: tokenSpec,
    },
  }).map(({ cap }) => cap)

  const execCmd = getExecCmd({
    keyPairs: [
      {
        clist,
        publicKey: kp.publicKey,
        secretKey: kp.secretKey,
      }
    ],
    envData: {
      language: 'Pact',
      name: 'transact-deposit',
      'recipient-guard': {
        keys: [receiver.replace('k:', '')]
      },
      'token-instance': {
        refSpec: [
          {
            name: tokenSpec.refSpec.name
          }
        ],
        refName: {
          name: tokenSpec.refName.name,
          namespace:
            tokenSpec.refName.namespace || undefined
        }
      }
    },
    pactCode: getTransactionCode({ proof, extData }),
    meta: Pact.lang.mkMeta('', '0', 0, 0, createdAt, 0)
  })

  callbackProgress('Awaiting TX results...')

  return await send(execCmd)
}
