import { useState } from "react";
import { useAccount } from "wagmi";
// import { useAuth } from "../hooks/useAuth.hook";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth.hook";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
// import Header from "../components/Header"; // Import the Header component

const LoginSignup = () => {
  const navigate = useNavigate();
  const { isConnected, address } = useAccount();
  const { login, signUp, isLoading, user } = useAuth();
  const [username, setUsername] = useState("");
  const [worldId, setWorldId] = useState<number>(1);
  const [joinFee, setJoinFee] = useState<number>(0.01); // Example fee

  const handleSignUp = async () => {
    if (!username.trim()) {
      toast.error("Username cannot be empty.");
      return;
    }
    await signUp(username, worldId, joinFee);
    navigate("/worlds");
  };

  const handleLogin = async () => {
    await login();
    navigate("/worlds");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* 🏆 Add Header */}
      {/* <Header /> */}

      {/* 🎮 Login/Signup UI */}
      <div className="flex flex-col items-center justify-center flex-grow">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96 text-center">
          <h1 className="text-2xl font-bold mb-4">
            {user ? `Welcome, ${user.username}!` : "MMO Game"}
          </h1>

          {!isConnected ? (
            <p className="text-red-400">Please connect your wallet first.</p>
          ) : user ? (
            <p className="text-green-400">You are logged in!</p>
          ) : (
            <>
              <input
                type="text"
                placeholder="Enter username"
                className="w-full p-2 text-black rounded mb-2"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <button
                onClick={handleSignUp}
                className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded mt-2"
                disabled={isLoading}
              >
                {isLoading ? "Signing Up..." : "Sign Up & Join World"}
              </button>
              <button
                onClick={handleLogin}
                className="w-full bg-green-600 hover:bg-green-700 p-2 rounded mt-2"
                disabled={isLoading}
              >
                {isLoading ? "Logging In..." : "Log In"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
