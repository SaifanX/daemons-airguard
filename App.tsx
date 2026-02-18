
import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import MissionControl from './components/MissionControl';
import UnifiedLanding from './pages/UnifiedLanding';
import HackathonInfo from './pages/HackathonInfo';

const TitleManager = () => {
  const location = useLocation();

  useEffect(() => {
    const baseTitle = "AirGuard | AI Drone Safety Assistant";
    const titles: Record<string, string> = {
      "/": "AirGuard | Home - Award-Winning Drone Safety Assistant",
      "/app": "Mission Control | AirGuard - AI Drone Risk Assessment",
      "/hackathon": "TechnoFest 2026 | AirGuard - Stonehill Hackathon Winner",
      "/mission-control": "AirGuard | Mission Control"
    };

    document.title = titles[location.pathname] || baseTitle;
  }, [location]);

  return null;
};

const App: React.FC = () => {
  return (
    <Router>
      <TitleManager />
      <div className="bg-slate-950 min-h-screen">
        <Routes>
          <Route path="/" element={<UnifiedLanding />} />
          <Route path="/app" element={<MissionControl />} />
          <Route path="/hackathon" element={<HackathonInfo />} />
          <Route path="/mission-control" element={<MissionControl />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
