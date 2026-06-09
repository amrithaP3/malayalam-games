import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Balloon from '../components/Balloon';
import GameIntro from '../components/GameIntro';
import EndScreen from '../components/EndScreen';
import { pickSubset, pickTarget, playLetterAudio, checkAnswer } from '../game-logic/balloonGame';

const GAME_DURATION = 30;

function createBalloon(letter, letters) {
  const laneW = 82 / letters.length;
  const laneIndex = letters.findIndex(v => v.id === letter.id);
  const laneStart = 6 + laneIndex * laneW;
  const duration = 8 + Math.random() * 7;
  return {
    uid:      Math.random().toString(36).slice(2),
    ...letter,
    left:     laneStart + Math.random() * Math.max(laneW - 8, 0),
    duration,
    delay:    -(Math.random() * duration),
  };
}

function initBalloons(letters) {
  return letters.map(v => createBalloon(v, letters));
}

const CLOUDS = [
  { w: 110, top: '10%', dur: '32s', delay:  '0s'  },
  { w:  80, top: '22%', dur: '44s', delay: '-18s' },
  { w: 130, top:  '6%', dur: '26s', delay:  '-9s' },
  { w:  70, top: '30%', dur: '50s', delay: '-35s' },
];

export default function BalloonGame() {
  const navigate = useNavigate();
  const [letters,  setLetters]  = useState(() => pickSubset(16));
  const [started,  setStarted]  = useState(false);
  const [paused,   setPaused]   = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [balloons, setBalloons] = useState(() => initBalloons(letters));
  const [target,   setTarget]   = useState(() => pickTarget(letters));
  const [statuses, setStatuses] = useState({});
  const [score,    setScore]    = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [roundId,  setRoundId]  = useState(0);

  useEffect(() => {
    if (!started || paused || gameOver) return;
    if (timeLeft <= 0) { setGameOver(true); return; }
    const t = setTimeout(() => setTimeLeft(n => n - 1), 1000);
    return () => clearTimeout(t);
  }, [started, paused, gameOver, timeLeft]);

  const speak = useCallback(() => playLetterAudio(target.letter), [target]);
  useEffect(() => {
    if (!started || paused || gameOver) return;
    const t = setTimeout(speak, 350);
    return () => clearTimeout(t);
  }, [speak, started, paused, gameOver, roundId]);

  function handleStart() { setStarted(true); }

  function handlePlayAgain() {
    const newLetters = pickSubset(16);
    setLetters(newLetters);
    setBalloons(initBalloons(newLetters));
    setTarget(pickTarget(newLetters));
    setStatuses({});
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setGameOver(false);
    setPaused(false);
    setRoundId(n => n + 1);
  }

  function handleBalloonClick(balloon) {
    if (statuses[balloon.uid] || gameOver || paused || !started) return;
    if (checkAnswer(balloon.id, target.id)) {
      setStatuses(s => ({ ...s, [balloon.uid]: 'correct' }));
      setScore(n => n + 1);
      setTarget(pickTarget(letters));
      setTimeout(() => {
        setBalloons(bs => bs.map(b =>
          b.uid === balloon.uid ? createBalloon(letters.find(v => v.id === b.id), letters) : b
        ));
        setStatuses(s => { const n = { ...s }; delete n[balloon.uid]; return n; });
      }, 500);
    } else {
      setStatuses(s => ({ ...s, [balloon.uid]: 'wrong' }));
      setTimeout(() => {
        setStatuses(s => { const n = { ...s }; delete n[balloon.uid]; return n; });
      }, 700);
    }
  }

  if (!started) return <GameIntro onStart={handleStart} />;
  if (gameOver)  return (
    <EndScreen score={score} onPlayAgain={handlePlayAgain} onExit={() => navigate('/')} />
  );

  const timerColor = timeLeft <= 5 ? '#e74c3c' : timeLeft <= 10 ? '#e67e22' : '#27ae60';

  return (
    <div className="game-page">
      <header className="game-header">
        <h2 className="game-page-title">🎈 Balloon Pop</h2>
        <div className="game-stats">
          <span className="score-badge">⭐ {score}</span>
          <span
            className={`timer-badge${timeLeft <= 5 ? ' timer-badge--urgent' : ''}`}
            style={{ '--timer-color': timerColor }}
          >
            ⏱ {timeLeft}s
          </span>
          <button className="pause-btn" onClick={() => setPaused(true)} aria-label="Pause game">
            ⏸
          </button>
        </div>
      </header>

      <div className="prompt-area">
        <p className="prompt-text">Tap the balloon for the letter that matches the sound!</p>
        <button className="speak-btn" onClick={speak}>🔊 Hear it again</button>
      </div>

      <div className="balloon-field" data-paused={paused}>
        {CLOUDS.map((c, i) => (
          <div
            key={i}
            className="cloud"
            style={{
              '--cloud-top':   c.top,
              '--cloud-dur':   c.dur,
              '--cloud-delay': c.delay,
              width: c.w,
            }}
          />
        ))}
        {balloons.map(b => (
          <Balloon
            key={b.uid}
            {...b}
            status={statuses[b.uid] || 'idle'}
            onClick={() => handleBalloonClick(b)}
          />
        ))}
      </div>

      {paused && (
        <div className="pause-overlay">
          <div className="pause-card">
            <p className="pause-icon">⏸</p>
            <h2 className="pause-title">Game Paused</h2>
            <div className="pause-stats">
              <span>⭐ {score} points</span>
              <span>⏱ {timeLeft}s left</span>
            </div>
            <div className="pause-actions">
              <button className="pause-action-btn pause-action-btn--resume" onClick={() => setPaused(false)}>
                ▶ Resume
              </button>
              <button className="pause-action-btn pause-action-btn--exit" onClick={() => navigate('/')}>
                ← Exit to Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
