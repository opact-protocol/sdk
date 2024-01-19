import { genKeyPair, sign } from '@kadena/cryptography-utils';
import { PactNumber } from '@kadena/pactjs'
import { Pact, createClient, isSignedTransaction } from '@kadena/client';
import { KadenaTokenInterface, NamespaceInterface, getConfig } from '../constants'
import { formatBigNumberWithDecimals, getContractAddress, getDecimals } from '../util';
import { opactTransactCode } from './pact';

export interface GetKdaTransactionParamsInterface {
  batch: any,
  amount: string | number,
  sender: string,
  receiver?: string,
  selectedToken: KadenaTokenInterface,
  encryptedUtxos: string[],
  encryptedReceipts?: string[],
}

export interface ExtDataInterface {
  sender: string,
  tokenType: string,
  recipient: string,
  tokenId: string | number,
  outputCommitments: string[],
  tokenAmount: string | number,
  encryptedCommitments: string[],
  encryptedReceipts?: string[],
}

export const getKdaTransactionParams = ({
  batch,
  amount,
  sender,
  receiver,
  selectedToken,
  encryptedUtxos,
  encryptedReceipts = [],
}: GetKdaTransactionParamsInterface) => {
  return {
    sender,
    encryptedReceipts,
    tokenAmount: amount,
    tokenId: selectedToken.id,
    recipient: receiver || sender,
    encryptedCommitments: encryptedUtxos,
    tokenType: selectedToken.namespace.refSpec.name,
    outputCommitments: batch.utxosOut.map((utxo: any) => utxo.hash.toString()),
  }
}

export interface GetPartialOpactCommandInterface {
  proof: any,
  senderAccount: string,
  extData: ExtDataInterface,
  tokenSpec: NamespaceInterface,
}

export const getPartialOpactCommand = ({
  proof,
  extData,
  tokenSpec,
  senderAccount,
}: GetPartialOpactCommandInterface): any => {
  const {
    chainId,
    networkId,
  } = getConfig() as any

  return Pact.builder
    .execution(opactTransactCode)
    .setNetworkId(networkId)
    .addData('language', 'Pact')
    .addData('name', 'transact-deposit')
    .addData('extData', {
      ...extData,
      encryptedReceipts: [''],
      tokenId: `${extData.tokenId}`,
      tokenAmount: new PactNumber(extData.tokenAmount).toPactInteger(),
      outputCommitments: extData.outputCommitments.map((item: any) => new PactNumber(item).toPactInteger())
    })
    .setMeta({
      chainId,
      ttl: 2880,
      senderAccount,
      gasLimit: 150000,
      gasPrice: 0.00001,
    })
    .addData('proof', {
      public_values: proof.public_values.map((item: any) => new PactNumber(item).toPactInteger()),
      a: {
        x: new PactNumber(proof.a.x).toPactInteger(),
        y: new PactNumber(proof.a.y).toPactInteger()
      },
      b: {
        x: proof.b.x.map((item: any) => new PactNumber(item).toPactInteger()),
        y: proof.b.y.map((item: any) => new PactNumber(item).toPactInteger())
      },
      c: {
        x: new PactNumber(proof.c.x).toPactInteger(),
        y: new PactNumber(proof.c.y).toPactInteger()
      }
    })
    .addData('token-instance', {
      refSpec: [
        {
          name: tokenSpec.refSpec.name,
          namespace:
            tokenSpec.refSpec.namespace ||
            undefined
        }
      ],
      refName: {
        name: tokenSpec.refName.name,
        namespace:
          tokenSpec.refName.namespace || undefined
      }
    })
}

export const sendSigned = async (transaction: any): Promise<any> => {
  const {
    nodeUrl,
  } = getConfig()

  const { submit, pollStatus } = createClient(nodeUrl);

  if (!isSignedTransaction(transaction)) {
    throw new Error('Transaction is not signed');
  }

  const requestKeys = await submit(transaction) as any;

  const {
    [requestKeys.requestKey]: {
      result
    }
  } = await pollStatus(requestKeys);

  if (result.status === 'failure') {
    throw new Error((result.error as any).message)
  }

  console.log('status', result)

  return result
}

export interface BaseTransactionParams {
  proof: any,
  extData: ExtDataInterface,
  tokenSpec: NamespaceInterface,
}

export const sendOZKTransaction = async (
  receiver: string,
  { proof, extData, tokenSpec }: BaseTransactionParams,
  callbackProgress: any
): Promise<any> => {
  const keyPair = genKeyPair()

  const {
    OPACT_ACCOUNT_ID,
    OPACT_GAS_PAYER_ID,
  } = getConfig()

  const token = {
    namespace: tokenSpec,
  } as KadenaTokenInterface

  const contractAddress = getContractAddress(token)

  const decimals = getDecimals(12)

  const amount = formatBigNumberWithDecimals((extData.tokenAmount as any) * -1, decimals)

  const pactCommand = getPartialOpactCommand({
      proof,
      extData,
      tokenSpec,
      senderAccount: OPACT_ACCOUNT_ID
    })
    .addSigner(keyPair.publicKey, (withCapability: any) => [
      withCapability(
        'free.opact-gas-station.GAS_PAYER',
        receiver,
        { int: '150000' },
        { decimal: '1.0' },
      ),
      withCapability(
        `${contractAddress}.TRANSFER`,
        OPACT_ACCOUNT_ID,
        OPACT_GAS_PAYER_ID,
        new PactNumber(1).toPactDecimal(),
      ),
      withCapability(
        `${contractAddress}.TRANSFER`,
        OPACT_ACCOUNT_ID,
        receiver,
        new PactNumber(amount).toPactDecimal(),
      ),
    ])
    .addKeyset('recipient-guard', 'keys-all', receiver.replace('k:', ''))

  const transaction = pactCommand.createTransaction()

  const signature = sign(transaction.cmd, keyPair);

  if (signature.sig === undefined) {
    throw new Error('Failed to sign transaction');
  }

  transaction.sigs = [{ sig: signature.sig }];

  callbackProgress('Awaiting TX results...')

  return await sendSigned(transaction)
}
