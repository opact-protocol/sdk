// TODO FIX ESLINT FOR ALL VALUES
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { getNullifier } from "../utxo"
import { decrypt, getUtxoFromDecrypted } from "../encryption"

const RPC = process.env.NODE_ENV !== 'development'
  ? 'https://bpsd19dro1.execute-api.us-east-2.amazonaws.com/getdata'
  : 'http://ec2-34-235-122-42.compute-1.amazonaws.com:5000/getdata'

export const computeLocalTestnet = async (secret: any) => {
  const response = await fetch(`${RPC}?salt=268`)

  const data = await response.json()

  return data
    .sort((a: any, b: any) => a.txid - b.txid)
    .map(({ events }: any) => events)
    .reduce((acc: any, curr: any) => acc.concat(curr), [])
    .reduce((curr: any, event: any) => {
      if (event.name === 'new-nullifier') {
        curr.nullifiers = [...curr.nullifiers, ...event.params.reduce((acc: any, param: any) => {
          if (Array.isArray(param)) {
            return [...acc, ...param.map((parm: any) => parm.int)]
          }

          return [param.int]
        }, [])]
      }

      if (event.name === 'new-commitment' && secret) {
        const commitment = {
          value: event.params[0].int,
          order: event.params[1].int
        }

        curr.commitments = [...curr.commitments, commitment]
      }

      if (event.name === 'new-encrypted-output' && secret) {
        try {
          const [
            encrypted
          ] = event.params

          const value = getUtxoFromDecrypted(decrypt(
            encrypted,
            secret,
          ))

          curr.decryptedData = [...curr.decryptedData, value]
        } catch (e) {
          // console.warn(e)
        }
      }

      if (event.name === 'new-transaction' && secret) {
        try {
          const [
            encrypted
          ] = event.params

          const value = getUtxoFromDecrypted(decrypt(
            encrypted,
            secret,
          ))

          curr.receipts = [...curr.receipts, value]
        } catch (e) {
          // console.warn(e)
        }
      }

      return curr
    }, {
      receipts: [],
      nullifiers: [],
      commitments: [],
      decryptedData: []
    }) as []
}

export const groupUtxoByToken = (encrypted: any, nullifiers: any, secret: any) => {
  return encrypted.reduce((acc: any, curr: any) => {
    const utxo = {
      id: curr.id,
      address: curr.address,
      hash: BigInt(curr.hash),
      token: BigInt(curr.token),
      amount: BigInt(curr.amount),
      pubkey: BigInt(curr.pubkey),
      blinding: BigInt(curr.blinding),
    }

    const nullifier = getNullifier({
      utxo,
      secret
    })

    if (nullifiers.includes(nullifier.toString()) || utxo.amount === 0n) {
      return acc
    }

    const {
      address: {
        name
      }
    } = utxo

    if (!acc[name]) {
      acc[name] = {
        balance: 0n,
        utxos: [],
        token: {
          decimals: 12,
          symbol: 'KDA',
          name: 'Kadena',
          icon: '/kda.png'
        }
      }
    }

    acc[name].balance += utxo.amount
    acc[name].utxos = [...acc[name].utxos, utxo]

    return acc
  }, {})
}
