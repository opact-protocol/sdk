import { poseidon } from 'circomlibjs'
import { toHex } from 'ethereum-cryptography/utils';
import { getRandomBytesSync } from 'ethereum-cryptography/random';
import { TXO } from './types/utxo.type';
import { encrypt } from '../encryption';
import { separateHex } from '../util/hex';

export const getRandomBlinding = () => BigInt(`0x${toHex(getRandomBytesSync(32))}`)

export const ownerCommit = ({ pubkey, blinding }: any) => poseidon([pubkey, blinding]);

export const getNullifier = ({ utxo, secret }: any) => poseidon([secret, utxoHash(utxo)])

export const inUtxoInputs = ({ token, amount, blinding }: any) => [token, amount, blinding];

export const utxoHash = ({ token, amount, pubkey, blinding }: TXO) => outUtxoInputs({ token, amount, pubkey, blinding })

export const outUtxoInputs = ({ token, amount, pubkey, blinding }: any) => poseidon([token, amount, ownerCommit({pubkey, blinding})]);

export const objUtxoInputs = ({ token, amount, pubkey, blinding }: any) => ({
  token,
  amount,
  owner_commit: ownerCommit({ pubkey, blinding }),
})

export const outUtxoInputsNoHashed = ({ blinding, token, amount, pubkey }: any) => {
  const owner = ownerCommit({
    blinding,
    pubkey,
  })

  return [BigInt(token), BigInt(amount), BigInt(owner)]
}

export const getUtxo = ({
  token,
  pubkey,
  id = 0,
  amount = 0n,
  receipt = null,
  address = 'coin',
}: any): any => {
  const blinding = getRandomBlinding()

  const core =  {
    amount,
    blinding,
    token: BigInt(token),
    pubkey: BigInt(pubkey),
  }

  const hash = utxoHash(core as any)

  return {
    id,
    hash,
    address,
    receipt,
    ...core
  };
};

export const getEncryptedUtxosOfTransaction = ({
  batch,
  senderAddress,
  receiverAddress,
}: any) => {
  const {
    babyjubPubkey: senderPubkey,
  } = separateHex(senderAddress);

  return batch.utxosOut.map((utxo: any) => {
    const address = utxo.pubkey === BigInt(senderPubkey)
      ? senderAddress
      : receiverAddress

    return encrypt({
      address,
      data: utxo,
    })
  })
}
