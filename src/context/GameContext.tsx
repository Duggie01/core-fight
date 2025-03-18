import React, { createContext, useContext, useState, useEffect } from "react";

interface GameContextProps {
  username: string;
  setUsername: (name: string) => void;
}

const GameContext = createContext<GameContextProps | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [username, setUsername] = useState<string>(() => {
    // Load from local storage if available
    if (typeof window !== "undefined") {
      return localStorage.getItem("username") || "Player";
    }
    return "Player";
  });

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);


  return <GameContext.Provider value={{ username, setUsername }}>{children}</GameContext.Provider>;
};

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameContext must be used within GameProvider");
  }
  return context;
};
