// @ts-expect-error
import Pact from 'pact-lang-api'
import { poseidon } from "circomlibjs"
import { base64urlToBigInt } from "../util"
import { computeTreeValues } from '../proof/tree-values'
import { getDelta, getSolutionBatch, getSolutionOuts } from "./solutions"

export const getTransferSolutionBatch = async ({
  commitments,
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
  excludedUTXOIDPositions = [],
}: any) => {
  if (receiverPubkey) {
    receiverPubkey = BigInt(receiverPubkey)
  }

  const blakeHash = Pact.crypto.hash(`${selectedToken.id as string},${selectedToken.refName.name as string},${selectedToken.refName.namespace as string},${selectedToken.refSpec.name as string},${selectedToken.refSpec.namespace as string}`)

  const tokenHash = Pact.crypto.hash(blakeHash)

  const token = poseidon([base64urlToBigInt(tokenHash)])

  const utxosIn = await getSolutionBatch({
    treeBalance: {
      ...treeBalance,
      token,
    },
    totalRequired,
    excludedUTXOIDPositions,
    pubkey: senderWallet.pubkey,
  })

  const utxosOut = await getSolutionOuts({
    utxosIn,
    treeBalance: {
      ...treeBalance,
      token,
    },
    selectedToken,
    totalRequired,
    receiverPubkey,
    senderPubkey: senderWallet.pubkey,
  })

  const delta = await getDelta({ utxosOut, utxosIn })

  const {
    roots,
    newIns
  } = await computeTreeValues(utxosIn, commitments)

  return {
    delta,
    roots,
    token,
    utxosOut,
    utxosIn: newIns,
  }
}
