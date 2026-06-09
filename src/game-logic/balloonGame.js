export const VOWELS = [
  { id: 'a',  letter: 'അ', romanization: 'a',  color: '#FF6B6B' },
  { id: 'aa', letter: 'ആ', romanization: 'aa', color: '#4ECDC4' },
  { id: 'i',  letter: 'ഇ', romanization: 'i',  color: '#45B7D1' },
  { id: 'ii', letter: 'ഈ', romanization: 'ii', color: '#9B59B6' },
  { id: 'u',  letter: 'ഉ', romanization: 'u',  color: '#F39C12' },
];

export function pickTarget(vowels = VOWELS) {
  return vowels[Math.floor(Math.random() * vowels.length)];
}

// Returns shuffled balloons with staggered float animation delays
export function generateBalloons(vowels = VOWELS) {
  return [...vowels]
    .sort(() => Math.random() - 0.5)
    .map((v, i) => ({ ...v, animDelay: `${(i * 0.35).toFixed(2)}s` }));
}

export function speakLetter(letter) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(letter);
  utter.lang = 'ml-IN';
  utter.rate = 0.75;
  utter.pitch = 1.1;
  window.speechSynthesis.speak(utter);
}

export function checkAnswer(balloonId, targetId) {
  return balloonId === targetId;
}
