import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAuth } from "../hooks/useAuth.hook";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-gray-900 text-white p-4 flex justify-between items-center shadow-lg">
      <h1
        className="text-2xl font-bold cursor-pointer hover:text-blue-400 transition"
        onClick={() => navigate("/")}
      >
        CORE FIGHT
      </h1>
      
      <div className="flex items-center gap-4">
        <ConnectButton />
      </div>
    </header>
  );
};

export default Header;
