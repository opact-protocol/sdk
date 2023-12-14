import { assert, expect } from 'chai';
import 'mock-local-storage'
import { useStateStorage } from '../state';
import { getUtxo } from '../../utxo';

const token = 832719810210204902983213847411017819246076070166n

const baseUtxos = [0n, 30n, 40n, 50n, 10n, 20n, 10n, 20n, 0n]

const utxos = [
  ...baseUtxos.map((amount) => getUtxo({ amount, token, pubkey: 0n }))
].map(({ hash }: any) => hash.toString())

describe('State Storage Test', () => {
  it('Test State Storage Service ', async () => {
    const {
      get,
      store,
      clear,
      exists,
    } = useStateStorage({})

    let isCached = await exists('ozk:state:utxos:kadena:opact')

    assert(!isCached)

    await store({
      encryptedUtxos: utxos
    })

    isCached = await exists('ozk:state:utxos:kadena:opact')

    assert(isCached)

    isCached = await exists('ozk:state:indexOf:kadena:opact')

    assert(!isCached)

    const indexOf = 12

    await store({
      indexOf
    })

    isCached = await exists('ozk:state:indexOf:kadena:opact')

    assert(isCached)

    let cached = await get()

    expect(cached.encryptedUtxos).to.deep.equal(utxos);

    await clear()

    cached = await get()

    expect(0).to.equal(cached.encryptedUtxos.length)
  });
});
