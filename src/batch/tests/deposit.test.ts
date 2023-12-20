import fetchMock from 'fetch-mock';
import { getEncryptedUtxosOfTransaction, getUtxo } from '../../utxo';
import { formatInteger, isDefined } from '../../util';
import { expect, use } from 'chai';
import chaiFetchMock from 'chai-fetch-mock';
import { getRandomWallet } from '../../keys';
import { separateHex } from '../../util/hex';
import { MerkleTreeService } from '../../merkle-tree';
import { getDepositSoluctionBatch } from '../deposit';
import { groth16 } from 'snarkjs'
import { computeInputs } from '../../proof';
import { kadenaTokens as kadenaBaseTokens } from '../../constants';
import { getEncryptedReceiptsOfTransaction } from '../../receipts';
import { getKdaMessage, getKdaTransactionParams } from '../../kadena';

const token = 832719810210204902983213847411017819246076070166n

const baseUtxos = [0n, 30n, 40n, 50n, 10n, 20n, 10n, 20n, 0n]

const wallet = getRandomWallet()

const {
  babyjubPubkey: pubkey,
} = separateHex(wallet.address)

const utxos = [
  ...baseUtxos.map((amount) => getUtxo({ amount, token, pubkey }))
]

const events = utxos.map(utxo => ({ value: utxo.hash.toString() }))

use(chaiFetchMock);

describe('Deposit tests', function test() {
  this.timeout(120000);

  this.beforeAll(() => {
    fetchMock.get(
      'https://bpsd19dro1.execute-api.us-east-2.amazonaws.com/commitments',
      {
        data: events,
        is_last_page: true
      },
      { overwriteRoutes: true }
    )
  })

  it('Should create a valid solution batch to deposit an token', async () => {
    const integerAmount = formatInteger(15, 12)

    const batch = await getDepositSoluctionBatch({
      totalRequired: 15n,
      senderWallet: wallet,
      selectedToken: kadenaBaseTokens[0]
    })

    const {
      delta,
      utxosIn,
      utxosOut,
    } = batch

    const encryptedReceipts = getEncryptedReceiptsOfTransaction({
      type: 'deposit',
      amount: '15000000000000',
      senderAddress: '123456789',
      receiverAddress: wallet.address,
      selectedToken: kadenaBaseTokens[0],
    })

    const encryptedUtxos = getEncryptedUtxosOfTransaction({
      batch,
      senderAddress: wallet.address,
    })

    const extData = getKdaTransactionParams({
      batch,
      encryptedUtxos,
      encryptedReceipts,
      amount: integerAmount,
      sender: wallet.address,
      selectedToken: kadenaBaseTokens[0],
    })

    const message = getKdaMessage({
      extData
    })

    const service = new MerkleTreeService({
      chainId: 0,
      dbUrl: 'https://bpsd19dro1.execute-api.us-east-2.amazonaws.com/commitments',
      instanceName: 'commitments-tree'
    })

    await service.getTree()

    const {
      treeRoot,
      newIns: updatedUtxosInWithTreeValues,
    } = await service.computeTreeValues(utxosIn)

    const {
      subtreeRoot,
      newIns: updatedUtxosInWithSubtreeValues
    } = await service.computeSubTreeValues(updatedUtxosInWithTreeValues)

    const { inputs } = await computeInputs({
      delta,
      wallet,
      message,
      utxosOut,
      selectedToken: kadenaBaseTokens[0],
      utxosIn: updatedUtxosInWithSubtreeValues,
      roots: {
        tree: treeRoot,
        subtree: subtreeRoot,
      },
    })

    const {
      proof,
      publicSignals
    } = await groth16.fullProve(
      inputs,
      './src/utxo/tests/transaction.wasm',
      './src/utxo/tests/transaction_0001.zkey',
    )

    expect(isDefined(proof))
    expect(isDefined(publicSignals))
  });

  it('Should create a valid solution batch to deposit an NFT', async () => {
    const integerAmount = formatInteger(1, 12)

    const selectedToken = {
      id: 1,
      hash: '13877195906731458605016021467285788145976188816213394937612601557537064573739',
      address: 'poly-fungible-v2-reference',
      namespace: {
        id: 1,
        refName: {
          name: 'poly-fungible-v2-reference',
          namespace: 'free'
        },
        refSpec: {
          name: 'poly-fungible-v2',
          namespace: 'kip'
        }
      }
    } as any

    const batch = await getDepositSoluctionBatch({
      selectedToken,
      totalRequired: 1,
      senderWallet: wallet,
    })

    const {
      delta,
      utxosIn,
      utxosOut,
    } = batch

    const encryptedReceipts = getEncryptedReceiptsOfTransaction({
      selectedToken,
      type: 'deposit',
      amount: integerAmount,
      senderAddress: '123456789',
      receiverAddress: wallet.address,
    })

    const encryptedUtxos = getEncryptedUtxosOfTransaction({
      batch,
      senderAddress: wallet.address,
    })

    const extData = getKdaTransactionParams({
      batch,
      selectedToken,
      encryptedUtxos,
      encryptedReceipts,
      amount: integerAmount,
      sender: wallet.address,
    })

    const message = getKdaMessage({
      extData
    })

    const service = new MerkleTreeService({
      chainId: 0,
      dbUrl: 'https://bpsd19dro1.execute-api.us-east-2.amazonaws.com/commitments',
      instanceName: 'commitments-tree'
    })

    await service.getTree()

    const {
      treeRoot,
      newIns: updatedUtxosInWithTreeValues,
    } = await service.computeTreeValues(utxosIn)

    const {
      subtreeRoot,
      newIns: updatedUtxosInWithSubtreeValues
    } = await service.computeSubTreeValues(updatedUtxosInWithTreeValues)

    const { inputs } = await computeInputs({
      delta,
      wallet,
      message,
      utxosOut,
      selectedToken,
      utxosIn: updatedUtxosInWithSubtreeValues,
      roots: {
        tree: treeRoot,
        subtree: subtreeRoot,
      },
    })

    const {
      proof,
      publicSignals
    } = await groth16.fullProve(
      inputs,
      './src/utxo/tests/transaction.wasm',
      './src/utxo/tests/transaction_0001.zkey',
    )

    expect(isDefined(proof))
    expect(isDefined(publicSignals))
  });
});
