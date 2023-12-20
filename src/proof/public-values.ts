import { groth16 } from 'snarkjs'

export type ProofValues = string

export interface PublicArgsInterface {
  public_values: string[],
  a: {
    x: ProofValues,
    y: ProofValues
  },
  b: {
    x: ProofValues[],
    y: ProofValues[]
  },
  c: {
    x: ProofValues,
    y: ProofValues
  }
}

export const getPublicArgs = (
  proof: any,
  publicSignals: string[]
): PublicArgsInterface => {
  return {
    public_values: publicSignals,
    a: {
      x: proof.pi_a[0],
      y: proof.pi_a[1]
    },
    b: {
      x: proof.pi_b[0],
      y: proof.pi_b[1]
    },
    c: {
      x: proof.pi_c[0],
      y: proof.pi_c[1]
    }
  }
}

export const getPublicArgsToEVM = (
  proof: any,
  publicSignals: string[]
): string[] => {
  const stringPublicArgs = groth16.exportSolidityCallData(proof, publicSignals) as string

  const [
    a,
    b,
    c,
    public_values
  ] = JSON.parse(`[${stringPublicArgs}]`)

  return [
    public_values,
    a,
    b,
    c,
  ]
}
