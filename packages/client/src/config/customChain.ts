import { Chain } from "@rainbow-me/rainbowkit";

export const kopli = {
  id: 5318008,
  name: "Reactive Kopli",
  network: "kopli",
  iconUrl: "https://assets.coingecko.com/coins/images/54415/standard/Symbol_ColorBlack_H32_%281%29.png",
  iconBackground: "#000",
  nativeCurrency: {
    decimals: 18,
    name: "Reactive Kopli",
    symbol: "REACT",
  },
  rpcUrls: {
    public: { http: ["https://kopli-rpc.rnk.dev"] },
    default: { http: ["https://kopli-rpc.rnk.dev"] },
  },
  blockExplorers: {
    etherscan: {
      name: "Reactive Kopli Blockscout",
      url: "https://kopli.reactscan.net",
    },
    default: {
      name: "Reactive Kopli Blockscount",
      url: "https://kopli.reactscan.net",
    },
  },
  testnet: true,
} as Chain;

export const sepolia = {
  id: 11155111,
  name: 'Sepolia',
  network: 'sepolia',
  iconUrl:
    'https://assets.coingecko.com/coins/images/279/standard/ethereum.png',
  iconBackground: '#000',
  nativeCurrency: {
    decimals: 18,
    name: 'Sepolia',
    symbol: 'ETH',
  },
  testnet: true,
  rpcUrls: {
    public: { http: ['https://eth-sepolia.public.blastapi.io'] },
    default: { http: ['https://eth-sepolia.public.blastapi.io'] },
  },
} as Chain;