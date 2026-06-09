import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Balloon from '../components/Balloon';
import {
  generateBalloons,
  pickTarget,
  speakLetter,
  checkAnswer,
} from '../game-logic/balloonGame';

function newRound() {
  const balloons = generateBalloons();
  const target = pickTarget(balloons);
  return { balloons, target };
}

export default function BalloonGame() {
  const navigate = useNavigate();
  const [round, setRound] = useState(() => newRound());
  const [statuses, setStatuses] = useState({});
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('');

  const speak = useCallback(() => {
    speakLetter(round.target.letter);
  }, [round.target.letter]);

  // Speak on new round
  useEffect(() => {
    const t = setTimeout(speak, 400);
    return () => clearTimeout(t);
  }, [speak]);

  function handleBalloonClick(balloon) {
    if (statuses[balloon.id]) return;

    const correct = checkAnswer(balloon.id, round.target.id);

    if (correct) {
      setStatuses((s) => ({ ...s, [balloon.id]: 'correct' }));
      setScore((n) => n + 1);
      setMessage('');
      // Next round after pop animation
      setTimeout(() => {
        setRound(newRound());
        setStatuses({});
        setMessage('');
      }, 1000);
    } else {
      setStatuses((s) => ({ ...s, [balloon.id]: 'wrong' }));
      setMessage('Try again!');
      // Reset wrong balloon after shake
      setTimeout(() => {
        setStatuses((s) => {
          const next = { ...s };
          delete next[balloon.id];
          return next;
        });
        setMessage('');
      }, 700);
    }
  }

  return (
    <div className="game-page">
      <header className="game-header">
        <button className="back-btn" onClick={() => navigate('/')}>← Home</button>
        <h2 className="game-page-title">Balloon Pop</h2>
        <span className="score-badge">Score: {score}</span>
      </header>

      <div className="prompt-area">
        <p className="prompt-text">
          Tap the balloon for
          <strong className="prompt-target"> "{round.target.romanization}" </strong>
          ({round.target.letter})
        </p>
        <button className="speak-btn" onClick={speak} aria-label="Hear the letter again">
          🔊 Hear it again
        </button>
        {message && <p className="feedback-msg">{message}</p>}
      </div>

      <div className="balloon-field">
        {round.balloons.map((b) => (
          <Balloon
            key={b.id}
            {...b}
            status={statuses[b.id] || 'idle'}
            onClick={() => handleBalloonClick(b)}
          />
        ))}
      </div>
    </div>
  );
}
