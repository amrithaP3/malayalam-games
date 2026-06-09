import { useState } from 'react';

export default function CertificateModal({ score, onClose }) {
  const [name, setName] = useState('');

  const stars = score >= 10 ? 3 : score >= 5 ? 2 : score >= 1 ? 1 : 0;
  const date  = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close">✕</button>

        <div className="cert-name-row">
          <label htmlFor="cert-name" className="cert-name-label">
            Your name on the certificate:
          </label>
          <input
            id="cert-name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter your name"
            className="cert-name-input"
          />
        </div>

        {/* The element that gets printed */}
        <div className="certificate">
          <div className="cert-inner">
            <p className="cert-heading">✦ CERTIFICATE OF ACHIEVEMENT ✦</p>
            <div className="cert-balloon-icon">🎈</div>
            <p className="cert-game-title">amma-games</p>
            <p className="cert-game-subtitle">Malayalam Letters · Balloon Pop</p>
            <div className="cert-rule" />
            <p className="cert-presents-text">This certifies that</p>
            <p className="cert-recipient">{name || '___________________________'}</p>
            <p className="cert-presents-text">scored</p>
            <p className="cert-big-score">{score}</p>
            <p className="cert-presents-text">points</p>
            <p className="cert-stars-row">{'★'.repeat(stars)}{'☆'.repeat(3 - stars)}</p>
            <p className="cert-date">{date}</p>
          </div>
        </div>

        <button className="cert-print-btn" onClick={() => window.print()}>
          🖨️ Save / Print Certificate
        </button>
      </div>
    </div>
  );
}
