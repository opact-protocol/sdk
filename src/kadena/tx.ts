import { encrypt } from '../encryption'
import { getReceiptsForUtxos } from '../encryption/receipts'
import { formatInteger, getPoseidonMessageHash } from '../util'

export const computeTransactionParams = ({
  root,
  batch,
  amount,
  sender,
  receiver,
  selectedToken,
  receiptsParams,
}: any) => {
  const extAmount = formatInteger(amount, 12)

  const extData = {
    sender,
    tokenAmount: extAmount,
    tokenId: selectedToken.id,
    recipient: receiver || sender,
    tokenType: selectedToken.refSpec.name,
    encryptedReceipts: getReceiptsForUtxos(receiptsParams),
    outputCommitments: batch.utxosOut.map((utxo: any) => utxo.hash.toString()),
    encryptedCommitments: batch.utxosOut.map((utxo: any) => encrypt(utxo, utxo.pubkey)),
  }

  const message = getPoseidonMessageHash(extData)

  return {
    extData,
    message
  }
}
