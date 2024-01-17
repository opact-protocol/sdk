import { decrypt as _decrypt } from '@metamask/eth-sig-util';
import { decode } from 'js-base64';
import { parseUtxoString, strip0x } from '../util';

export interface DecryptInterface {
  privateKey: string;
  encrypted: string;
  isUtxo?: boolean
}

export const decrypt = ({ encrypted, privateKey, isUtxo = true }: DecryptInterface) => {
  const decodedEncrypted = decode(encrypted)

  const encryptedData = JSON.parse(decodedEncrypted)

  const decrypted = _decrypt({
    encryptedData,
    privateKey: strip0x(privateKey),
  })

  if (isUtxo) {
    return parseUtxoString(decrypted)
  }

  return JSON.parse(decrypted)
}
