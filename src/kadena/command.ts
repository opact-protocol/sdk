import { getConfig } from "../constants"

export interface SigningCmdInterface {
  caps: any[]
  nonce?: string
  sender: string
  envData?: object
  pactCode: string
  gasLimit?: number
  chainId?: string
  chaindId?: string
  gasPrice?: string
  networkId?: string
  signingPubKey?: string
  signingPubkey?: string
}

/**
 * A signingCmd Object to send to signing API
 * */
export const getSigningCmd = (cmdData: SigningCmdInterface) => {
  const {
    chainId,
    networkId,
  } = getConfig()

  return {
    chainId,
    networkId,
    ...cmdData,
  }
}

export interface ExecCmdInterface {
  keyPairs: any[]
  pactCode: string
  envData: object
  meta: object
}

/**
 * Prepare an ExecMsg pact command for use in send or local execution.
 * To use in send, wrap result with 'mkSingleCommand'.
 */
export const getExecCmd = (execCmdData: ExecCmdInterface) => {
  const {
    networkId,
  } = getConfig()

  return {
    networkId,
    ...execCmdData,
  }
}
