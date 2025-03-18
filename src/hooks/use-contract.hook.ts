import { useState, useEffect } from "react";
import {
  useWriteContract,
  useReadContract,
  useAccount,
  BaseError,
} from "wagmi";
import rawAbi from "../abi/MMOGame.json";
import toast from "react-hot-toast";
import { parseEther } from "viem";
import { CONTRACT_ADDRESS } from "../config";

const abi = rawAbi.abi;

interface World {
  id: number;
  name: string;
  x: number;
  y: number;
  fee: number;
  owner: string;
  playerCount: number;
  isActive: boolean;
}

export const useMMOGame = () => {
  const { isConnected, address } = useAccount();
  const { writeContract, isPending } = useWriteContract();

  const {
    data: contractOwner,
    refetch: getContractOwner,
    isLoading: reading,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: "owner", // Function in the contract that returns owner address
  });

//   const { data: totalWorlds, refetch: fetchTotalWorlds } = useReadContract({
//     address: CONTRACT_ADDRESS,
//     abi,
//     functionName: "totalWorlds",
//   });

  // ✅ Fetch all worlds
  const { data: allWorldsData, refetch: refetchAllWorlds } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: "getAllWorlds",
  });
  useEffect(() => {
    const fetchData = async () => {
      if (allWorldsData) {
        console.log(await allWorldsData, "this is the updated worlds data");
      }
    };
    fetchData();
  }, [allWorldsData]);

  /**
   * Register a user with a username.
   */
  const registerUser = async (username: string) => {
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

    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: "registerUser",
        args: [username],
      });
      toast.success("User registered successfully!");
    } catch (err: unknown) {
      if (err instanceof BaseError) {
        toast.error(err.shortMessage || "Registration failed.");
      }
    }
  };

  /**
   * Join a world by paying a fee.
   */
  const joinWorld = async (worldId: number, username: string, fee: number) => {
    if (!isConnected) {
      toast.error("Please connect your wallet first.");
      return;
    }

    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: "joinWorld",
        args: [worldId, username],
        value: parseEther(fee.toString()),
      });
      toast.success("Joined world successfully!");
    } catch (err: unknown) {
      if (err instanceof BaseError) {
        toast.error(err.shortMessage || "Joining world failed.");
      }
    }
  };
    
    
    // // ✅ Format `allWorldsData` properly, handling BigInt conversions
    // const formattedWorlds: World[] = Array.isArray(allWorldsData)
    //   ? allWorldsData.map((world: any, index: number) => ({
    //       id: index,
    //       name: world?.name ? String(world.name) : "Unknown", // Ensure name is a string
    //       x: world?.x ? Number(world.x) : 0, // Convert BigInt to Number
    //       y: world?.y ? Number(world.y) : 0, // Convert BigInt to Number
    //       fee: world?.fee ? Number(world.fee) / 1e18 : 0, // Convert Wei (BigInt) to ETH
    //       owner: world?.worldOwner || "Unknown", // Use correct property name
    //       playerCount: world?.playerCount ? Number(world.playerCount) : 0, // Convert BigInt to Number
    //       isActive: Boolean(world?.isActive),
    //     }))
    //   : [];
    
    // console.log("✅ Fetched Worlds:", formattedWorlds); // ✅ Debugging log
    
  
    /**

  /**
   * ✅ Create a world (only for contract owner).
   */
  const createWorld = async (name: string, x: number, y: number, fee: number) => {
    if (!isConnected) {
      toast.error("Please connect your wallet first.");
      return;
    }
  
    try {
      console.log(`Creating world: ${name}, Coordinates: (${x}, ${y}), Fee: ${fee} ETH`);
      
      // ✅ Ensure fee is properly converted to a string
      const feeInEther = parseEther(fee.toFixed(18)); // Ensures precision
  
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: "createWorld",
        args: [name, x, y, feeInEther],
      });
  
      toast.success(`World "${name}" created successfully!`);
      console.log(`✅ Successfully created world: ${name}`);
    } catch (err: any) {
      console.error("❌ Error creating world:", err);
  
      if (err instanceof BaseError) {
        toast.error(err.shortMessage || "Creating world failed.");
      } else {
        toast.error("Unexpected error occurred. Check console.");
      }
    }
  };
  

  // const getWorldDetails = async (worldId: number) => {
  //   try {
  //     const worldData = await useReadContract({
  //       address: CONTRACT_ADDRESS,
  //       abi,
  //       functionName: "worlds",
  //       args: [worldId],
  //     });

  //     if (!worldData) return null;

  //     return {
  //       id: worldId,
  //       name: (worldData as any)[0],
  //       x: Number((worldData as any)[1]),
  //       y: Number((worldData as any)[2]),
  //       fee: Number((worldData as any)[3]),
  //       owner: (worldData as any)[4],
  //       playerCount: Number((worldData as any)[5]),
  //       isActive: Boolean((worldData as any)[6]),
  //     } as World;
  //   } catch (error) {
  //     console.error(`Error fetching world ${worldId}:`, error);
  //     return null;
  //   }
  // };

  // // ✅ Fetch all worlds
  // const { data: allWorldsData, refetch: refetchAllWorlds } = useReadContract({
  //   address: CONTRACT_ADDRESS,
  //   abi,
  //   functionName: "getAllWorlds",
  // });
  
  const fetchAllWorlds = async (): Promise<World[]> => {
    try {
      const worldsData = await useReadContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: "getAllWorlds",
      });
  
      console.log("Raw Worlds Data:", worldsData); // Debugging log
  
      if (!worldsData || !Array.isArray(worldsData)) {
        console.warn("No worlds found");
        return [];
      }
  
      return worldsData.map((world, index) => ({
        id: index,
        name: world[0], // String
        x: Number(world[1]), // BigInt -> Number
        y: Number(world[2]),
        fee: Number(world[3]) / 1e18, // Convert from Wei to ETH
        owner: world[4],
        playerCount: Number(world[5]),
        isActive: Boolean(world[6]),
      }));
    } catch (error) {
      console.error("Error fetching worlds:", error);
      return [];
    }
  };
  
  /**
   * Attack a city.
   */
  const attackCity = async (
    worldId: number,
    defender: string,
    troopsSent: number
  ) => {
    if (!isConnected) {
      toast.error("Please connect your wallet first.");
      return;
    }

    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: "attackCity",
        args: [worldId, defender, troopsSent],
      });
      toast.success("City attack initiated!");
    } catch (err: unknown) {
      if (err instanceof BaseError) {
        toast.error(err.shortMessage || "City attack failed.");
      }
    }
  };

  /**
   * Scout a city.
   */
  const scoutCity = async (
    worldId: number,
    cityOwner: string,
    scoutFee: number
  ) => {
    if (!isConnected) {
      toast.error("Please connect your wallet first.");
      return;
    }

    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: "scoutCity",
        args: [worldId, cityOwner],
        value: parseEther(scoutFee.toString()),
      });
      toast.success("City scouting successful!");
    } catch (err: unknown) {
      if (err instanceof BaseError) {
        toast.error(err.shortMessage || "City scouting failed.");
      }
    }
  };

  /**
   * Fetch player details.
   */
  const { data: playerData, refetch: getPlayerDetails } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: "players",
    args: address ? [address] : undefined,
  });

  /**
   * Fetch world details.
   */
  const { data: worldData, refetch: getWorld } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: "getWorld",
    args: address ? [1] : undefined, // Replace with dynamic world ID if needed
  });

  /**
   * Fetch player location in a world.
   */
  const { data: playerLocation, refetch: getPlayerLocation } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: "getPlayerLocationInWorld",
    args: address ? [1, address] : undefined, // Replace with dynamic world ID
  });

  return {
    registerUser,
    joinWorld,
    attackCity,
    scoutCity,
    getPlayerDetails,
    getWorld,
    getPlayerLocation,
    getContractOwner,
    createWorld,
    fetchAllWorlds,
    allWorldsData,
    refetchAllWorlds,
    contractOwner,
    playerData,
    worldData,
    playerLocation,
    isPending,
    reading,
  };
};
