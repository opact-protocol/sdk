import { KadenaTokenInterface } from "../constants"
import { encrypt } from "../encryption"

export interface GetReceiptsOfTransactionInterface {
  senderAddress: string,
  receiverAddress: string,
  amount: string | bigint | number,
  selectedToken: KadenaTokenInterface
  type: 'deposit' | 'withdraw' | 'transfer',
}

export interface ReceiptInterface {
  date: number,
  amount: string,
  sender: string,
  address: string,
  receiver: string,
  id: string | number,
  type: 'deposit' | 'withdraw',
}

export const getReceiptsOfTransaction = ({
  type,
  amount,
  selectedToken,
  senderAddress,
  receiverAddress,
}: GetReceiptsOfTransactionInterface): ReceiptInterface[] => {
  const {
    id,
    address,
  } = selectedToken

  if (type === 'deposit') {
    return [
      {
        id,
        type,
        address,
        date: Date.now(),
        amount: amount.toString(),
        sender: senderAddress,
        receiver: receiverAddress,
      }
    ]
  }

  if (type === 'withdraw') {
    return [
      {
        id,
        type,
        address,
        date: Date.now(),
        amount: amount.toString(),
        sender: senderAddress,
        receiver: receiverAddress,
      },
    ]
  }

  return [
    {
      id,
      address,
      date: Date.now(),
      amount: amount.toString(),
      sender: senderAddress,
      receiver: receiverAddress,
      type: type === 'transfer' ? 'withdraw' : type,
    },
    {
      id,
      address,
      date: Date.now(),
      amount: amount.toString(),
      sender: senderAddress,
      receiver: receiverAddress,
      type: type === 'transfer' ? 'deposit' : type,
    }
  ]
}

export const getEncryptedReceiptsOfTransaction = ({
  type,
  amount,
  selectedToken,
  senderAddress,
  receiverAddress,
}: GetReceiptsOfTransactionInterface): string[] => {
  const receipts = getReceiptsOfTransaction({
    type,
    amount,
    selectedToken,
    senderAddress,
    receiverAddress,
  })

  if (type === 'deposit') {
    return [
      encrypt({
        isUtxo: false,
        address: receiverAddress,
        data: receipts[0],
      })
    ]
  }

  if (type === 'withdraw') {
    return [
      encrypt({
        isUtxo: false,
        address: senderAddress,
        data: receipts[0],
      })
    ]
  }

  return [
    encrypt({
      isUtxo: false,
      address: senderAddress,
      data: receipts[0],
    }),
    encrypt({
      isUtxo: false,
      address: receiverAddress,
      data: receipts[1],
    })
  ]
}
