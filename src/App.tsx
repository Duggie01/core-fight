import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Worlds from "./pages/Worlds/Worlds";
import LearnMore from "./pages/About/About";
import LoginSignup from "./pages/LoginSignup/LoginSignup";
import Header from "./components/Header";
import { Toaster } from "react-hot-toast";
// import Check from "./components/Check";
function App() {
  return (
    <div className="lg:px-0 px-5">
      <Toaster position="top-center" reverseOrder={false} />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<LearnMore />} />
        <Route path="/login" element={<LoginSignup />} />
        <Route path="/worlds" element={<Worlds />} />
      </Routes>
    </div>
  );
}

export default App;
