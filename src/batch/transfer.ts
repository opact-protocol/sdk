import { getDelta, getSolutionBatch, getSolutionBatchForNFT, getSolutionOuts } from "./solutions"
import { deriveBabyJubKeysFromEth } from "../keys"
import { separateHex } from "../util/hex"

export const getTransferSolutionBatch = async ({
  treeBalance,
  senderWallet,
  totalRequired,
  selectedToken,
  receiverAddress,
  receipts = [],
  excludedUTXOIDPositions = [],
}: any) => {
  const {
    babyjubPubkey = '',
  } = separateHex(receiverAddress)

  const derivedKeys = deriveBabyJubKeysFromEth(senderWallet)

  const utxosIn = await getSolutionBatch({
    treeBalance,
    totalRequired,
    excludedUTXOIDPositions,
    pubkey: derivedKeys.pubkey,
  })

  const utxosOut = await getSolutionOuts({
    utxosIn,
    receipts,
    treeBalance,
    selectedToken,
    totalRequired,
    receiverPubkey: babyjubPubkey,
    senderPubkey: derivedKeys.pubkey,
  })

  const delta = await getDelta({ utxosOut, utxosIn })

  return {
    delta,
    utxosIn,
    utxosOut,
  }
}

export const getTransferSolutionBatchForNFT = async ({
  treeBalance,
  senderWallet,
  selectedToken,
  totalRequired,
  receiverAddress,
  receipts = [],
}: any) => {
  const {
    babyjubPubkey = '',
  } = separateHex(receiverAddress)

  const derivedKeys = deriveBabyJubKeysFromEth(senderWallet)

  const utxosIn = await getSolutionBatchForNFT({
    treeBalance,
    pubkey: derivedKeys.pubkey,
  })

  const utxosOut = await getSolutionOuts({
    utxosIn,
    receipts,
    treeBalance,
    selectedToken,
    totalRequired,
    receiverPubkey: babyjubPubkey,
    senderPubkey: derivedKeys.pubkey,
  })

  const delta = await getDelta({ utxosOut, utxosIn })

  return {
    delta,
    utxosIn,
    utxosOut,
  }
}
