import { createPublicClient, createWalletClient, custom, http } from "viem";
import MMOGameABI from "../abi/MMOGame.json";
import { coreDaoTestnet } from "./Contract";

// 🔥 Use your deployed contract address
const CONTRACT_ADDRESS = "0xffF8088c6a2B96D970C77B70c5F68375643C95b4";

export const publicClient = createPublicClient({
  chain: coreDaoTestnet,
  transport: http(),
});

export const walletClient = createWalletClient({
  chain: coreDaoTestnet,
  transport: custom(window.ethereum),
});

export const MMOGameContract = {
  address: CONTRACT_ADDRESS as `0x${string}`,
  abi: MMOGameABI,
};
