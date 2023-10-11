import { getUtxo } from '../utxo'
import { getPoseidonTokenHash } from '../util'
import { computeTreeValues } from '../proof/tree-values'
import { getDelta, getSolutionOuts } from "./solutions"

export const getDepositSoluctionBatch = async ({
  treeBalance,
  senderWallet,
  totalRequired,
  selectedToken,
  receiverPubkey,
}: any) => {
  if (receiverPubkey) {
    receiverPubkey = BigInt(receiverPubkey)
  }

  const token = getPoseidonTokenHash(selectedToken)

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
