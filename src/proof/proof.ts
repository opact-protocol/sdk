// TODO: fix eslint
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { groth16 } from 'snarkjs'
import { getNullifier, inUtxoInputs, outUtxoInputsNoHashed } from "../utxo"
import { getPublicArgs } from './public-values'
import { poseidon } from 'circomlibjs'
import { artifactStore } from '../util/artifact-store'
// import { MerkleTree, MerkleTreeService } from '../merkletree'

// const PROOF_LENGTH = 32

// const EXPECTED_VALUE = 11954255677048767585730959529592939615262310191150853775895456173962480955685n
export const computeInputs = async ({
  batch,
  wallet,
  message,
}: any) => {
  const {
    token,
    roots,
    delta,
    utxosIn,
    utxosOut,
  } = batch

  const root = roots.tree

  const secret_token = token

  const subtree_root = roots.subtree

  const secret = BigInt(wallet.pvtkey)

  const mp_path = utxosIn.map((u: any) => u.mp_path)

  const nullifier = utxosIn.map((u: any) => {
    return getNullifier({
      utxo: u,
      secret: wallet.pvtkey
    })
  })

  const mp_sibling = utxosIn.map((u: any) => u.mp_sibling)

  const utxo_out_hash = utxosOut.map(({ hash }: any) => BigInt(hash))

  const subtree_mp_sibling = utxosIn.map((u: any) => u.smp_path)

  const utxo_in_data = utxosIn.map((utxo: any) => inUtxoInputs(utxo).slice(1))

  const utxo_out_data = batch.utxosOut.map((txo: any) => outUtxoInputsNoHashed(txo).slice(1))

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

export const computeProof = async ({
  batch,
  wallet,
  message,
}: any) => {
  const zkey = await artifactStore.get('/transaction_0001.zkey')

  const { inputs } = await computeInputs({
    batch,
    wallet,
    message,
  })

  const {
    proof,
    publicSignals
  } = await groth16.fullProve(
    inputs,
    '/transaction.wasm',
    zkey,
  )

  return getPublicArgs(proof, publicSignals)
}

// export const computeTreeValues = async (batch: any, commitments: any[], isDeposit = false) => {
//   const tree = await (new MerkleTreeService()).initMerkleTree(
//     [
//       0,
//       ...commitments.map((comm: any) => BigInt(comm.value))
//     ]
//   )

//   const subtree = await MerkleTree.build(PROOF_LENGTH + 1)

//   let sparseTreeComitments = Array(12).fill(0n)

//   let newIns = batch.utxosIn.map((utxo: any, i:any) => {
//     const base = {
//       hash: BigInt(utxo.hash),
//       token: BigInt(utxo.token),
//       amount: BigInt(utxo.amount),
//       blinding: BigInt(utxo.blinding),
//       pubkey: BigInt(utxo.pubkey),
//     }

//     if (utxo.amount === 0n || isDeposit) {
//       return {
//         ...base,
//         mp_path: i,
//         mp_sibling: tree.path(i).pathElements
//       }
//     }

//     const index = tree.indexOf(BigInt(utxo.hash) as any)

//     sparseTreeComitments[index] = EXPECTED_VALUE

//     return {
//       ...base,
//       mp_path: index,
//       mp_sibling: tree.proof(BigInt(utxo.hash) as any).pathElements
//     }
//   })

//   sparseTreeComitments = [...sparseTreeComitments].map((value: any) => !value ? 0n : value)

//   subtree.pushMany(sparseTreeComitments)

//   newIns = newIns.map((utxo: any, i: any) => {
//     const { order } = commitments.find(({ value }: any) => BigInt(value) === utxo.hash) || {}

//     if (order && !isDeposit) {
//       return {
//         ...utxo,
//         smp_path: subtree.proof(order - 1)
//       }
//     }

//     return {
//       ...utxo,
//       smp_path: subtree.proof(i)
//     }
//   })

//   return {
//     newIns,
//     roots: {
//       tree: tree.root,
//       subtree: subtree.root,
//     }
//   }
// }
