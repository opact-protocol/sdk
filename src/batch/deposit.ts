// @ts-expect-error
import Pact from 'pact-lang-api'
import { poseidon } from "circomlibjs"
import { getUtxo } from '../utxo'
import { base64urlToBigInt } from "../util"
import { computeTreeValues } from '../proof/tree-values'
import { getDelta, getSolutionOuts } from "./solutions"

export const getDepositSoluctionBatch = async ({
  treeBalance,
  senderWallet,
  totalRequired,
  receiverPubkey,
  selectedToken = {
    id: '',
    refName: {
      name: 'coin',
      namespace: ''
    },
    refSpec: {
      name: 'fungible-v2',
      namespace: ''
    }
  },
}: any) => {
  if (receiverPubkey) {
    receiverPubkey = BigInt(receiverPubkey)
  }

  const blakeHash = Pact.crypto.hash(`${selectedToken.id as string},${selectedToken.refName.name as string},${selectedToken.refName.namespace as string},${selectedToken.refSpec.name as string},${selectedToken.refSpec.namespace as string}`)

  const tokenHash = Pact.crypto.hash(blakeHash)

  const token = poseidon([base64urlToBigInt(tokenHash)])

  const utxosIn =  [
    getUtxo({
      token,
      amount: 0n,
      id: selectedToken.id,
      pubkey: senderWallet.pubkey,
      address: selectedToken.refName,
    }),
    getUtxo({
      token,
      amount: 0n,
      id: selectedToken.id,
      pubkey: senderWallet.pubkey,
      address: selectedToken.refName,
    }),
    getUtxo({
      token,
      amount: 0n,
      id: selectedToken.id,
      pubkey: senderWallet.pubkey,
      address: selectedToken.refName,
    }),
  ]

  const utxosOut = await getSolutionOuts({
    utxosIn,
    treeBalance: {
      ...treeBalance,
      token,
    },
    totalRequired,
    selectedToken,
    senderPubkey: receiverPubkey || senderWallet.pubkey,
    isDeposit: true,
  })

  const delta = await getDelta({ utxosOut, utxosIn })

  const {
    roots,
    newIns
  } = await computeTreeValues(utxosIn)

  return {
    delta,
    roots,
    token,
    utxosOut,
    utxosIn: newIns,
  }
}
