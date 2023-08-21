import { encrypt } from "./encrypt"

export const getReceipt = ({
  type,
  utxo,
  sender,
  pubkey,
  receiver,
}: any) => {
  return encrypt({
    type,
    date: Date.now(),
    tokenId: utxo.tokenId,
    sender: sender.toString(),
    receiver: receiver.toString(),
    amount: utxo.amount.toString(),
  }, pubkey)
}

export const getReceiptsForUtxos = ({
  type,
  amount,
  sender,
  id = 0,
  receiver,
  address = 'coin',
}: any) => {
  if (type === 'deposit') {
    return [
      encrypt({
        id,
        type,
        address,
        date: Date.now(),
        amount: amount.toString(),
        sender: sender.toString(),
        receiver: `OZK${receiver.toString(16) as string}`,
      }, receiver)
    ]
  }

  if (type === 'withdraw') {
    return [
      encrypt({
        id,
        type,
        address,
        date: Date.now(),
        amount: amount.toString(),
        sender: sender.toString(),
        receiver: receiver.toString(),
      }, sender),
    ]
  }

  return [
    encrypt({
      id,
      address,
      date: Date.now(),
      amount: amount.toString(),
      sender: `OZK${sender.toString(16) as string}`,
      receiver: `OZK${receiver.toString(16) as string}`,
      type: type === 'transfer' ? 'withdraw' : type,
    }, sender),

    encrypt({
      id,
      address,
      date: Date.now(),
      amount: amount.toString(),
      sender: `OZK${sender.toString(16) as string}`,
      receiver: `OZK${receiver.toString(16) as string}`,
      type: type === 'transfer' ? 'deposit' : type,
    }, receiver)
  ]
}
