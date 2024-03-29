import { getUtxo } from "../utxo";
import { formatInteger, isValidNullifierCount } from "../util";
import { KadenaTokenInterface } from "../constants";
import { ReceiptInterface } from "../receipts";

const base = 21888242871839275222246405745257275088548364400416034343698204186575808495617n

export interface GetUTXOIDPositionInterface {
  txid: string,
  position: string
}

const getUTXOIDPosition = ({ txid, position}: GetUTXOIDPositionInterface): string => {
  return `${txid}-${position}`;
};

export const filterZeroUTXOs = (utxos: any[]): any[] => {
  return utxos.filter((utxo) => utxo.amount !== 0n);
};

export const calculateTotalSpend = (utxos: any[]): bigint => {
  return utxos.reduce((left, right) => left as bigint + BigInt(right.amount), BigInt(0));
}

export interface GetDeltaInterface {
  utxosIn: any[],
  utxosOut: any[]
}

export const getDelta = async ({ utxosIn, utxosOut }: GetDeltaInterface) => {
  const totalIn = calculateTotalSpend(utxosIn)

  const totalOut = calculateTotalSpend(utxosOut)

  const rawAmount = totalOut - totalIn

  return rawAmount < 0n ? base + rawAmount : rawAmount
}

export interface GetSolutionOutsInterface {
  utxosIn: any[],
  senderPubkey: string,
  receipts?: ReceiptInterface[],
  isDeposit?: boolean,
  receiverPubkey?: string,
  selectedToken: KadenaTokenInterface,
  totalRequired: string | number | bigint,
}

export const getSolutionOuts = async ({
  utxosIn,
  senderPubkey,
  totalRequired,
  selectedToken,
  receiverPubkey,
  isDeposit = false,
  receipts = []
}: GetSolutionOutsInterface): Promise<any> => {
  if (typeof totalRequired !== 'bigint') {
    totalRequired = BigInt(formatInteger(totalRequired, 12))
  }

  const totalSpend = calculateTotalSpend(utxosIn)

  const amount = isDeposit
    ? totalRequired
    : totalSpend - totalRequired

  return [
    getUtxo({
      amount,
      id: selectedToken.id,
      pubkey: senderPubkey,
      token: selectedToken.hash,
      address: selectedToken.address,
      receipt: receipts[0]
    }),
    receiverPubkey
      ? getUtxo({
          id: selectedToken.id,
          amount: totalRequired,
          pubkey: receiverPubkey,
          token: selectedToken.hash,
          address: selectedToken.address,
          receipt: receipts[1]
        })
      : getUtxo({
        amount: 0,
        id: selectedToken.id,
        pubkey: senderPubkey,
        token: selectedToken.hash,
        address: selectedToken.address,
      })
  ]
}

const sortUTXOsByAscendingValue = (utxos: any[]): void => {
  utxos.sort((left, right) => {
    const leftNum = left.amount;

    const rightNum = right.amount;

    if (leftNum < rightNum) {
      return -1
    }

    if (leftNum > rightNum) {
      return 1
    }

    return 0;
  });
};

export const findSubsetsWithSum = (arr: any, target: bigint): any => {
  const result: any = [];
  const max = 1 << arr.length;

  for (let i = 1; i < max; i++) {
    let sum = 0n;
    const subset = [];

    for (let j = 0; j < arr.length; j++) {
      if (i & (1 << j)) {
        sum += BigInt(arr[j].amount);
        subset.push(arr[j]);
      }
    }

    if (sum >= target) {
      result.push(subset);
    }
  }

  return result;
}

export interface GetSolutionBatchForNFTInterface {
  pubkey: string
  treeBalance: any
}

export const getSolutionBatchForNFT = async ({
  pubkey,
  treeBalance,
}: GetSolutionBatchForNFTInterface) => {
  const nft = treeBalance.utxos.find((utxo: any) => utxo.token === treeBalance.token);

  if (!nft) {
    throw new Error('No NFT found');
  }

  return [nft, getUtxo({ token: treeBalance.token, pubkey }), getUtxo({ token: treeBalance.token, pubkey })]
}

export interface GetSolutionBatchInterface {
  pubkey: string,
  treeBalance: any,
  excludedUTXOIDPositions: string[],
  totalRequired: string | number | bigint,
}

export const getSolutionBatch = async ({
  pubkey,
  treeBalance,
  totalRequired,
  excludedUTXOIDPositions = [],
}: GetSolutionBatchInterface): Promise<any> => {
  if (typeof totalRequired !== 'bigint') {
    totalRequired = BigInt(formatInteger(totalRequired, 12))
  }

  const removedZeroUTXOs = filterZeroUTXOs(treeBalance.utxos);

  const filteredUTXOs = removedZeroUTXOs.filter(
    (utxo) => !excludedUTXOIDPositions.includes(getUTXOIDPosition(utxo)),
  );

  if (!filteredUTXOs.length) {
    return undefined;
  }

  // Use exact match if it exists.
  // TODO: Use exact matches from any tree, not just the first tree examined.
  const exactMatch = filteredUTXOs.find((utxo) => BigInt(utxo.amount) >= (totalRequired as bigint));

  if (exactMatch) {
    return [exactMatch, getUtxo({
      pubkey,
      token: treeBalance.token,
     }),
     getUtxo({
      pubkey,
      token: treeBalance.token,
    })]
  }

  // Sort UTXOs by smallest size
  sortUTXOsByAscendingValue(filteredUTXOs);

  // TODO: CHECK IF HAS SUM OF UTXOS BY CIRCUIT
  return findSubsetsWithSum(removedZeroUTXOs, totalRequired).find((batch: any) => isValidNullifierCount(batch.length));
}
