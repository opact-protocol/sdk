import { getContractAddress } from "../util";

export const getOpactCode = (): string => "(free.opact.transact (read-msg 'proof) (read-msg 'extData))";

export const getFaucetCode = (
  accountName: string,
  isRegistered = true
): string => {
  return isRegistered
    ? `(n_d8cbb935f9cd9d2399a5886bb08caed71f9bad49.coin-faucet.request-coin "${accountName}" 100.0)`
    : `(n_d8cbb935f9cd9d2399a5886bb08caed71f9bad49.coin-faucet.create-and-request-coin "${accountName}" (read-keyset "new_keyset") 100.0)`
}

export const getFaucetDevnetCode = (
  accountName: string,
  token: any,
  withFund = true
): string => {
  const contractAddress = getContractAddress(token)

  return `${withFund && `(${contractAddress}.create-account ${JSON.stringify(accountName)} (read-keyset "${accountName}"))`} (${contractAddress}.coinbase ${JSON.stringify(accountName)} (read-keyset "${accountName}") 100.0)`
}
