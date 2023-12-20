let ENV: string | undefined = '';

export function getConfig(
  env: string | undefined = ENV || process.env.OPACT_SDK_NETWORK
) {
  ENV = env;
  switch (env) {
    case 'kadena-mainnet':
      return {
        chainId: '0',
        name: 'Kadena',
        key: 'kadena:mainnet',
        networkId: 'mainnet01',
        website: 'https://kadena.io/',
        indexerUrl: 'https://nish60qcn3.execute-api.us-east-2.amazonaws.com/graphql',
        nodeUrl: 'https://api.testnet.chainweb.com/chainweb/0.0/testnet04/chain/0/pact',

        OPACT_CONTRACT_ID: 'opact',
        OPACT_CONTRACT_NAMESPACE: 'free',
        OPACT_ACCOUNT_ID: 'opact-contract',
        OPACT_GAS_PAYER_ID: 'opact-gas-payer',
      };

    case 'kadena-testnet':
      return {
        chainId: '0',
        name: 'Kadena',
        key: 'kadena:testnet',
        networkId: 'testnet04',
        website: 'https://kadena.io/',
        indexerUrl: 'https://nish60qcn3.execute-api.us-east-2.amazonaws.com/graphql',
        nodeUrl: 'https://api.testnet.chainweb.com/chainweb/0.0/testnet04/chain/0/pact',

        OPACT_CONTRACT_ID: 'opact',
        OPACT_CONTRACT_NAMESPACE: 'free',
        OPACT_ACCOUNT_ID: 'opact-contract',
        OPACT_GAS_PAYER_ID: 'opact-gas-payer',
      };

    default:
      return {
        chainId: '0',
        name: 'Kadena',
        key: 'kadena:opact',
        networkId: 'testnet04',
        website: 'https://kadena.io/',
        nodeUrl: 'https://kb96ugwxhi.execute-api.us-east-2.amazonaws.com',
        indexerUrl: 'https://bpsd19dro1.execute-api.us-east-2.amazonaws.com',

        OPACT_CONTRACT_ID: 'opact2',
        OPACT_CONTRACT_NAMESPACE: '',
        OPACT_ACCOUNT_ID: 'opact2-contract',
        OPACT_GAS_PAYER_ID: 'opact-gas-payer',
      };
  }
}

export const config = getConfig();
