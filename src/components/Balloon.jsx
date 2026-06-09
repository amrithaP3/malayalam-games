export default function Balloon({ letter, romanization, color, status, animDelay, onClick }) {
  return (
    <div
      className={`balloon-wrapper balloon-wrapper--${status}`}
      style={{ animationDelay: animDelay }}
    >
      <button
        className={`balloon balloon--${status}`}
        style={{ '--balloon-color': color }}
        onClick={onClick}
        disabled={status !== 'idle'}
        aria-label={`Balloon: ${romanization}`}
      >
        <span className="balloon-letter">{letter}</span>
        <span className="balloon-roman">{romanization}</span>
      </button>
      <div className="balloon-string" />
    </div>
  );
}
