import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import CustomRainbowKitProvider from "./providers/RainbowKit.tsx";
import { GameProvider } from './context/GameContext.tsx'

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CustomRainbowKitProvider>
      <BrowserRouter>
      <GameProvider>
        <App />
      </GameProvider>
      </BrowserRouter>
    </CustomRainbowKitProvider>
  </StrictMode>
);
