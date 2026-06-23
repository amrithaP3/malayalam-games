import GameCard from '../components/GameCard';

const GAMES = [
  {
    title: 'Balloon Pop',
    description: 'Hear a Malayalam letter and pop the right balloon!',
    emoji: '🎈',
    path: '/balloon',
  },
];

export default function Home() {
  return (
    <div className="home">
      <header className="home-header">
        <h1 className="home-title">malayalam-games</h1>
        <p className="home-subtitle">മലയാളം പഠിക്കാം — Learn Malayalam through play</p>
      </header>
      <main className="home-grid">
        {GAMES.map((g) => (
          <GameCard key={g.path} {...g} />
        ))}
      </main>
    </div>
  );
}
