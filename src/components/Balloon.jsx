export default function Balloon({ letter, romanization, color, status, left, duration, delay, onClick }) {
  return (
    <div
      className={`balloon-wrapper${status === 'correct' ? ' balloon-wrapper--correct' : ''}`}
      style={{
        '--rise-dur':   `${duration}s`,
        '--rise-delay': `${delay}s`,
        left: `${left}%`,
      }}
    >
      <button
        className={`balloon balloon--${status}`}
        style={{ '--balloon-color': color }}
        onClick={onClick}
        disabled={status !== 'idle'}
        aria-label={`Balloon: ${romanization}`}
      >
        <span className="balloon-letter">{letter}</span>
      </button>
      <div className="balloon-string" />
    </div>
  );
}
