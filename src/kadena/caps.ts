
import Pact from 'pact-lang-api'
import { KadenaTokenInterface, NamespaceInterface, getConfig } from '../constants'
import { formatBigNumberWithDecimals, getContractAddress, getDecimals } from '../util'

export const getCapsForWithdraw = (
  accountName: string,
  integer: number,
  receiver: string,
  tokenSpec: NamespaceInterface
) => {
  const {
    OPACT_ACCOUNT_ID,
    OPACT_GAS_PAYER_ID
  } = getConfig()

  const decimals = getDecimals(12)

  const amount = formatBigNumberWithDecimals(integer * -1, decimals)

  const contractAddress = getContractAddress({ namespace: tokenSpec } as KadenaTokenInterface)

  if (contractAddress.includes('poly-fungible-v2-reference')) {
    return [
      Pact.lang.mkCap(
        'Mint Token',
        'Capability to mint token',
        `${contractAddress}.TRANSFER`,
        [
          tokenSpec?.id || '',
          OPACT_ACCOUNT_ID,
          receiver,
          Number((amount))
        ]
      ),
      Pact.lang.mkCap(
        'Coin Transfer for Gas',
        'Capability to transfer gas fee from signer to gas payer',
        'coin.TRANSFER',
        [
          accountName,
          OPACT_GAS_PAYER_ID,
          Number((1).toFixed(1))
        ]
      )
    ]
  }

  return [
    Pact.lang.mkCap(
      'Coin Transfer',
      'Capability to transfer designated amount of coin from sender to receiver',
      `${contractAddress}.TRANSFER`,
      [
        OPACT_ACCOUNT_ID,
        receiver,
        Number((amount))
      ]
    ),
    Pact.lang.mkCap(
      'Coin Transfer for Gas',
      'Capability to transfer gas fee from signer to gas payer',
      'coin.TRANSFER',
      [
        accountName,
        OPACT_GAS_PAYER_ID,
        Number((1).toFixed(1))
      ]
    )
  ]
}

export const getCapsForDeposit = (
  accountName: string,
  integer: number | string,
  tokenSpec: NamespaceInterface
) => {
  const {
    OPACT_ACCOUNT_ID,
  } = getConfig()

  const decimals = getDecimals(12)

  const amount = formatBigNumberWithDecimals(integer, decimals)

  const contractAddress = getContractAddress({ namespace: tokenSpec } as KadenaTokenInterface)

  if (contractAddress.includes('poly-fungible-v2-reference')) {
    return [
      Pact.lang.mkCap(
        'Mint Token',
        'Capability to mint token',
        `${contractAddress}.TRANSFER`,
        [
          tokenSpec.id,
          accountName,
          OPACT_ACCOUNT_ID,
          Number(amount)
        ]
      )
    ]
  }

  return [
    Pact.lang.mkCap(
      'Coin Gas',
      'Capability to pay Gas',
      'coin.GAS',
      []
    ),
    Pact.lang.mkCap(
      'Coin Transfer',
      'Capability to transfer designated amount of coin from sender to receiver',
      `${contractAddress}.TRANSFER`,
      [
        accountName,
        OPACT_ACCOUNT_ID,
        Number(amount)
      ]
    )
  ]
}
