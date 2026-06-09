import { useNavigate } from 'react-router-dom';

export default function GameCard({ title, description, emoji, path }) {
  const navigate = useNavigate();
  return (
    <button className="game-card" onClick={() => navigate(path)}>
      <span className="game-card-emoji" aria-hidden="true">{emoji}</span>
      <h3 className="game-card-title">{title}</h3>
      <p className="game-card-desc">{description}</p>
    </button>
  );
}
