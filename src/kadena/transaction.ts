import { genKeyPair, sign } from '@kadena/cryptography-utils';
import { KadenaTokenInterface, NamespaceInterface, getConfig } from '../constants'
import { stripK } from '../util';
import { ExtDataInterface, getPartialFaucetCommand, getPartialOpactCommand } from './command';
import { sendSigned } from './send';
import { getCapsForDeposit, getCapsForWithdraw } from './caps';

export interface GetKdaTransactionParamsInterface {
  batch: any,
  amount: string | number,
  sender: string,
  receiver?: string,
  selectedToken: KadenaTokenInterface,
  encryptedUtxos: string[],
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

export interface OpactTransactionInterface {
  proof: any;
  signer: string;
  receiver?: string;
  senderAccount: string;
  extData: ExtDataInterface;
  tokenSpec: NamespaceInterface;
  isWithdrawTransfer?: boolean;
}

export const getOpactTransaction = async ({
  proof,
  signer,
  extData,
  receiver,
  tokenSpec,
  senderAccount,
  isWithdrawTransfer = false,
}: OpactTransactionInterface) => {
  let caps: any

  if (isWithdrawTransfer && receiver) {
    caps = getCapsForWithdraw(
      senderAccount,
      extData.tokenAmount as number,
      receiver,
      tokenSpec
    )
  } else {
    caps = getCapsForDeposit(
      senderAccount,
      extData.tokenAmount,
      tokenSpec
    )
  }

  const pactCommand = getPartialOpactCommand({
    proof,
    extData,
    tokenSpec,
    senderAccount
  })
  .addSigner(signer, () => [
    ...caps.map(({ cap }: any) => cap)
  ])
  .addKeyset('recipient-guard', 'keys-all', receiver ? stripK(receiver) : signer)

  return pactCommand.createTransaction()
}

export interface SendInternalTransactionInterface {
  proof: any;
  receiver: string;
  extData: ExtDataInterface;
  tokenSpec: NamespaceInterface;
  callbackProgress: (message: string) => void;
}

export const sendInternalTransaction = async ({
  proof,
  receiver,
  extData,
  tokenSpec,
  callbackProgress = (message: string) => {}
}: SendInternalTransactionInterface) => {
  const keyPair = genKeyPair()

  const {
    OPACT_ACCOUNT_ID,
  } = getConfig()

  const transaction = await getOpactTransaction({
    proof,
    extData,
    receiver,
    tokenSpec,
    isWithdrawTransfer: true,
    signer: keyPair.publicKey,
    senderAccount: OPACT_ACCOUNT_ID,
  })

  const signature = sign(transaction.cmd, keyPair);

  if (signature.sig === undefined) {
    throw new Error('Failed to sign transaction');
  }

  transaction.sigs = [{ sig: signature.sig }];

  callbackProgress('Awaiting TX results...')

  return await sendSigned(transaction)
}

export const sendFaucetTransaction = async (receiver: string) => {
  const keyPair = genKeyPair()

  const caps = [
    {
      name: "n_d8cbb935f9cd9d2399a5886bb08caed71f9bad49.coin-faucet.GAS_PAYER",
      args: [
      receiver,
        {
          int:1
        },
        {
          decimal: "1.0"
        }
      ]
    },
    {
      name: "coin.TRANSFER",
      args:[
        "c:Ecwy85aCW3eogZUnIQxknH8tG8uXHM5QiC__jeI0nWA",
        receiver,
        {
          decimal:"100.0"
        }
      ]
    }
  ]

  const transaction = (await getPartialFaucetCommand(receiver))
    .addSigner(keyPair.publicKey, () => [
      ...caps
    ])
    .createTransaction()

  const signature = sign(transaction.cmd, keyPair);

  if (signature.sig === undefined) {
    throw new Error('Failed to sign transaction');
  }

  transaction.sigs = [{ sig: signature.sig }];

  return await sendSigned(transaction)
}

// export interface GetPartialOpactCommandInterface {
//   proof: any,
//   senderAccount: string,
//   extData: ExtDataInterface,
//   tokenSpec: NamespaceInterface,
// }

// export interface BaseTransactionParams {
//   proof: any,
//   extData: ExtDataInterface,
//   tokenSpec: NamespaceInterface,
// }

// export const sendOZKTransaction = async (
//   receiver: string,
//   { proof, extData, tokenSpec }: BaseTransactionParams,
//   callbackProgress: any
// ): Promise<any> => {
//   const keyPair = genKeyPair()

//   const {
//     OPACT_ACCOUNT_ID,
//     OPACT_GAS_PAYER_ID,
//   } = getConfig()

//   const token = {
//     namespace: tokenSpec,
//   } as KadenaTokenInterface

//   const contractAddress = getContractAddress(token)

//   const decimals = getDecimals(12)

//   const amount = formatBigNumberWithDecimals((extData.tokenAmount as any) * -1, decimals)

//   const pactCommand = getPartialOpactCommand({
//       proof,
//       extData,
//       tokenSpec,
//       senderAccount: OPACT_ACCOUNT_ID
//     })
//     .addSigner(keyPair.publicKey, (withCapability: any) => [
//       withCapability(
//         'free.opact-gas-station.GAS_PAYER',
//         receiver,
//         { int: '150000' },
//         { decimal: '1.0' },
//       ),
//       withCapability(
//         `${contractAddress}.TRANSFER`,
//         OPACT_ACCOUNT_ID,
//         OPACT_GAS_PAYER_ID,
//         new PactNumber(1).toPactDecimal(),
//       ),
//       withCapability(
//         `${contractAddress}.TRANSFER`,
//         OPACT_ACCOUNT_ID,
//         receiver,
//         new PactNumber(amount).toPactDecimal(),
//       ),
//     ])
//     .addKeyset('recipient-guard', 'keys-all', receiver.replace('k:', ''))

//   const transaction = pactCommand.createTransaction()

//   const signature = sign(transaction.cmd, keyPair);

//   if (signature.sig === undefined) {
//     throw new Error('Failed to sign transaction');
//   }

//   transaction.sigs = [{ sig: signature.sig }];

//   callbackProgress('Awaiting TX results...')

//   return await sendSigned(transaction)
// }
