import { ReactNode } from "react";
import "@rainbow-me/rainbowkit/styles.css";
import {
  darkTheme,
  getDefaultConfig,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { coreDao } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { defineChain } from 'viem'
// import { coreDaoTestnet } from "../utils/Contract";
// import { coreDaoTestnet } from "../utils/Contract";

const coreDaoTestnet = defineChain({
  id: 1115,
  name: "Core DAO Testnet",
  network: "coredao-testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Core",
    symbol: "tCORE",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.test.btcs.network"],
    },
    public: {
      http: ["https://rpc.test.btcs.network"],
    },
  },
  blockExplorers: {
    default: { name: "CoreDAO Explorer", url: "https://scan.test.btcs.network" },
  },
  testnet: true,
});

const config = getDefaultConfig({
  appName: "safelock",
  projectId: "1d26e3b9bc5a24bc32a6f92da8f54a85",
  chains: [coreDaoTestnet, coreDao],
  ssr: false,
});

const queryClient = new QueryClient();

const CustomRainbowKitProvider = ({ children }: { children: ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#2463FF",
            fontStack: "system",
            overlayBlur: "small",
            borderRadius: "large",
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default CustomRainbowKitProvider;
