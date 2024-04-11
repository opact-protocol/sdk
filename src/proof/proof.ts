import { poseidon } from '@railgun-community/circomlibjs'
import { WalletInterface, deriveBabyJubKeysFromEth } from '../keys'
import { getNullifier, inUtxoInputs, outUtxoInputsNoHashed } from "../utxo"
import { KadenaTokenInterface } from '../constants'
import { getPublicArgs } from './public-values'

let snarkjs: any = null

export const getProof = async (inputs: any) => {
  if (!snarkjs) {
    snarkjs = await import('snarkjs')
  }

  if (!snarkjs.groth16) {
    throw new Error('groth not installed')
  }

  const { proof, publicSignals } =
    await snarkjs.groth16.fullProve(
      inputs,
      '/transaction.wasm',
      '/transaction_0001.zkey'
    )

  return getPublicArgs(proof, publicSignals)
}

export interface ProofInputsInterface {
  root: bigint,
  token: bigint,
  delta: bigint,
  secret: bigint,
  message_hash: bigint,
  secret_token: bigint,
  subtree_root: bigint,

  mp_path: bigint[],
  nullifier: bigint[],
  mp_sibling: bigint[],
  utxo_in_data: bigint[],
  utxo_out_hash: bigint[],
  utxo_out_data: bigint[],
  subtree_mp_sibling: bigint[],
}

export interface ComputeInputsInterface {
  utxosIn: any[],
  utxosOut: any[],
  roots: {
    tree: bigint | string,
    subtree: bigint | string,
  },
  delta: string | bigint,
  wallet: WalletInterface,
  message: string | bigint,
  selectedToken: KadenaTokenInterface
}

export const computeInputs = async ({
  roots,
  delta,
  wallet,
  message,
  utxosIn,
  utxosOut,
  selectedToken,
}: ComputeInputsInterface) => {
  const token = BigInt(selectedToken.hash)

  const {
    pvtkey: secret
  } = deriveBabyJubKeysFromEth(wallet)

  const root = roots.tree

  const secret_token = token

  const subtree_root = roots.subtree

  const mp_path = utxosIn.map((u: any) => u.mp_path)

  const nullifier = utxosIn.map((u: any) => {
    return getNullifier({
      utxo: u,
      secret,
    })
  })

  const mp_sibling = utxosIn.map((u: any) => u.mp_sibling)

  const utxo_out_hash = utxosOut.map(({ hash }: any) => BigInt(hash))

  const subtree_mp_sibling = utxosIn.map((u: any) => u.smp_path)

  const utxo_in_data = utxosIn.map((utxo: any) => inUtxoInputs(utxo).slice(1))

  const utxo_out_data = utxosOut.map((txo: any) => outUtxoInputsNoHashed(txo).slice(1))

  return{
    inputs: {
      root,
      token,
      delta,
      secret,
      mp_path,
      nullifier,
      mp_sibling,
      secret_token,
      subtree_root,
      utxo_in_data,
      utxo_out_hash,
      utxo_out_data,
      subtree_mp_sibling,
      message_hash: message || poseidon([BigInt(1)]),
    }
  }
}
