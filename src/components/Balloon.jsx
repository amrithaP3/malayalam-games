export default function Balloon({ letter, romanization, color, status, left, duration, delay, onClick }) {
  return (
    <div
      className={`balloon-wrapper${status === 'correct' ? ' balloon-wrapper--correct' : ''}`}
      style={{
        // custom CSS properties to know when and how fast each balloon rises
        '--rise-dur':   `${duration}s`,
        '--rise-delay': `${delay}s`,
        left: `${left}%`,
      }}
    >
      <button
        className={`balloon balloon--${status}`}
        style={{ '--balloon-color': color }}
        onClick={(e) => {
          // getBoundingClientRect gets balloon's position on screen
          const rect = e.currentTarget.getBoundingClientRect();
          // Get center position of balloon and send coordinates back up to parent with onClick
          onClick(rect.left + rect.width / 2, rect.top + rect.height / 2);
        }}
        disabled={status !== 'idle'}
        // accessibility feature telling screen readers what the balloon says (romanization)
        aria-label={`Balloon: ${romanization}`}
      >
        {/* the string displayed on the balloon */}
        <span className="balloon-letter">{letter}</span>
      </button>
      <div className="balloon-string" />
    </div>
  );
}
