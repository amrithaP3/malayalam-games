import { useNavigate } from 'react-router-dom';
import GameCard from '../components/GameCard';

const GAMES = [
  { title: 'Balloon Pop', description: 'Hear a Malayalam letter and pop the right balloon!', emoji: '🎈', path: '/balloon' },
];

export default function GamesPortal() {
  const navigate = useNavigate();
  return (
    <div className="portal">
      <button className="portal-back" onClick={() => navigate('/')}>← Back</button>
      <h1 className="portal-title">Learning Games</h1>
      <div className="home-grid">
        {GAMES.map(g => <GameCard key={g.path} {...g} />)}
      </div>
    </div>
  );
}
