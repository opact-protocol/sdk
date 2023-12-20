import { getDelta, getSolutionBatch, getSolutionBatchForNFT, getSolutionOuts } from "./solutions"
import { deriveBabyJubKeysFromEth } from "../keys"
import { separateHex } from "../util/hex"
import { KadenaTokenInterface } from "../constants"
import { ReceiptInterface } from "../receipts"

export interface GetTransferSolutionBatchInterface {
  treeBalance: any,
  senderWallet: any,
  receipts?: ReceiptInterface[],
  receiverAddress?: string,
  totalRequired: string | number | bigint,
  excludedUTXOIDPositions?: any[],
  selectedToken: KadenaTokenInterface,
}

export const getTransferSolutionBatch = async ({
  treeBalance,
  senderWallet,
  totalRequired,
  selectedToken,
  receiverAddress,
  receipts = [],
  excludedUTXOIDPositions = [],
}: GetTransferSolutionBatchInterface) => {
  const {
    babyjubPubkey = '',
  } = separateHex(receiverAddress || '')

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

export interface GetTransferSolutionBatchForNFTInterface {
  treeBalance: any,
  senderWallet: any,
  receipts?: ReceiptInterface[],
  receiverAddress?: string,
  totalRequired: string | number | bigint,
  selectedToken: KadenaTokenInterface,
}

export const getTransferSolutionBatchForNFT = async ({
  treeBalance,
  senderWallet,
  selectedToken,
  totalRequired,
  receiverAddress,
  receipts = [],
}: GetTransferSolutionBatchForNFTInterface) => {
  const {
    babyjubPubkey = '',
  } = separateHex(receiverAddress || '')

  const derivedKeys = deriveBabyJubKeysFromEth(senderWallet)

  const utxosIn = await getSolutionBatchForNFT({
    treeBalance,
    pubkey: derivedKeys.pubkey,
  })

  const utxosOut = await getSolutionOuts({
    utxosIn,
    receipts,
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
