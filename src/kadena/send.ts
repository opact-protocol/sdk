
import { createClient, isSignedTransaction } from '@kadena/client';
import { getConfig } from '../constants';

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

  return result
}
