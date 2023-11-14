/* eslint-disable @typescript-eslint/restrict-template-expressions */
import Pact from 'pact-lang-api'
import { getTransactionCode } from "./pact"
import { getConfig } from '../constants'

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

export const sendOpactTransaction = async (
  receiver: any,
  { proof, extData, tokenSpec }: any,
  callbackProgress: any
) => {
  const {
    nodeUrl,
    OPACT_CONTRACT_ID,
    OPACT_GAS_PAYER_ID
  } = getConfig()

  const kp = Pact.crypto.genKeyPair()

  const pactCode = getTransactionCode({ proof, extData })

  const createdAt =
    Math.round(new Date().getTime() / 1000) - 10

  callbackProgress('Sending your proof to relayer...')

  const preffix =
    tokenSpec.refName.name === 'coin'
      ? 'coin'
      : `test.${tokenSpec.refName.name}`

  const cap1 = Pact.lang.mkCap(
    'Coin Transfer',
    'Capability to transfer designated amount of coin from sender to receiver',
    `${preffix}.TRANSFER`,
    [
      OPACT_CONTRACT_ID,
      receiver,
      Number((extData.tokenAmount * -1).toFixed(1))
    ]
  )

  const cap2 = Pact.lang.mkCap(
    'Coin Transfer for Gas',
    'Capability to transfer gas fee from sender to gas payer',
    `${preffix}.TRANSFER`,
    [OPACT_CONTRACT_ID, OPACT_GAS_PAYER_ID, 1.0]
  )

  const tx = await Pact.fetch.send(
    {
      networkId: 'testnet04',
      pactCode,
      keyPairs: [
        {
          publicKey: kp.publicKey,
          secretKey: kp.secretKey,
          clist: [
            cap1.cap,
            cap2.cap,
            {
              name: `${OPACT_GAS_PAYER_ID}.GAS_PAYER`,
              args: [1.0]
            }
          ]
        }
      ],
      envData: {
        language: 'Pact',
        name: 'transact-deposit',
        'recipient-guard': {
          keys: [receiver]
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

      meta: Pact.lang.mkMeta('', '0', 0, 0, createdAt, 0)
    },
    nodeUrl
  )

  callbackProgress('Awaiting TX results...')

  const { result } = await Pact.fetch.listen(
    { listen: tx.requestKeys[0] },
    nodeUrl
  )

  if (result.status === 'failure') {
    throw new Error(result.error.message)
  }

  return result
}
