import { poseidon } from "circomlibjs";

type IntoBigInt = string | number | bigint | boolean;

export const treeHash = (left: IntoBigInt, right: IntoBigInt): any =>
  poseidon([BigInt(left), BigInt(right)]);

export const treeSingleHash = (single: IntoBigInt): any =>
  poseidon([BigInt(single)]);
