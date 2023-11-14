import { MerkleTree } from 'fixed-merkle-tree'
import { treeHash } from '../util/poseidon';
import { MerkleTree as RawTree } from './tree';
import { MerkleTreeServiceInterface } from './types/tree.types';
import { emptyElement, subtreeExpectedValue, treeHeight } from '../constants/tree';

export class MerkleTreeService {
  readonly dbUrl: string;

  readonly chainId: number;

  readonly instanceName: string;

  tree: MerkleTree | null = null;

  leafs: string[] = []

  constructor({
    dbUrl,
    chainId,
    instanceName
  }: MerkleTreeServiceInterface) {
    this.dbUrl = dbUrl
    this.chainId = chainId
    this.instanceName = instanceName
  }

  createTree(leafs: string[]) {
    return new MerkleTree(treeHeight, leafs, {
      zeroElement: emptyElement,
      hashFunction: treeHash
    })
  }

  async getTree() {
    const tree = await this.getTreeFromDB()

    this.tree = tree

    return tree
  }

  async getTreeFromDB() {
    let leafs = await this.getLeafsFromDB()

    if (leafs.length < 3) {
      const padLeafs = Array(3 - leafs.length).fill(emptyElement)

      leafs = [...leafs, ...padLeafs]
    }

    // TODO: MOVE THIS TO SDK, OPACT HAS 0, 0, 0 VALUES ON STARTS OF ARRAY
    return this.createTree(['0', '0', '0', ...leafs])
  }

  async getLeafsFromDB() {
    let leafs: string[] = []

    let isLastPage = false

    while (!isLastPage) {
      const response = await fetch(this.dbUrl)

      const {
        data,
        is_last_page
      } = await response.json()

      leafs = [...leafs, ...data.map((dataItem: any) => {
        if (typeof dataItem === 'string') {
          return BigInt(dataItem)
        }

        return BigInt(dataItem.value)
      })]

      isLastPage = is_last_page
    }

    this.leafs = leafs

    return leafs
  }

  computeTreeValues(utxos: any[]): any {
    if (!this.tree) {
      throw new Error('Need to init merkle tree before')
    }

    const newIns = utxos.map((utxo: any, i:any) => {
      if (utxo.amount === 0n) {
        return {
          ...utxo,
          mp_path: i,
          mp_sibling: this.tree?.path(i).pathElements
        }
      }

      const index = this.tree?.indexOf(utxo.hash)

      return {
        ...utxo,
        mp_path: index,
        mp_sibling: this.tree?.proof(utxo.hash).pathElements
      }
    })

    const { root } = this.tree;

    return {
      newIns,
      treeRoot: root,
    }
  }

  async computeSubTreeValues(utxos: any[]) {
    if (!this.tree) {
      throw new Error('Need to init merkle tree before')
    }

    const subtree = await RawTree.build(treeHeight + 1)

    let sparseTreeComitments: bigint[] = []

    utxos.forEach((utxo: any, i:any) => {
      const indexOf = this.tree?.indexOf(utxo.hash) || i

      sparseTreeComitments[indexOf] = subtreeExpectedValue
    })

    sparseTreeComitments = [...sparseTreeComitments].map((value: any) => !value ? 0n : value)

    subtree.pushMany(sparseTreeComitments)

    const newIns = utxos.map((utxo: any, i: any) => {
      const indexOf = this.tree?.indexOf(utxo.hash)

      const value = indexOf && indexOf > -1 ? indexOf : i

      return {
        ...utxo,
        smp_path: subtree.proof(value)
      }
    })

    return {
      newIns,
      subtreeRoot: subtree.root,
    }
  }
}
