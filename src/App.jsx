import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import Home from './pages/Home';
import GamesPortal from './pages/GamesPortal';
import BalloonGame from './pages/BalloonGame';
import './App.css';

// Build-time flag for shipping a balloon-only deployment (no homepage/portal)
// without touching routing code. Set VITE_BALLOON_ONLY=true on the relevant
// deploy target's env vars — leave unset elsewhere for full routing.
const BALLOON_ONLY = import.meta.env.VITE_BALLOON_ONLY === 'true';

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={BALLOON_ONLY ? <BalloonGame /> : <Home />} />
          {!BALLOON_ONLY && <Route path="/games" element={<GamesPortal />} />}
          <Route path="/balloon" element={<BalloonGame />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}
