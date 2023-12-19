import axios from 'axios';
import { useCircuitStorage } from '../storage/circuit';

export const loadArtifact = async (): Promise<any> => {
  const path = '/transaction_0001.zkey';

  const {
    store,
    exists,
  } = useCircuitStorage({ key: path })

  const url = new URL(path, window.location.origin).toString()

  if (await exists(path)) {
    return path;
  }

  try {
    let result

    try {
      result = await axios.get(url, {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache', 'Expires': '0' },
        responseType: 'arraybuffer',
      });
    } catch (e) {
      try {
        result = await axios.get(path, {
          method: 'GET',
          responseType: 'arraybuffer',
        });
      } catch(e) {
        window.location.reload()
        // throw new Error(e.message)
        console.warn(e)
      }
    }

    const data: ArrayBuffer = result?.data || [];

    await store(
      new Uint8Array(data),
    );

    return path;
  } catch (err: any) {
    console.warn(err)
  }

  return null
}
