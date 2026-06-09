import { useState, useEffect } from 'react';
import CertificateModal from './CertificateModal';

const CONFETTI = [
  { e: '🎈', left:  '7%', delay: '0s',    dur: '3.0s' },
  { e: '⭐', left: '18%', delay: '0.5s',  dur: '2.6s' },
  { e: '🎉', left: '32%', delay: '0.2s',  dur: '3.3s' },
  { e: '🌟', left: '50%', delay: '0.8s',  dur: '2.8s' },
  { e: '🎈', left: '65%', delay: '0.15s', dur: '3.5s' },
  { e: '⭐', left: '80%', delay: '0.6s',  dur: '2.5s' },
  { e: '🎉', left: '92%', delay: '1.0s',  dur: '3.1s' },
];

function getStars(score) {
  if (score >= 10) return 3;
  if (score >= 5)  return 2;
  if (score >= 1)  return 1;
  return 0;
}

export default function EndScreen({ score, onPlayAgain, onExit }) {
  const [displayed,  setDisplayed]  = useState(0);
  const [showCert,   setShowCert]   = useState(false);

  useEffect(() => {
    if (displayed >= score) return;
    const t = setTimeout(() => setDisplayed(n => n + 1), 80);
    return () => clearTimeout(t);
  }, [displayed, score]);

  const stars = getStars(score);

  return (
    <div className="end-screen">
      {CONFETTI.map((c, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{ left: c.left, animationDelay: c.delay, animationDuration: c.dur }}
        >
          {c.e}
        </span>
      ))}

      <div className="end-card">
        <p className="end-times-up">Time's Up! 🎉</p>
        <p className="end-label">Your Score</p>
        <div className="end-score">{displayed}</div>
        <div className="end-stars" aria-label={`${stars} out of 3 stars`}>
          {Array.from({ length: 3 }, (_, i) => (
            <span
              key={i}
              className={`end-star${i < stars ? ' end-star--lit' : ''}`}
              style={{ '--i': i }}
            >
              ★
            </span>
          ))}
        </div>

        <div className="end-actions">
          <button className="end-btn end-btn--secondary" onClick={onExit}>
            ← Exit
          </button>
          <button className="end-btn end-btn--certificate" onClick={() => setShowCert(true)}>
            🏆 Certificate
          </button>
          <button className="end-btn end-btn--primary" onClick={onPlayAgain}>
            Play Again ↩
          </button>
        </div>
      </div>

      {showCert && (
        <CertificateModal score={score} onClose={() => setShowCert(false)} />
      )}
    </div>
  );
}
