import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import AppLayout from "./components/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import StrategyTracks from "./pages/StrategyTracks";
import TrackDetail from "./pages/TrackDetail";
import SimulationLab from "./pages/SimulationLab";
import SimulationStudio from "./pages/SimulationStudio";
import Learn from "./pages/Learn";

export default function App() {
  return (
    <UserProvider>
      <HashRouter>
        <Routes>
          {/* Login is the root - no sidebar */}
          <Route path="/" element={<Login />} />

          {/* All app pages share the AppLayout (Sidebar + main content) */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tracks" element={<StrategyTracks />} />
            <Route path="/tracks/:trackId" element={<TrackDetail />} />
            <Route path="/simulation" element={<SimulationLab />} />
            <Route
              path="/simulation/:studioId"
              element={<SimulationStudio />}
            />
            <Route path="/learn" element={<Learn />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </UserProvider>
  );
}
