import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Balloon from '../components/Balloon';
import GameIntro from '../components/GameIntro';
import EndScreen from '../components/EndScreen';
import {
  ALL_LETTERS, pickSubset, playLetterAudio, stopAudio,
  playSuccessSound, checkAnswer,
  initBalloons, replaceBalloon, pickVisibleTarget,
} from '../game-logic/balloonGame';

const GAME_DURATION = 60;
const LETTER_COUNT  = 8;
const BALLOON_ONLY  = import.meta.env.VITE_BALLOON_ONLY === 'true';

const BURST = [
  { color: '#FF6B6B', angle: 0   },
  { color: '#4ECDC4', angle: 45  },
  { color: '#45B7D1', angle: 90  },
  { color: '#F39C12', angle: 135 },
  { color: '#9B59B6', angle: 180 },
  { color: '#2ECC71', angle: 225 },
  { color: '#E91E63', angle: 270 },
  { color: '#FF9800', angle: 315 },
];

function getBalloonW(letterCount) {
  return Math.min(150, Math.floor(window.innerWidth * 0.78 / letterCount));
}

const CLOUDS = [
  { w: 140, h: 44, top: '7%',  dur: '35s', delay:  '0s',  opacity: 0.88 },
  { w:  90, h: 34, top: '19%', dur: '50s', delay: '-16s',  opacity: 0.72 },
  { w: 165, h: 50, top: '3%',  dur: '27s', delay: '-22s',  opacity: 0.82 },
  { w:  75, h: 30, top: '28%', dur: '58s', delay: '-40s',  opacity: 0.65 },
  { w: 120, h: 40, top: '13%', dur: '42s', delay:  '-8s',  opacity: 0.78 },
  { w:  65, h: 26, top: '23%', dur: '64s', delay: '-48s',  opacity: 0.60 },
];

export default function BalloonGame() {
  const navigate = useNavigate();

  const [gameState] = useState(() => {
    const bw = getBalloonW(LETTER_COUNT);
    const subset = pickSubset(LETTER_COUNT);
    const bs = initBalloons(subset, bw);
    const tb = pickVisibleTarget(bs);
    return { initialBalloons: bs, initialTarget: tb };
  });

  const [balloons,     setBalloons]     = useState(gameState.initialBalloons);
  const [target,       setTarget]       = useState(() => ({
    id: gameState.initialTarget.id,
    letter: gameState.initialTarget.letter,
    romanization: gameState.initialTarget.romanization,
    color: gameState.initialTarget.color,
  }));
  const [usedLetterIds, setUsedLetterIds] = useState(() => new Set());
  const [started,      setStarted]      = useState(false);
  const [paused,       setPaused]       = useState(false);
  const [gameOver,     setGameOver]     = useState(false);
  const [statuses,     setStatuses]     = useState({});
  const [score,        setScore]        = useState(0);
  const [timeLeft,     setTimeLeft]     = useState(GAME_DURATION);
  const [roundId,      setRoundId]      = useState(0);
  const [bursts,       setBursts]       = useState([]);

  const balloonW = getBalloonW(LETTER_COUNT);

  // Timer
  useEffect(() => {
    if (!started || paused || gameOver) return;
    if (timeLeft <= 0) { setGameOver(true); return; }
    const t = setTimeout(() => setTimeLeft(n => n - 1), 1000);
    return () => clearTimeout(t);
  }, [started, paused, gameOver, timeLeft]);

  useEffect(() => { if (gameOver) stopAudio(); }, [gameOver]);
  useEffect(() => { if (paused) stopAudio(); }, [paused]);

  // Stop audio on unmount (e.g. browser back button, not just in-app exit buttons)
  useEffect(() => () => stopAudio(), []);

  // Audio — fires 350ms after each new round
  const speak = useCallback(() => playLetterAudio(target.letter), [target]);
  useEffect(() => {
    if (!started || paused || gameOver) return;
    const t = setTimeout(speak, 350);
    return () => clearTimeout(t);
  }, [speak, started, paused, gameOver, roundId]);

  function handleStart() { setStarted(true); }

  function handlePlayAgain() {
    const newLetters = pickSubset(LETTER_COUNT);
    const newBalloons = initBalloons(newLetters, balloonW);
    const tb = pickVisibleTarget(newBalloons);
    setBalloons(newBalloons);
    setTarget({ id: tb.id, letter: tb.letter, romanization: tb.romanization, color: tb.color });
    setUsedLetterIds(new Set());
    setStatuses({});
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setGameOver(false);
    setPaused(false);
    setRoundId(n => n + 1);
    setBursts([]);
  }

  function handleExit() {
    stopAudio();
    if (BALLOON_ONLY) {
      handlePlayAgain();
      setStarted(false);
    } else {
      navigate('/');
    }
  }

  function handleBalloonClick(balloon, burstX, burstY) {
    if (statuses[balloon.uid] || gameOver || paused || !started) return;

    if (checkAnswer(balloon.id, target.id)) {
      setStatuses(s => ({ ...s, [balloon.uid]: 'correct' }));
      setScore(n => n + 1);
      playSuccessSound();

      const burstId = balloon.uid;
      setBursts(prev => [...prev, { id: burstId, x: burstX, y: burstY }]);
      setTimeout(() => setBursts(prev => prev.filter(b => b.id !== burstId)), 650);

      setTimeout(() => {
        const newUsedIds = new Set(usedLetterIds);
        newUsedIds.add(balloon.id);

        if (newUsedIds.size >= ALL_LETTERS.length) {
          // All 50 letters cycled through — full reset (keep score & timer)
          const newLetters = pickSubset(LETTER_COUNT);
          const newBalloons = initBalloons(newLetters, balloonW);
          const tb = pickVisibleTarget(newBalloons);
          setBalloons(newBalloons);
          setTarget({ id: tb.id, letter: tb.letter, romanization: tb.romanization, color: tb.color });
          setStatuses({});
          setUsedLetterIds(new Set());
        } else {
          // Replace popped slot in-place with a fresh letter
          const activeIds = new Set(balloons.map(b => b.id));
          const pool = ALL_LETTERS.filter(l => !activeIds.has(l.id));
          const newLetter = pool[Math.floor(Math.random() * pool.length)];
          const newBalloon = replaceBalloon(balloon, newLetter, balloonW, LETTER_COUNT);
          const updatedBalloons = balloons.map(b => b.uid === balloon.uid ? newBalloon : b);
          const tb = pickVisibleTarget(updatedBalloons);
          setBalloons(updatedBalloons);
          setTarget({ id: tb.id, letter: tb.letter, romanization: tb.romanization, color: tb.color });
          setStatuses(s => { const n = { ...s }; delete n[balloon.uid]; return n; });
          setUsedLetterIds(newUsedIds);
        }

        setRoundId(n => n + 1);
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
    <EndScreen score={score} onPlayAgain={handlePlayAgain} onExit={handleExit} />
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

      <div
        className="balloon-field"
        data-paused={paused}
        style={{ '--balloon-w': `${balloonW}px` }}
      >
        {CLOUDS.map((c, i) => (
          <div
            key={i}
            className="cloud"
            style={{
              '--cloud-top':   c.top,
              '--cloud-dur':   c.dur,
              '--cloud-delay': c.delay,
              width:   c.w,
              height:  c.h,
              opacity: c.opacity,
            }}
          >
            <div className="cloud-puff cloud-puff--a" />
            <div className="cloud-puff cloud-puff--b" />
            <div className="cloud-puff cloud-puff--c" />
          </div>
        ))}
        {balloons.map(b => (
          <Balloon
            key={b.uid}
            {...b}
            status={statuses[b.uid] || 'idle'}
            onClick={(x, y) => handleBalloonClick(b, x, y)}
          />
        ))}
      </div>

      {bursts.map(burst => (
        <div
          key={burst.id}
          className="burst-container"
          style={{ '--bx': `${burst.x}px`, '--by': `${burst.y}px` }}
        >
          {BURST.map((p, i) => (
            <span
              key={i}
              className="burst-particle"
              style={{
                '--p-color': p.color,
                '--px': `${Math.cos(p.angle * Math.PI / 180) * 70}px`,
                '--py': `${Math.sin(p.angle * Math.PI / 180) * 70}px`,
              }}
            />
          ))}
        </div>
      ))}

      <div className="prompt-area">
        <p className="prompt-text">Tap the balloon for the letter that matches the sound!</p>
        <button className="speak-btn" onClick={speak}>🔊 Hear it again</button>
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
              <button className="pause-action-btn pause-action-btn--exit" onClick={handleExit}>
                ← Exit to Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
