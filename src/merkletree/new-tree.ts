/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import MerkleTree, { MerkleTree as FixedMerkleTree } from "fixed-merkle-tree";
import { PoseidonClass } from "./hash";

export class MerkleTreeService {
  readonly name: string;

  tree: any | undefined;

  constructor(
    name = 'foooooo',
  ) {
    this.name = name;
  }

  async initMerkleTree(items: any, baseElements: any[] = []): Promise<MerkleTree> {
    const { hash } = await (new PoseidonClass()).load();

    const tree = new FixedMerkleTree(32, baseElements,
      {
        zeroElement: 19014214495641488759237505126948346942972912379615652741039992445865937985820n as any,
        hashFunction: hash,
      } as any
    );

    if (!items) {
      this.tree = tree;

      return tree;
    }

    items.forEach((value: any, i: number) => {
      const pos = baseElements.length + i

      try {
        tree.update(pos, value);
      } catch (e) {
        console.warn(e);

        throw new Error("Error when update Merkle Tree");
      }
    });

    this.tree = tree;

    return tree;
  }
}
