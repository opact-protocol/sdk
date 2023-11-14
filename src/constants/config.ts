let ENV: string | undefined = '';

export function getConfig(
  env: string | undefined = ENV || process.env.OPACT_SDK_NETWORK
) {
  ENV = env;
  switch (env) {
    case 'kadena-mainnet':
      return {
        symbol: 'KDA',
        name: 'Kadena',
        networkId: 'testnet04',
        key: 'kadena-mainnet',
        website: 'https://kadena.io/',
        OPACT_CONTRACT_ID: 'opact-contract',
        OPACT_GAS_PAYER_ID: 'opact-gas-payer',
        explorerUrl: 'https://testnet.nearblocks.io',
        nodeUrl: 'https://kb96ugwxhi.execute-api.us-east-2.amazonaws.com',
        indexerUrl: 'https://bpsd19dro1.execute-api.us-east-2.amazonaws.com',
      };
    case 'kadena-testnet':
      return {
        symbol: 'KDA',
        name: 'Kadena',
        key: 'kadena-testnet',
        networkId: 'testnet04',
        website: 'https://kadena.io/',
        OPACT_CONTRACT_ID: 'opact-contract',
        OPACT_GAS_PAYER_ID: 'opact-gas-payer',
        explorerUrl: 'https://testnet.nearblocks.io',
        nodeUrl: 'https://kb96ugwxhi.execute-api.us-east-2.amazonaws.com',
        indexerUrl: 'https://bpsd19dro1.execute-api.us-east-2.amazonaws.com',
      };
    case 'kadena-devnet':
      return {
        symbol: 'KDA',
        name: 'Kadena',
        key: 'kadena-devnet',
        networkId: 'devnet',
        website: 'https://kadena.io/',
        OPACT_CONTRACT_ID: 'opact-contract',
        OPACT_GAS_PAYER_ID: 'opact-gas-payer',
        explorerUrl: 'https://testnet.nearblocks.io',
        nodeUrl: 'https://kb96ugwxhi.execute-api.us-east-2.amazonaws.com',
        indexerUrl: 'https://bpsd19dro1.execute-api.us-east-2.amazonaws.com',
      };
    default:
      return {
        symbol: 'KDA',
        name: 'Kadena',
        networkId: 'devnet',
        key: 'kadena-devnet',
        website: 'https://kadena.io/',
        OPACT_CONTRACT_ID: 'opact-contract',
        OPACT_GAS_PAYER_ID: 'opact-gas-payer',
        explorerUrl: 'https://testnet.nearblocks.io',
        nodeUrl: 'https://kb96ugwxhi.execute-api.us-east-2.amazonaws.com',
        indexerUrl: 'https://bpsd19dro1.execute-api.us-east-2.amazonaws.com',
      };
  }
}

export const config = getConfig();
