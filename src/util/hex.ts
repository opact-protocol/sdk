export const combineHex = ({
  derivedKeys,
  encryptionPubkey,
}: {
  derivedKeys: any;
  encryptionPubkey: string;
}): string => {
  const {
    pubkey
  } = derivedKeys

  const encryptionPubkeyBigInt = BigInt(encryptionPubkey)

  const combined = (encryptionPubkeyBigInt << 256n) | pubkey;

  return `OZK${combined.toString(16)}`
}

export const separateHex = (combined: string) => {
  if (!combined) {
    return {
      babyjubPubkey: '',
      encryptionPubkey: '',
    }
  }

  const address = combined.replace('OZK', '0x')

  const combinedBigInt = BigInt(address);

  const encryptionPubkeyBigInt = combinedBigInt >> 256n;
  const babyjubPubkeyBigInt = combinedBigInt & ((1n << 256n) - 1n);

  const babyjubPubkey = `0x${babyjubPubkeyBigInt.toString(16)}`;
  const encryptionPubkey = `0x${encryptionPubkeyBigInt.toString(16)}`;

  return { encryptionPubkey, babyjubPubkey };
}
