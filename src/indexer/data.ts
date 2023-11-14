/* eslint-disable no-await-in-loop */
// TODO FIX ESLINT FOR ALL VALUES
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { getNullifier } from "../utxo"
import { decrypt, getUtxoFromDecrypted } from "../encryption"

const RPC = 'https://bpsd19dro1.execute-api.us-east-2.amazonaws.com'

export const getUserBalanceBySecret = async (
  secret: any,
  currentId: any,
  storedUtxos: any,
) => {
  let lastId = currentId

  let isLastPage = false

  let encrypted: any[] = []

  while (!isLastPage) {
    const response = await fetch(`${RPC}/encrypted?salt=${currentId as string}`)

    const {
      data,
      last_tx_id,
      is_last_page
    } = await response.json()

    encrypted = [...encrypted, ...data]

    isLastPage = is_last_page

    if (isLastPage) {
      lastId = last_tx_id
    }
  }

  let nullifierIsLastPage = false

  let nullifiers: any[] = []

  while (!nullifierIsLastPage) {
    const response = await fetch(`${RPC}/nullifiers`)

    const {
      data,
      is_last_page
    } = await response.json()

    nullifiers = [...nullifiers, ...data]

    nullifierIsLastPage = is_last_page
  }

  encrypted = encrypted.map((item: any) => {
    try {
      const value = getUtxoFromDecrypted(decrypt(
        item,
        secret,
      ))

      return value
    } catch (e) {
      return null
    }
  }).filter(item => !!item)

  return {
    lastId,
    ...groupUtxoByToken([...storedUtxos, ...encrypted], nullifiers, secret)
  }
}

export const getUserReceiptsBySecret = async (
  secret: any,
  currentId: any,
  storedReceipts: any,
) => {
  let isLastPage = false

  let receipts: any[] = []

  while (!isLastPage) {
    const response = await fetch(`${RPC}/receipts?salt=${currentId as string}`)

    const {
      data,
      is_last_page
    } = await response.json()

    receipts = [...receipts, ...data]

    isLastPage = is_last_page
  }

  receipts = receipts.map((receipt: any) => {
    try {
      const value = getUtxoFromDecrypted(decrypt(
        receipt,
        secret,
      ))

      return value
    } catch (e) {
      return null
    }
  }).filter(item => {
    if (!item) {
      return false
    }

    console.log('item', item)

    return !storedReceipts.find((value: any) => {
      return value?.date === item?.date
    })
  })

  return [
    ...receipts,
    ...storedReceipts
  ]
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

    const isOnUtxos = acc.utxos.find((value: any) => {
      return value.blinding === utxo.blinding
    })

    if (nullifiers.includes(nullifier.toString()) || utxo.amount === 0n || !!isOnUtxos) {
      return acc
    }

    acc.utxos.push(utxo)

    const {
      address
    } = utxo

    if (!acc.treeBalances[address]) {
      acc.treeBalances[address] = {
        address,
        utxos: [],
        balance: 0n,
      }
    }

    acc.treeBalances[address].balance += utxo.amount
    acc.treeBalances[address].utxos = [...acc.treeBalances[address].utxos, utxo]

    return acc
  }, {
    utxos: [],
    treeBalances: {},
  })
}
