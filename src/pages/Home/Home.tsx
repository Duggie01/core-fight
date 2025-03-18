import { Link, useNavigate } from "react-router-dom";
import { useAccount, useConnect } from "wagmi";
import toast from "react-hot-toast";

const Home = () => {
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const { connect, connectors } = useConnect();

  const handlePlayNow = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first.");
      connect({ connector: connectors[0] });
      return;
    }
    navigate("/worlds");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Hero Section */}
      <main className="text-center space-y-6 px-6">
        <h1 className="text-5xl font-extrabold leading-tight">
          Conquer the <span className="text-yellow-400">Battlefield</span> <br />
          Upgrade, Fight, and Dominate!
        </h1>
        <p className="text-xl text-gray-300 max-w-xl mx-auto">
          Build your empire, grow your army through Battle, and engage in epic battles. Use Core tokens for powerful upgrades!
        </p>

        <div className="space-x-6 mt-6">
          <Link to="/about">
            <button className="border border-yellow-400 text-yellow-400 px-6 py-3 rounded-lg text-lg font-bold hover:bg-yellow-400 hover:text-black transition">
              Learn More
            </button>
          </Link>
          <button
            onClick={handlePlayNow}
            className="bg-yellow-400 text-black px-6 py-3 rounded-lg text-lg font-bold shadow-lg hover:bg-yellow-500 transition"
          >
            Play Now
          </button>
        </div>
      </main>

      {/* Game Preview (Mockup) */}
      <section className="mt-16">
        <div className="w-[600px] h-[350px] bg-gray-800 rounded-lg border border-gray-700 flex items-center justify-center">
          <p className="text-gray-400">Game Preview Coming Soon...</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="absolute bottom-4 text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} Core Fight | All Rights Reserved
      </footer>
    </div>
  );
};

export default Home;
