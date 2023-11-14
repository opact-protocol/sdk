import localforage from 'localforage';

const defaultKey = 'ozk:wallet'

export const useWalletStorage = ({
  key = defaultKey
}: {
  key?: string
}) => {
  const get = async (): Promise<string | Buffer | null>  => {
    return localforage.getItem(key);
  }

  const exists = async (): Promise<boolean> => {
    return (await localforage.getItem(key)) != null
  }

  const clear = async (): Promise<string | Buffer | null> => {
    return await localforage.setItem(key, '');
  }

  const store = async (item: string | Uint8Array) => {
    return await localforage.setItem(key, item);
  }

  return {
    get,
    clear,
    store,
    exists,
  }
}
