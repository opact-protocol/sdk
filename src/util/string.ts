const isPrefixedK = (str: string): boolean => str.startsWith('K:');

const isPrefixedOZK = (str: string): boolean => str.startsWith('OZK');

export const stripK = (str: string): string => (isPrefixedK(str) ? str.slice(2) : str);

export const stripOZK = (str: string): string => (isPrefixedOZK(str) ? str.slice(3) : str);

export const isPrefixed0x = (str: string): boolean => str.startsWith('0x');

export const strip0x = (str: string): string => (isPrefixed0x(str) ? str.slice(2) : str);

export const stringifyUtxo = (utxo: any) => {
  let value = utxo

  if (typeof utxo !== 'string') {
    value = JSON.stringify(utxo, (_, value) => {
      return typeof value === 'bigint' ? value.toString() : value;
    })
  }

  return value
}

export const parseUtxoString = (utxo: string) => {
  const {
    id,
    hash,
    token,
    amount,
    pubkey,
    address,
    receipt,
    blinding,
  } = JSON.parse(utxo)

  return {
    id,
    receipt,
    address,
    hash: BigInt(hash),
    token: BigInt(token),
    amount: BigInt(amount),
    pubkey: BigInt(pubkey),
    blinding: BigInt(blinding),
  }
}

export const base64urlToBigInt = (base64url: string) => {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
  const padding = '='.repeat((4 - base64.length % 4) % 4)
  base64 += padding

  const bytes = atob(base64)

  let bigint = BigInt(0)
  for (let i = 0; i < bytes.length; i++) {
    bigint = (bigint << BigInt(8)) + BigInt(bytes.charCodeAt(i))
  }

  return bigint
}

export const hexToUint8Array = (hexString: string) => {
  if (hexString.length % 2 !== 0) {
    hexString = `0${hexString}`;
  }

  const bytes = new Uint8Array(hexString.length / 2);

  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hexString.substr(i * 2, 2), 16);
  }

  return bytes;
}

