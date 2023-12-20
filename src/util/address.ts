import { KadenaTokenInterface } from "../constants"

// shorten the checksummed version of the input address to have 4 characters at start and end
export function shortenAddress (
  address: string,
  chars = 4
): string {
  return `${address.slice(0, chars)}...${address.slice(
    -chars
  )}`
}

export const getContractAddress = ({ namespace }: KadenaTokenInterface) => {
  const core = [
    namespace.refName.namespace,
    namespace.refName.name
  ].filter(item => !!item)

  return core.join('.')
}
