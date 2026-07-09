import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import BalloonGame from './pages/BalloonGame';
import './App.css';

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<BalloonGame />} />
          <Route path="/balloon" element={<BalloonGame />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}
