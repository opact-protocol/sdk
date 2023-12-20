import fetchMock from 'fetch-mock';
import { expect, use } from 'chai';
import chaiFetchMock from 'chai-fetch-mock';
import { groth16 } from 'snarkjs'
import { getEncryptedUtxosOfTransaction, getUtxo } from '../../utxo';
import { formatInteger, isDefined } from '../../util';
import { getRandomWallet } from '../../keys';
import { separateHex } from '../../util/hex';
import { MerkleTreeService } from '../../merkle-tree';
import { computeInputs } from '../../proof';
import { kadenaTokens as kadenaBaseTokens } from '../../constants';
import { getEncryptedReceiptsOfTransaction } from '../../receipts';
import { getKdaMessage, getKdaTransactionParams } from '../../kadena';
import { getTransferSolutionBatch, getTransferSolutionBatchForNFT } from '../transfer';

const kdaAddress = 'k:045d640d3abaf87670e2676c094629e29d1665ef6f409fde0247b606ab552131';

const token = 21414792165107094930503066755869007218485843369153027361954450892852833682115n

const baseUtxos = [0n, 30n, 40n, 50n, 10n, 20n, 10n, 20n, 0n]

const wallet = getRandomWallet()

const {
  babyjubPubkey: pubkey,
} = separateHex(wallet.address)

const utxos = [
  ...baseUtxos.map((amount) => getUtxo({ amount, token, pubkey })),
  getUtxo({
    pubkey,
    amount: 1000000000000n,
    token: 13877195906731458605016021467285788145976188816213394937612601557537064573739n,
  })
]

const events = utxos.map(utxo => ({ value: utxo.hash.toString() }))

use(chaiFetchMock);

describe('Withdraw tests', function test() {
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

  it('Should create a valid solution batch to withdraw an token', async () => {
    const integerAmount = formatInteger(15, 12) as any

    const treeBalance = {
      utxos,
      balance: 150n,
      token: kadenaBaseTokens[0].hash,
    }


    const batch = await getTransferSolutionBatch({
      treeBalance,
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
      type: 'withdraw',
      amount: integerAmount * -1,
      senderAddress: wallet.address,
      receiverAddress: kdaAddress,
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

  it('Should create a valid solution batch to withdraw an NFT', async () => {
    const integerAmount = formatInteger(1, 12) as any

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
    }

    const treeBalance = {
      token: BigInt(selectedToken.hash),
      balance: 1000000000000,
      utxos: [
        utxos.at(-1),
      ]
    }

    const batch = await getTransferSolutionBatchForNFT({
      treeBalance,
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
      type: 'withdraw',
      amount: integerAmount * -1,
      receiverAddress: kdaAddress,
      senderAddress: wallet.address,
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
      receiver: kdaAddress,
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
