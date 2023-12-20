import { getUtxo } from '../utxo'
import { getDelta, getSolutionOuts } from "./solutions"
import { deriveBabyJubKeysFromEth } from '../keys'
import { KadenaTokenInterface } from '../constants'
import { ReceiptInterface } from '../receipts'

export interface GetDepositSoluctionBatchInterface {
  senderWallet: any
  receipts?: ReceiptInterface[]
  receiverPubkey?: string
  totalRequired: string | number | bigint
  selectedToken: KadenaTokenInterface
}

export const getDepositSoluctionBatch = async ({
  senderWallet,
  totalRequired,
  selectedToken,
  receiverPubkey,
  receipts = [],
}: GetDepositSoluctionBatchInterface) => {
  const derivedKeys = deriveBabyJubKeysFromEth(senderWallet)

  const utxosIn =  [
    getUtxo({
      amount: 0n,
      id: selectedToken.id,
      token: selectedToken.hash,
      pubkey: derivedKeys.pubkey,
      address: selectedToken.address,
    }),
    getUtxo({
      amount: 0n,
      id: selectedToken.id,
      token: selectedToken.hash,
      pubkey: derivedKeys.pubkey,
      address: selectedToken.address,
    }),
    getUtxo({
      amount: 0n,
      id: selectedToken.id,
      token: selectedToken.hash,
      pubkey: derivedKeys.pubkey,
      address: selectedToken.address,
    }),
  ]

  const utxosOut = await getSolutionOuts({
    utxosIn,
    receipts,
    totalRequired,
    selectedToken,
    isDeposit: true,
    senderPubkey: receiverPubkey || derivedKeys.pubkey,
  })

  const delta = await getDelta({ utxosOut, utxosIn })

  return {
    delta,
    utxosIn,
    utxosOut,
  }
}
