import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import Home from './pages/Home';
import GamesPortal from './pages/GamesPortal';
import BalloonGame from './pages/BalloonGame';
import './App.css';

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/games" element={<GamesPortal />} />
          <Route path="/balloon" element={<BalloonGame />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}
