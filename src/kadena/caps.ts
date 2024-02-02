
import { PactNumber } from '@kadena/pactjs'
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

  // TODO: delete this
  if (contractAddress.includes('poly-fungible-v2-reference')) {
    return [
      {
        role: "Mint Token",
        description: "Capability to mint token",
        cap: {
          name: `${contractAddress}.TRANSFER`,
          args: [
            tokenSpec?.id || '',
            OPACT_ACCOUNT_ID,
            receiver,
            Number(amount)
          ]
        }
      },
      {
        role: "Coin Transfer for Gas",
        description: "Capability to transfer gas fee from signer to gas payer",
        cap: {
          name: "coin.TRANSFER",
          args: [
            accountName,
            OPACT_GAS_PAYER_ID,
            new PactNumber(amount).toPactDecimal(),
          ]
        }
      },
    ]
  }

  return [
    {
      role: "Coin Transfer",
      description: "Capability to transfer designated amount of coin from sender to receiver",
      cap: {
        name: `${contractAddress}.TRANSFER`,
        args: [
          OPACT_ACCOUNT_ID,
          receiver,
          Number(amount)
        ]
      }
    },
    {
      role: "Coin Transfer for Gas",
      description: "Capability to transfer gas fee from signer to gas payer",
      cap: {
        name: 'coin.TRANSFER',
        args: [
          accountName,
          OPACT_GAS_PAYER_ID,
          new PactNumber(1).toPactDecimal(),
        ]
      }
    },
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
      {
        role: "Mint Token",
        description: "Capability to mint token",
        cap: {
          name: `${contractAddress}.TRANSFER`,
          args: [
            tokenSpec.id,
            accountName,
            OPACT_ACCOUNT_ID,
            Number(amount)
          ]
        }
      },
    ]
  }

  return [
    {
      role: "Coin Gas",
      description: "Capability to pay Gas",
      cap: {
        name: "coin.GAS",
        args: [
          //
        ]
      }
    },
    {
      role: "Coin Transfer",
      description: "Capability to transfer designated amount of coin from sender to receiver",
      cap: {
        name: `${contractAddress}.TRANSFER`,
        args: [
          accountName,
          OPACT_ACCOUNT_ID,
          Number(amount)
        ]
      }
    },
  ]
}
