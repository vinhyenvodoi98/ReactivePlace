import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { AppProps } from 'next/app';
import { ToastContainer } from 'react-toastify';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';

import '@/styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import 'react-toastify/ReactToastify.min.css';

import { useIsSsr } from '../utils/ssr';
import { kopli, sepolia } from '@/config/customChain';

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [kopli, sepolia],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: 'RainbowKit demo',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID as string,
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

function MyApp({ Component, pageProps }: AppProps) {
  const isSsr = useIsSsr();
  if (isSsr) {
    return <div></div>;
  }

  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <Component {...pageProps} />
        <ToastContainer position='bottom-right' newestOnTop />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
