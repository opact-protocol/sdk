import { assert } from 'chai';
import { MerkleTreeService } from "../new-tree";

describe('Merkletree tests', function test() {
  this.timeout(120000);

  it('The code must create a new merkletree ', async () => {
    const merkletree = await (new MerkleTreeService()).initMerkleTree([4485246893792388428001014082455705460960072146220752488586457108430613990559n], [0])

    assert(merkletree.root.toString(), '1081054836153385457759552758939196577384185106338722825307361568608087946820')
  });
});
