// import { buildPoseidon } from "circomlibjs";
import { poseidon } from "circomlibjs";

type IntoBigInt = string | number | bigint | boolean;

export class PoseidonClass {
  // eslint-disable-next-line class-methods-use-this
  async load() {
    // const poseidon = await buildPoseidon();

    return {
      hash: (left: IntoBigInt, right: IntoBigInt): bigint => {
        return poseidon([BigInt(left as any), BigInt(right as any)]);
      },
      singleHash: (single: IntoBigInt): bigint => {
        return poseidon([BigInt(single as any)]);
      },
    };
  }
}
