import { groth16 } from 'snarkjs'

export const getPublicArgs = (
  proof: any,
  publicSignals: string[]
): any => {
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
) => {
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
