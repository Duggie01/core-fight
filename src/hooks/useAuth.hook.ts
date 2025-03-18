import { useState, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  useReadContract,
  BaseError,
} from "wagmi";
import rawAbi from "../abi/MMOGame.json";
import toast from "react-hot-toast";
import { parseEther } from "viem";
import { CONTRACT_ADDRESS } from "../config";

const abi = rawAbi.abi;

/**
 * Interface for Player Data
 */
interface PlayerData {
    username: string;
    isRegistered: boolean;
  }

export const useAuth = () => {
  const { isConnected, address } = useAccount();
  const { writeContract, isPending } = useWriteContract();
  const [user, setUser] = useState<PlayerData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * Fetch player details on login.
   */
  const { data: playerData, refetch: getPlayerDetails } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: "players",
    args: address ? [address] : undefined,
  });

  /**
   * Sign up flow - Register username and join the world.
   */
  const signUp = async (username: string, worldId: number, joinFee: number) => {
    if (!isConnected) {
      toast.error("Please connect your wallet first.");
      return;
    }
    if (!username.trim()) {
      toast.error("Username cannot be empty.");
      return;
    }
    if (username.length < 4) {
      toast.error("Username must be at least 4 characters long!");
      return;
    }

    setIsLoading(true);

    try {
      // Register username
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: "registerUser",
        args: [username],
      });
      toast.success("Username registered!");

      // Join world
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: "joinWorld",
        args: [worldId, username],
        value: parseEther(joinFee.toString()),
      });

      toast.success("Successfully joined the world!");
      getPlayerDetails(); // Refresh user data
    } catch (err: unknown) {
      if (err instanceof BaseError) {
        toast.error(err.shortMessage || "Sign-up failed.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login - Check if player exists and log them in.
   */
  const login = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first.");
      return;
    }

    setIsLoading(true);
    try {
      await getPlayerDetails();
      if (playerData && (playerData as PlayerData).isRegistered) {
        setUser(playerData as PlayerData);
        toast.success(`Welcome back, ${(playerData as PlayerData).username}!`);
      } else {
        toast.error("User not found. Please sign up.");
      }
    } catch (err) {
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    signUp,
    login,
    getPlayerDetails,
  };
};
