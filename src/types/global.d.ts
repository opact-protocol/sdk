declare type Optional<T> = T | undefined;

declare module 'optimisedmt' {
  export function OptimisedMT(): any
}

declare module 'circomlibjs' {
  export function poseidon(inputs: bigint[]): bigint;
  export const babyjub: any
}

declare type Artifact = {
  zkey: ArrayLike<number>;
  wasm: Optional<ArrayLike<number>>;
  dat: Optional<ArrayLike<number>>;
  vkey: object;
};

declare module 'snarkjs';
