import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Balloon from '../components/Balloon';
import GameIntro from '../components/GameIntro';
import EndScreen from '../components/EndScreen';
import { ALL_LETTERS, pickSubset, pickTarget, playLetterAudio, stopAudio, playSuccessSound, checkAnswer } from '../game-logic/balloonGame';

const GAME_DURATION = 60;
const LETTER_COUNT  = 8;

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

// utility function to get width of balloon based on letter count
function getBalloonW(letterCount) {
  return Math.min(150, Math.floor(window.innerWidth * 0.78 / letterCount));
}

function createBalloon(letter, laneIndex, totalLanes, balloonW, minProgress = 0.3) {
  const laneW = 82 / totalLanes;
  const laneStart = 6 + laneIndex * laneW;
  const balloonWPct = balloonW / window.innerWidth * 100;
  const offset = Math.max(laneW - balloonWPct - 0.5, 0);
  const duration = 8 + Math.random() * 7;
  return {
    uid:       Math.random().toString(36).slice(2),
    ...letter,
    laneIndex,
    left:      laneStart + Math.random() * offset,
    duration,
    delay:     -(duration * (minProgress + Math.random() * (1 - minProgress))),
    startedAt: Date.now(),
  };
}

function initBalloons(letters, balloonW) {
  return letters.map((v, i) => createBalloon(v, i, letters.length, balloonW));
}

function pickVisibleTarget(letters, balloons) {
  const now = Date.now();
  const getProgress = b => {
    const elapsed = (now - b.startedAt) + Math.abs(b.delay) * 1000;
    return (elapsed % (b.duration * 1000)) / (b.duration * 1000);
  };
  const safe = balloons.filter(b => {
    const p = getProgress(b);
    return p > 0.08 && p < 0.60;
  });
  const pool = safe.length > 0
    ? safe
    : [balloons.slice().sort((a, b) => getProgress(a) - getProgress(b))[0]];
  const chosen = pool[Math.floor(Math.random() * pool.length)];
  return letters.find(l => l.id === chosen.id);
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
  const [letters,  setLetters]  = useState(() => pickSubset(LETTER_COUNT));
  const [started,  setStarted]  = useState(false);
  const [paused,   setPaused]   = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [balloons, setBalloons] = useState(() => {
    const bw = getBalloonW(letters.length);
    return initBalloons(letters, bw);
  });
  const [target,   setTarget]   = useState(() => pickTarget(letters));
  const [statuses, setStatuses] = useState({});
  const [score,    setScore]    = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [roundId,  setRoundId]  = useState(0);
  const [bursts,   setBursts]   = useState([]);

  const balloonW = getBalloonW(LETTER_COUNT);

  // Timer logic
  useEffect(() => {
    if (!started || paused || gameOver) return;
    if (timeLeft <= 0) { setGameOver(true); return; }
    const t = setTimeout(() => setTimeLeft(n => n - 1), 1000);
    return () => clearTimeout(t);
  }, [started, paused, gameOver, timeLeft]);

  useEffect(() => { if (gameOver) stopAudio(); }, [gameOver]);

  // Audio logic - plays any time a new round starts (correct answer or new letter set) after a 350 ms delay
  // watches roundId mainly
  const speak = useCallback(() => playLetterAudio(target.letter), [target]);
  useEffect(() => {
    if (!started || paused || gameOver) return;
    const t = setTimeout(speak, 350);
    return () => clearTimeout(t);
  }, [speak, started, paused, gameOver, roundId]);

  function handleStart() { setStarted(true); }

  function handlePlayAgain() {
    const newLetters = pickSubset(LETTER_COUNT);
    const newBalloonW = getBalloonW(newLetters.length);
    setLetters(newLetters);
    setBalloons(initBalloons(newLetters, newBalloonW));
    setTarget(pickTarget(newLetters));
    setStatuses({});
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setGameOver(false);
    setPaused(false);
    setRoundId(n => n + 1);
    setBursts([]);
  }

  function handleBalloonClick(balloon, burstX, burstY) {
    if (statuses[balloon.uid] || gameOver || paused || !started) return;
    if (checkAnswer(balloon.id, target.id)) {
      setStatuses(s => ({ ...s, [balloon.uid]: 'correct' }));
      setScore(n => n + 1);
      playSuccessSound();

      // Spawn fixed-position burst at click location
      const burstId = balloon.uid;
      setBursts(prev => [...prev, { id: burstId, x: burstX, y: burstY }]);
      setTimeout(() => setBursts(prev => prev.filter(b => b.id !== burstId)), 650);

      setTimeout(() => {
        const remainingLetters = letters.filter(l => l.id !== balloon.id);
        const remainingBalloons = balloons.filter(b => b.uid !== balloon.uid);

        if (remainingLetters.length === 0) {
          // All popped — refresh with a brand new round
          const newLetters = pickSubset(LETTER_COUNT);
          setLetters(newLetters);
          setBalloons(initBalloons(newLetters, balloonW));
          setTarget(pickTarget(newLetters));
          setStatuses({});
        } else if (remainingBalloons.length < 5) {
          // Too few balloons — add fresh letters into the vacant lanes, leave remaining in place
          const activeIds = new Set(remainingLetters.map(l => l.id));
          const fresh = ALL_LETTERS
            .filter(l => !activeIds.has(l.id))
            .sort(() => Math.random() - 0.5)
            .slice(0, 4);
          const occupiedLanes = new Set(remainingBalloons.map(b => b.laneIndex));
          const vacantLanes = Array.from({ length: LETTER_COUNT }, (_, i) => i)
            .filter(i => !occupiedLanes.has(i))
            .sort(() => Math.random() - 0.5);
          const freshToAdd = fresh.slice(0, vacantLanes.length);
          const newBalloons = freshToAdd.map((l, i) =>
            createBalloon(l, vacantLanes[i], LETTER_COUNT, balloonW, 0.5)
          );
          const allLetters = [...remainingLetters, ...freshToAdd];
          const allBalloons = [...remainingBalloons, ...newBalloons];
          setLetters(allLetters);
          setBalloons(allBalloons);
          setStatuses(s => { const n = { ...s }; delete n[balloon.uid]; return n; });
          setTarget(pickVisibleTarget(allLetters, allBalloons));
        } else {
          // Normal pop — remove balloon, pick next target from remaining
          setBalloons(remainingBalloons);
          setStatuses(s => { const n = { ...s }; delete n[balloon.uid]; return n; });
          setLetters(remainingLetters);
          setTarget(pickVisibleTarget(remainingLetters, remainingBalloons));
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

      {/* Burst confetti — position:fixed so parent transforms can't interfere */}
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
