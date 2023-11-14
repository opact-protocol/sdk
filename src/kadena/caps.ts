
import Pact from 'pact-lang-api'
import { getConfig } from '../constants'

export const getCapsForWithdraw = (
  accountName: string,
  amount: any,
  preffix = 'coin',
  receiver: any,
  tokenSpec: any
) => {
  const {
    OPACT_CONTRACT_ID,
    OPACT_GAS_PAYER_ID
  } = getConfig()

  if (preffix.includes('poly-fungible-v2-reference')) {
    return [
      Pact.lang.mkCap(
        'Mint Token',
        'Capability to mint token',
        `${preffix}.TRANSFER`,
        [
          tokenSpec?.id || '',
          OPACT_CONTRACT_ID,
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
      `${preffix}.TRANSFER`,
      [
        OPACT_CONTRACT_ID,
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
  preffix = 'coin',
  tokenSpec = { id: '' }
) => {
  const {
    OPACT_CONTRACT_ID,
  } = getConfig()

  if (preffix.includes('poly-fungible-v2-reference')) {
    return [
      Pact.lang.mkCap(
        'Mint Token',
        'Capability to mint token',
        `${preffix}.TRANSFER`,
        [
          tokenSpec.id,
          accountName,
          OPACT_CONTRACT_ID,
          Number(Number(amount).toFixed(1))
        ]
      )
    ]
  }

  return [
    Pact.lang.mkCap(
      'Coin Transfer',
      'Capability to transfer designated amount of coin from sender to receiver',
      `${preffix}.TRANSFER`,
      [
        accountName,
        OPACT_CONTRACT_ID,
        Number(Number(amount).toFixed(1))
      ]
    )
  ]
}
