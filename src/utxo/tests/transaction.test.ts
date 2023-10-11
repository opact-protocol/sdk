import { getUtxo } from '../utxo';
import fetchMock from 'fetch-mock';
import { assert, expect, use } from 'chai';
// @ts-expect-error
import chaiFetchMock from 'chai-fetch-mock';
import { computeProof } from '../../proof';
import { isDefined } from '../../util/is-defined';
import { MerkleTree } from '../../merkletree/merkletree';
import { PROOF_LENGTH } from '../../constants/proof';
import { getDepositSoluctionBatch, getSolutionBatch, getSolutionOuts, getTransferSolutionBatch, filterZeroUTXOs } from '../../batch';

const token = 832719810210204902983213847411017819246076070166n

const baseUtxos = [0n, 30n, 40n, 50n, 10n, 20n, 10n, 20n, 0n]

const wallet = {
  pvtkey: 1482393132684423265528213543145697981060187089163992385907820405516567711584n,
  pubkey: 11266420894616539307519683389038109246654130435849311470670815520318096498921n,
}

const utxos = [
  ...baseUtxos.map((amount) => getUtxo({ amount, token, pubkey: wallet.pubkey }))
]

const commitments = utxos.map(utxo => ({ value: utxo.hash.toString() }))

use(chaiFetchMock);

describe('Transaction tests', function test() {
  this.timeout(120000);

  this.beforeAll(() => {
    fetchMock.get('https://bpsd19dro1.execute-api.us-east-2.amazonaws.com/commitments', {
      data: commitments,
      is_last_page: true
    })
  })

  it('Should create a solution batch of UTXOs', async () => {
    const tree = await MerkleTree.build(PROOF_LENGTH + 1);

    tree.pushMany(utxos.map((utxo: any) => utxo.hash));

    const treeBalance = {
      tree,
      token,
      utxos,
      balance: 150n,
    }

    const utxosForSort = [...treeBalance.utxos];

    const filteredZeroes = filterZeroUTXOs(utxosForSort);

    expect(filteredZeroes.map((utxo) => utxo.amount)).to.deep.equal([30n, 40n, 50n, 10n, 20n, 10n, 20n]);

    const batch = await getSolutionBatch({
      pubkey: wallet.pubkey,
      totalRequired: 70n,
      excludedUTXOIDPositions: [],
      treeBalance: treeBalance as any,
    });

    assert(isDefined(batch));
    expect(batch.map((utxo: any) => utxo.amount)).to.deep.equal([30n, 40n, 50n]);

    const batch2 = await getSolutionBatch({
      pubkey: wallet.pubkey,
      totalRequired: 100n,
      excludedUTXOIDPositions: [],
      treeBalance: treeBalance as any,
    });

    const outs = await getSolutionOuts({
      treeBalance,
      utxosIn: batch2,
      totalRequired: 100n,
      senderPubkey: wallet.pubkey,
      selectedToken: {
        id: '',
        refName: {
          name: 'coin',
          namespace: ''
        },
        refSpec: {
          name: 'fungible-v2',
          namespace: ''
        }
      },
    })

    assert(isDefined(batch2));
    expect(batch2.map((utxo: any) => utxo.amount)).to.deep.equal([30n, 40n, 50n]);
    expect(outs.map((utxo: any) => utxo.amount)).to.deep.equal([20n, 0n]);
  });

  it('The code must be create a valid withdraw transaction', async () => {
    const treeBalance = {
      token,
      utxos,
      balance: 150n,
    }

    const batch = await getTransferSolutionBatch({
      treeBalance,
      totalRequired: 66n,
      senderWallet: wallet,
    })

    const proof = computeProof({
      batch,
    })

    assert(isDefined(proof));
  })

  it('The code must be create a valid deposit transaction', async () => {
    const treeBalance = {
      token,
      utxos,
      balance: 150n,
    }

    const batch = await getDepositSoluctionBatch({
      treeBalance,
      totalRequired: 15n,
      senderWallet: wallet,
      selectedToken: {
        id: '',
        refName: {
          name: 'coin',
          namespace: ''
        },
        refSpec: {
          name: 'fungible-v2',
          namespace: ''
        }
      }
    })

    const proof = computeProof({
      batch,
    })

    assert(isDefined(proof));
  })
});
