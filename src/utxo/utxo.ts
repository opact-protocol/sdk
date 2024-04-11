import { poseidon } from '@railgun-community/circomlibjs'
import { toHex } from 'ethereum-cryptography/utils';
import { getRandomBytesSync } from 'ethereum-cryptography/random';
import { encrypt } from '../encryption';
import { separateHex } from '../util/hex';
import { ReceiptInterface } from '../receipts';

export interface UtxoInterface {
  hash: bigint,
  token: bigint,
  amount: bigint,
  pubkey: bigint,
  address: string,
  blinding: bigint,
  id: string | number,
  receipt?: null | ReceiptInterface
}

export const getRandomBlinding = (): bigint => BigInt(`0x${toHex(getRandomBytesSync(32))}`)

export const ownerCommit = ({ pubkey, blinding }: UtxoInterface): bigint => poseidon([pubkey, blinding]);

export interface GetNullifierInterface {
  utxo: UtxoInterface,
  secret: bigint
}

export const getNullifier = ({ utxo, secret }: GetNullifierInterface): bigint => poseidon([secret, utxoHash(utxo)])

export const inUtxoInputs = ({ token, amount, blinding }: UtxoInterface): bigint[] => [token, amount, blinding];

export const utxoHash = ({ token, amount, pubkey, blinding }: UtxoInterface): bigint => outUtxoInputs({ token, amount, pubkey, blinding } as UtxoInterface)

export const outUtxoInputs = ({ token, amount, pubkey, blinding }: UtxoInterface): bigint => poseidon([token, amount, ownerCommit({ pubkey, blinding } as UtxoInterface)]);

export interface ObjUtxoInputsInterface {
  token: bigint,
  amount: bigint,
  owner_commit: bigint
}

export const objUtxoInputs = ({ token, amount, pubkey, blinding }: UtxoInterface): ObjUtxoInputsInterface => ({
  token,
  amount,
  owner_commit: ownerCommit({ pubkey, blinding } as UtxoInterface),
})

export const outUtxoInputsNoHashed = ({ blinding, token, amount, pubkey }: UtxoInterface): bigint[] => {
  const owner = ownerCommit({
    blinding,
    pubkey,
  } as UtxoInterface)

  return [BigInt(token), BigInt(amount), BigInt(owner)]
}

export interface GetUtxoInterface {
  token: string | bigint,
  pubkey: string | bigint,
  id?: string | number,
  address?: string,
  amount?: bigint | number,
  receipt?: ReceiptInterface | null,
}

export const getUtxo = ({
  token,
  pubkey,
  id = 0,
  amount = 0n,
  receipt = null,
  address = 'coin',
}: GetUtxoInterface): UtxoInterface => {
  const blinding = getRandomBlinding()

  const core =  {
    blinding,
    token: BigInt(token),
    amount: BigInt(amount),
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

export interface GetEncryptedUtxosOfTransactionInterface {
  batch: any,
  senderAddress: string,
  receiverAddress?: string,
}

export const getEncryptedUtxosOfTransaction = ({
  batch,
  senderAddress,
  receiverAddress,
}: GetEncryptedUtxosOfTransactionInterface): string[] => {
  const {
    babyjubPubkey: senderPubkey,
  } = separateHex(senderAddress);

  return batch.utxosOut.map((utxo: any) => {
    const address = utxo.pubkey === BigInt(senderPubkey)
      ? senderAddress
      : (receiverAddress || '')

    return encrypt({
      address,
      data: utxo,
    })
  })
}
