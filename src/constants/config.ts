let ENV: string | undefined = '';

export function getConfig(
  env: string | undefined = ENV || process.env.OPACT_SDK_NETWORK
) {
  ENV = env;
  switch (env) {
    case 'kadena-mainnet':
      return {
        chainId: '1',
        symbol: 'KDA',
        name: 'Kadena',
        networkId: 'mainnet01',
        key: 'kadena:mainnet',
        website: 'https://kadena.io/',
        OPACT_CONTRACT_ID: 'opact',
        OPACT_GAS_PAYER_ID: 'opact-gas-payer',
        explorerUrl: 'https://testnet.nearblocks.io',
        nodeUrl: 'https://kb96ugwxhi.execute-api.us-east-2.amazonaws.com',
        indexerUrl: 'https://bpsd19dro1.execute-api.us-east-2.amazonaws.com',
      };
    case 'kadena-testnet':
      return {
        chainId: '1',
        symbol: 'KDA',
        name: 'Kadena',
        key: 'kadena:testnet',
        networkId: 'testnet04',
        OPACT_CONTRACT_ID: 'opact',
        website: 'https://kadena.io/',
        OPACT_ACCOUNT_ID: 'opact-contract',
        OPACT_GAS_PAYER_ID: 'opact-gas-payer',
        explorerUrl: 'https://testnet.nearblocks.io',
        nodeUrl: 'https://kb96ugwxhi.execute-api.us-east-2.amazonaws.com',
        indexerUrl: 'https://bpsd19dro1.execute-api.us-east-2.amazonaws.com',
      };
    case 'kadena-development':
      return {
        chainId: '0',
        symbol: 'KDA',
        name: 'Kadena',
        key: 'kadena:devnet',
        networkId: 'development',
        OPACT_CONTRACT_ID: 'opact2',
        website: 'https://kadena.io/',
        OPACT_ACCOUNT_ID: 'opact2-contract',
        OPACT_GAS_PAYER_ID: 'opact-gas-payer',
        explorerUrl: 'https://testnet.nearblocks.io',
        nodeUrl: 'https://kb96ugwxhi.execute-api.us-east-2.amazonaws.com',
        indexerUrl: 'https://bpsd19dro1.execute-api.us-east-2.amazonaws.com',
      }
    default:
      return {
        chainId: '0',
        symbol: 'KDA',
        name: 'Kadena',
        key: 'kadena:opact',
        networkId: 'testnet04',
        OPACT_CONTRACT_ID: 'opact2',
        website: 'https://kadena.io/',
        OPACT_ACCOUNT_ID: 'opact2-contract',
        OPACT_GAS_PAYER_ID: 'opact-gas-payer',
        explorerUrl: 'https://testnet.nearblocks.io',
        nodeUrl: 'https://kb96ugwxhi.execute-api.us-east-2.amazonaws.com',
        indexerUrl: 'https://bpsd19dro1.execute-api.us-east-2.amazonaws.com',
      };
  }
}

export const config = getConfig();
