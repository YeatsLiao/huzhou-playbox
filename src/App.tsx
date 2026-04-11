import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import FishingGame from "@/pages/FishingGame";
import MazeGame from "@/pages/MazeGame";
import CalligraphyGame from "@/pages/CalligraphyGame";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/fishing" element={<FishingGame />} />
        <Route path="/maze" element={<MazeGame />} />
        <Route path="/calligraphy" element={<CalligraphyGame />} />
      </Routes>
    </Router>
  );
}
