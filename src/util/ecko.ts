import { getConfig } from "../constants"

declare global {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Window {
    kadena?: {
    isKadena: boolean;
    request<T>(args: unknown): Promise<T>;
    };
  }
}

export const isInstalled = (): boolean => {
  const { kadena } = window as any

  return Boolean(kadena && kadena.isKadena && kadena.request)
}

export const isCorrectNetwork = async (): Promise<boolean> => {
  if (!isInstalled()) {
    return false
  }

  const { networkId } = getConfig()

  const checkStatusResponse =
    await window.kadena?.request({
      method: 'kda_checkStatus',
      networkId
    }) as any

  return checkStatusResponse?.status === 'success' ||
    checkStatusResponse.message === 'Not connected'
}

export const isConnected = async (): Promise<boolean> => {
  if (!isInstalled()) {
    return false
  }

  const { networkId } = getConfig()

  const checkStatusResponse =
    await window.kadena?.request({
      method: 'kda_checkStatus',
      networkId
    }) as any

  return checkStatusResponse?.status === 'success'
}

export const pactCommandToSigningRequest = (
  parsedTransaction: any
): any => {
  return {
    code: parsedTransaction.payload.exec.code ?? '',
    envData: parsedTransaction.payload.exec.data as { [key: string]: unknown },
    caps: parsedTransaction.signers.flatMap((signer: any) => {
      if (signer.clist === undefined) {
        return []
      }
      return signer.clist.map(({ name, args }: any) => {
        const nameArr = name.split('.')

        return {
          role: nameArr[nameArr.length - 1],
          description: `Description for ${name}`,
          cap: {
            name,
            args
          }
        }
      })
    }),
    nonce: parsedTransaction.nonce,
    chainId: parsedTransaction.meta.chainId,
    gasLimit: parsedTransaction.meta.gasLimit,
    gasPrice: parsedTransaction.meta.gasPrice,
    sender: parsedTransaction.meta.sender,
    ttl: parsedTransaction.meta.ttl
  }
}
