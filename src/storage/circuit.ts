import localforage from 'localforage';

const defaultKey = 'ozk:artifact'

export const useCircuitStorage = ({
  key = defaultKey
}: {
  key?: string
}) => {
  const get = async (): Promise<string | Buffer | null> => {
    return localforage.getItem(key);
  }

  const store = async (item: string | Uint8Array): Promise<any> => {
    return await localforage.setItem(key, item);
  }

  const exists = async (path: string): Promise<boolean> => {
    return (await localforage.getItem(path)) != null
  }

  return {
    get,
    store,
    exists,
  }
}
