import { encode } from 'js-base64';
import * as naclUtil from 'tweetnacl-util';
import { encrypt as _encrypt } from '@metamask/eth-sig-util';
import { hexToUint8Array, stringifyUtxo, strip0x } from '../util';
import { separateHex } from '../util/hex';

export interface EncryptInterface {
  data: unknown;
  address: string;
  isUtxo?: boolean
}

export const encrypt = ({ data, address, isUtxo = true }: EncryptInterface) => {
  const {
    encryptionPubkey
  } = separateHex(address)

  const addressUint8 = hexToUint8Array(strip0x(encryptionPubkey));

  const publicKey = naclUtil.encodeBase64(addressUint8);

  let dataString = stringifyUtxo(data)

  if (isUtxo) {
    dataString = stringifyUtxo(data)
  } else {
    dataString = JSON.stringify(data)
  }

  const encrypted = _encrypt({
    publicKey,
    data: dataString,
    version: 'x25519-xsalsa20-poly1305',
  })

  return encode(JSON.stringify(encrypted))
}
