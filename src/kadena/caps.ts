
import Pact from 'pact-lang-api'
import { getConfig } from '../constants'
import { getContractAddress } from '../util'

export const getCapsForWithdraw = (
  accountName: string,
  amount: any,
  receiver: any,
  tokenSpec: any
) => {
  const {
    OPACT_ACCOUNT_ID,
    OPACT_GAS_PAYER_ID
  } = getConfig()

  const contractAddress = getContractAddress({ namespace: tokenSpec })

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
          Number((amount * -1).toFixed(1))
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
        Number((amount * -1).toFixed(1))
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
  amount: number | string,
  tokenSpec = { id: '' }
) => {
  const {
    OPACT_ACCOUNT_ID,
  } = getConfig()

  const contractAddress = getContractAddress({ namespace: tokenSpec })

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
          Number(Number(amount).toFixed(1))
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
        accountName,
        OPACT_ACCOUNT_ID,
        Number(Number(amount).toFixed(1))
      ]
    )
  ]
}

export const getCapsForTransfer = ({
  token,
  amount,
  receiver,
}: any) => {
  const {
    OPACT_CONTRACT_ID,
    OPACT_GAS_PAYER_ID,
  } = getConfig()

  const contractAddress = getContractAddress(token)

  return [
    Pact.lang.mkCap(
      'Coin Transfer',
      'Capability to transfer designated amount of coin from sender to receiver',
      `${contractAddress}.TRANSFER`,
      [
        OPACT_CONTRACT_ID,
        receiver,
        Number((amount * -1).toFixed(1))
      ]
    ),

    Pact.lang.mkCap(
      'Coin Transfer for Gas',
      'Capability to transfer gas fee from sender to gas payer',
      `${contractAddress}.TRANSFER`,
      [OPACT_CONTRACT_ID, OPACT_GAS_PAYER_ID, 1.0]
    ),

    {
      cap:
      {
        name: `${OPACT_GAS_PAYER_ID}.GAS_PAYER`,
        args: [1.0]
      }
    }
  ]
}
