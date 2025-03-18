import { useState, useEffect } from "react";
import { useMMOGame } from "../../hooks/use-contract.hook"; // ✅ Use hook
// import { World } from "../../types";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import { Triangle } from "react-loader-spinner";

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

const Worlds = () => {
  const {
    allWorldsData,
    refetchAllWorlds, // ✅ Allows manual data refresh
    joinWorld,
    createWorld,
    getPlayerLocation,
    contractOwner,
    isPending,
    reading,
  } = useMMOGame();
  const { address, isConnected } = useAccount(); // ✅ Get current wallet address
  const [worlds, setWorlds] = useState<World[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // ✅ Modal State
  const [playerWorldId, setPlayerWorldId] = useState<number | null>(null);
  const [newWorld, setNewWorld] = useState({ name: "Richmond", x: 10, y: 10, fee: 0.1 });
  const navigate = useNavigate();

  useEffect(() => {
    if (!allWorldsData) return;
  
    // Cast to array of World structs and add IDs
    const worldsArray = allWorldsData as World[];
    const worldsWithIds = worldsArray.map((world: World, index: number) => ({
      ...world,
      id: index // Array index corresponds to worldId
    }));
  
    setWorlds(worldsWithIds);
  }, [allWorldsData]);




  // ✅ Manually refresh worlds when `isModalOpen` changes
  useEffect(() => {
    const refreshWorlds = async () => {
      if (!isModalOpen) {
        await refetchAllWorlds(); // ✅ Ensure it's awaited
      }
    };

    refreshWorlds();
  }, [isModalOpen]);

  useEffect(() => {
    const fetchPlayerWorld = async () => {
      if (!isConnected || !address) return;

      try {
        console.log("Checking if player is already in a world...");
        const currentWorldId = await getPlayerCurrentWorld();

        if (currentWorldId !== null && currentWorldId !== undefined) {
          setPlayerWorldId(currentWorldId);
          console.log(`✅ Player is already in world ID: ${currentWorldId}`);
        }
      } catch (error) {
        console.error("Error checking player's world:", error);
      }
    };

    fetchPlayerWorld();
  }, [isConnected, address]);

  const getPlayerCurrentWorld = async (): Promise<number | null> => {
    try {
      const worldId = await getPlayerLocation(); // ✅ Fetch player's world ID from contract
      return worldId !== undefined ? Number(worldId) : null;
    } catch (error) {
      console.error("Error fetching player's world:", error);
      return null;
    }
  };


  const handleJoinWorld = async (worldId: number) => {
    const world = worlds.find(w => w.id === worldId);
    console.log(world)
    if (!world || world.id === undefined) {
      toast.error("Invalid world selected.");
      return;
    }

    console.log(`Attempting to enter world: ${world.name} (ID: ${world.id})`);

    if (playerWorldId === world.id) {
      // ✅ User is already in this world → Just navigate
      toast.success(`Welcome back to ${world.name}!`);
      navigate(`/world/${world.id}`);
      return;
    }

    // ✅ Otherwise, ask them to pay the join fee
    try {
      await joinWorld(world.id, "YourUsername", world.fee);
      toast.success(`Joined ${world.name} successfully!`);
      setPlayerWorldId(world.id); // ✅ Update state
      navigate(`/world/${world.id}`);
    } catch (error) {
      toast.error("Failed to join world.");
    }
  };

  const checkIfPlayerIsInWorld = async (worldId: number): Promise<boolean> => {
    try {
      const playerLocation = await getPlayerLocation();
      return !!playerLocation; // ✅ If location exists, player is already in world
    } catch (error) {
      console.error("Error checking player location:", error);
      return false; // Default to false if error occurs
    }
  };

  // ✅ Handle Creating a World (Only for Owner)
  const handleCreateWorld = async () => {
    console.log("handle create world triggered");

    if (!newWorld.name.trim() || newWorld.x < 0 || newWorld.y < 0 || newWorld.fee <= 0) {
      toast.error("Please enter valid world details.");
      return;
    }

    try {
      await createWorld(newWorld.name, newWorld.x, newWorld.y, newWorld.fee);
      toast.success(`World "${newWorld.name}" created successfully!`);
      setIsModalOpen(false);
      setNewWorld({ name: "", x: 0, y: 0, fee: 0 });
    } catch (error) {
      toast.error("Failed to create world.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold text-center mb-6">Available Worlds</h1>
      {/* 🏆 Show "Create World" Button for Contract Owner Only */}
      {isConnected && address === contractOwner && (
        <div className="text-center mb-4">
          <button
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded cursor-pointer"
            onClick={() => setIsModalOpen(true)} // ✅ Open Modal
          >
            + Create World
          </button>
        </div>
      )}

      {reading ? (
        <div className="h-screen w-full flex items-center justify-center -mt-20">
          <Triangle
            visible={true}
            height="80"
            width="80"
            color="#FACC15" // yellow-400
            ariaLabel="triangle-loading"
            wrapperStyle={{}}
            wrapperClass=""
          />
        </div>
      ) : worlds.length === 0 ? (
        // ✅ No Worlds Available UI
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <img
            src="/worlds-images/no-worlds.svg"
            alt="No Worlds"
            className="w-60 mb-4 opacity-80"
          />
          <h2 className="text-2xl font-semibold">No Worlds Found</h2>
          <p className="text-gray-400 text-center max-w-md mt-2">
            There are currently no worlds available. If you're an admin, you can create a new world.
          </p>

          {/* ✅ Show "Create World" Button for Contract Owner
          {isConnected && address === contractOwner && (
            <button
              className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
              onClick={() => setIsModalOpen(true)}
            >
              + Create World
            </button>
          )} */}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {worlds.map((world) => (
            <div key={world.id } className="bg-gray-800 rounded-xl overflow-hidden shadow-lg group">
              <div className="h-30 w-full ">
                <img
                  src="/worlds-images/world1.jpg"
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-110 duration-300"
                />
              </div>
              <div className="px-8 py-2 w-full text-gray-300 relative">
                <h2 className="text-xl font-bold">{world.name}</h2>
                <p>
                  Size: ({world.x}, {world.y})
                </p>
                <p>
                  Number of Cells: {world.x * world.y}
                </p>
                <p>Entry Fee: {world.fee} CORE</p>
                <p>Players: {world.playerCount}</p>
                <p
                  className={`${world.isActive
                    ? "text-green-400 bg-green-500/40"
                    : "text-red-400 bg-red-500/20"
                    } py-1 text-center rounded-full w-[70px] absolute top-3 right-6`}
                >
                  {world.isActive ? "Active" : "Inactive"}
                </p>
                <button
                  className={`mt-3 mb-4 text-gray-50 p-2 rounded-xl w-full cursor-pointer ${playerWorldId === world.id
                      ? "bg-green-500 hover:bg-green-600" // ✅ Green for "Enter World"
                      : "bg-yellow-500 hover:bg-yellow-600" // ✅ Yellow for "Join World"
                    }`}
                  onClick={() => handleJoinWorld(world.id)}
                >
                  {playerWorldId === world.id ? "Enter World" : "Join World"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🔥 CREATE WORLD MODAL 🔥 */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96  !text-white">
            <h2 className="text-xl font-bold mb-4">Create a New World</h2>

            <input
              type="text"
              placeholder="World Name"
              className="w-full p-2 mb-2 rounded bg-slate-400"
              value={newWorld.name}
              onChange={(e) =>
                setNewWorld({ ...newWorld, name: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="X Coordinate"
              className="w-full p-2 mb-2 rounded bg-slate-400"
              value={newWorld.x}
              onChange={(e) =>
                setNewWorld({ ...newWorld, x: Number(e.target.value) })
              }
            />
            <input
              type="number"
              placeholder="Y Coordinate"
              className="w-full p-2 mb-2 rounded bg-slate-400"
              value={newWorld.y}
              onChange={(e) =>
                setNewWorld({ ...newWorld, y: Number(e.target.value) })
              }
            />
            <input
              type="number"
              placeholder="Entry Fee (ETH)"
              className="w-full p-2 mb-2 rounded bg-slate-400"
              value={newWorld.fee}
              onChange={(e) =>
                setNewWorld({ ...newWorld, fee: Number(e.target.value) })
              }
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                onClick={handleCreateWorld}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Worlds;
