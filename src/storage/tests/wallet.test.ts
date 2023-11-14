import { assert } from 'chai';
import { useWalletStorage } from '../wallet';
import 'mock-local-storage'
import { getRandomWallet } from '../../keys';

describe('Wallet Storage Test', () => {
  it('Test Wallet Storage Service ', async () => {
    const {
      get,
      store,
      exists,
    } = useWalletStorage({})

    let hasCache = await exists()

    assert(!hasCache)

    const wallet = getRandomWallet()

    await store(wallet.mnemonic)

    hasCache = await exists()

    assert(hasCache)

    const stored = await get()

    assert(stored, wallet.mnemonic)
  });
});
