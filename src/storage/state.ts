import localforage from 'localforage'
import { getKeysByChainId } from './utils'

const defaultKey = 'ozk:state'

export const useStateStorage = ({
  key = defaultKey,
}: {
  key?: string,
}) => {
  const {
    utxosKey,
    indexOfKey,
  } = getKeysByChainId({ key })

  const get = async () => {
    const encryptedUtxos = await localforage.getItem(utxosKey) as any || []

    const indexOf = await localforage.getItem(indexOfKey) || 725

    return {
      indexOf,
      encryptedUtxos,
    }
  }

  const store = async ({
    indexOf,
    encryptedUtxos,
  }: any) => {
    if (encryptedUtxos) {
      await localforage.setItem(utxosKey, encryptedUtxos)
    }

    if (indexOf) {
      await localforage.setItem(indexOfKey, indexOf)
    }
  }

  const clear = async () => {
    await localforage.setItem(utxosKey, [])
    await localforage.setItem(indexOfKey, 725)
  }

  const exists = async (itemKey: string): Promise<boolean> => {
    return (await localforage.getItem(itemKey)) != null
  }

  return { store, clear, get, exists }
}
