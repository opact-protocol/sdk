export const VALID_INPUT_COUNTS = [3];

export const MAX_INPUTS = Math.max(...VALID_INPUT_COUNTS);

export const isValidNullifierCount = (utxoCount: any): boolean =>
  VALID_INPUT_COUNTS.includes(utxoCount);
