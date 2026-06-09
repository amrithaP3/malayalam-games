const DECO_BALLOONS = [
  { color: '#FF6B6B', size: 72,  left: '6%',  top: '12%', delay: '0s',   dur: '3.2s' },
  { color: '#4ECDC4', size: 52,  left: '16%', top: '62%', delay: '0.7s', dur: '2.8s' },
  { color: '#45B7D1', size: 84,  left: '78%', top: '18%', delay: '0.3s', dur: '3.6s' },
  { color: '#9B59B6', size: 58,  left: '87%', top: '58%', delay: '1.1s', dur: '2.6s' },
  { color: '#F39C12', size: 66,  left: '50%', top: '4%',  delay: '0.5s', dur: '3.0s' },
  { color: '#96CEB4', size: 48,  left: '34%', top: '72%', delay: '1.4s', dur: '2.9s' },
  { color: '#FF6B6B', size: 44,  left: '64%', top: '70%', delay: '0.9s', dur: '3.3s' },
];

export default function GameIntro({ onStart }) {
  return (
    <div className="intro-screen">
      {DECO_BALLOONS.map((b, i) => (
        <div
          key={i}
          className="deco-balloon"
          style={{
            '--deco-color': b.color,
            width:  b.size,
            height: Math.round(b.size * 1.22),
            left:   b.left,
            top:    b.top,
            animationDelay:    b.delay,
            animationDuration: b.dur,
          }}
        />
      ))}

      <div className="intro-card">
        <span className="intro-emoji" aria-hidden="true">🎈</span>
        <h1 className="intro-title">Balloon Pop</h1>
        <p className="intro-desc">
          Listen to the Malayalam letter and pop the matching balloon!
        </p>
        <button className="start-btn" onClick={onStart}>
          Start Game
        </button>
      </div>
    </div>
  );
}
