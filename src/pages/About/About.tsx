import { Link } from "react-router-dom";

const LearnMore = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gray-900 text-white p-8">
      {/* Header */}
      <header className="w-full max-w-4xl text-center">
        <h1 className="text-4xl font-extrabold text-yellow-400">About MMO 2D Battle</h1>
        <p className="text-gray-300 mt-3 text-lg">
          A blockchain-powered **strategy MMO** where you build cities, train armies, and conquer enemies using Core tokens!
        </p>
      </header>

      {/* Game Features */}
      <section className="mt-10 max-w-4xl space-y-8">
        
        {/* 1. Create a World */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-2xl font-bold text-yellow-400">🌍 Create & Explore a World</h2>
          <p className="text-gray-300 mt-2">
            Worlds are vast battlefields where players fight for dominance. Each world has **limited slots** for players, so join fast!
          </p>
        </div>

        {/* 2. Build and Upgrade a City */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-2xl font-bold text-yellow-400">🏰 Build & Defend Your City</h2>
          <p className="text-gray-300 mt-2">
            Start with a **small city** and expand it into a mighty fortress! Upgrade your army, gather food, and strategize.
          </p>
        </div>

        {/* 3. Train Troops and Attack */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-2xl font-bold text-yellow-400">⚔️ Train Troops & Conquer Enemies</h2>
          <p className="text-gray-300 mt-2">
            Train an army and **choose how many soldiers** to send into battle. **Defeat enemies, steal resources, and grow stronger!**
          </p>
        </div>

        {/* 4. Dynamic Battles */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-2xl font-bold text-yellow-400">🔥 Battle Mechanics</h2>
          <p className="text-gray-300 mt-2">
            Every battle is unpredictable! The **bigger army has the advantage, but anything can happen!** Your decisions matter.
          </p>
        </div>

        {/* 5. Attack Wild Beasts */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-2xl font-bold text-yellow-400">🦖 Hunt Wild Beasts for Rewards</h2>
          <p className="text-gray-300 mt-2">
            Face off against **powerful creatures** lurking in the world. Win battles to **earn food and resources** to upgrade your city!
          </p>
        </div>

        {/* 6. Blockchain-Powered Economy */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-2xl font-bold text-yellow-400">💰 Blockchain & Core Token Integration</h2>
          <p className="text-gray-300 mt-2">
            Core Fight is powered by **Core tokens**, allowing players to **stake, upgrade, and trade assets in-game.**
          </p>
        </div>

      </section>

      {/* CTA Buttons */}
      <div className="mt-10 flex space-x-6">
        <Link to="/worlds" className="bg-yellow-400 text-black px-6 py-3 rounded-lg text-lg font-bold shadow-lg hover:bg-yellow-500 transition">
          Start Playing
        </Link>
        <Link to="/">
          <button className="border border-yellow-400 text-yellow-400 px-6 py-3 rounded-lg text-lg font-bold hover:bg-yellow-400 hover:text-black transition">
            Back to Home
          </button>
        </Link>
      </div>

      {/* Footer */}
      <footer className="mt-10 text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} Core Fight | All Rights Reserved
      </footer>
    </div>
  );
};

export default LearnMore;
