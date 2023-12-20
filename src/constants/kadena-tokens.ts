export interface NamespaceInterface {
  id: string,
  refName: {
    name: string,
    namespace: string
  },
  refSpec: {
    name: string,
    namespace: string
  }
}

export interface KadenaTokenInterface {
  hash: string,
  icon: string,
  name : string,
  symbol: string,
  address: string,
  id: number | string,
  namespace: NamespaceInterface
}

export const kadenaTokens: KadenaTokenInterface[] = [
  {
    id: 0,
    symbol: 'KDA',
    name: 'Kadena',
    icon: 'https://opact.io/svg/kda.svg',
    hash: '21414792165107094930503066755869007218485843369153027361954450892852833682115',
    address: 'coin',
    namespace: {
      id: '',
      refName: {
        name: 'coin',
        namespace: ''
      },
      refSpec: {
        name: 'fungible-v2',
        namespace: ''
      }
    }
  },
]
