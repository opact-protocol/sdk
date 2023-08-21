// @ts-expect-error
import Pact from 'pact-lang-api'
import { encrypt } from "../encryption"
import { getReceiptsForUtxos } from "../encryption/receipts"

export const computeTransactionParams = ({
  root,
  batch,
  amount,
  sender,
  receiver,
  selectedToken,
  receiptsParams,
}: any) => {
  const extData = {
    sender,
    extAmount: amount.toFixed(1),
    recipient: receiver || sender,
    encryptedReceipts: getReceiptsForUtxos(receiptsParams),
    encryptedCommitments: batch.utxosOut.map((utxo: any) => encrypt(utxo, utxo.pubkey)),
  }

  const extDataHash = Pact.crypto.hash(`${extData.sender.toString() as string},${extData.extAmount.toString() as string},${extData.recipient.toString() as string},${extData.encryptedReceipts.join('')},${extData.encryptedCommitments.join('').toString() as string}`)

  const tokenHash = Pact.crypto.hash(`${selectedToken.id as string},${selectedToken.refName.name as string},${selectedToken.refName.namespace as string},${selectedToken.refSpec.name as string},${selectedToken.refSpec.namespace as string}`)

  // TODO: get token spec by selected token
  const tokenSpec = selectedToken

  return {
    extData,
    tokenSpec,
    args: {
      root,
      tokenHash,
      extDataHash,
      publicAmount: batch.delta,
      outputCommitments: batch.utxosOut.map((utxo: any) => utxo.hash.toString())
    }
  }
}
