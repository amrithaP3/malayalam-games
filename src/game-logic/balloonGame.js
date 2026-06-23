const _audioFiles = import.meta.glob('../assets/balloonAudio/*.m4a', {
  query: '?url',
  import: 'default',
  eager: true,
})

const audioMap = Object.fromEntries(
  Object.entries(_audioFiles).map(([path, url]) => {
    const letter = decodeURIComponent(path.split('/').pop().replace('.m4a', ''))
    return [letter, url]
  })
)

let _currentAudio = null
export function playLetterAudio(letter) {
  if (_currentAudio) {
    _currentAudio.pause()
    _currentAudio.currentTime = 0
  }
  const url = audioMap[letter]
  if (url) {
    _currentAudio = new Audio(url)
    _currentAudio.play()
  }
}

export function stopAudio() {
  if (_currentAudio) {
    _currentAudio.pause()
    _currentAudio.currentTime = 0
    _currentAudio = null
  }
}

export function playSuccessSound() {
  try {
    const AudioCtx = window.AudioContext || /** @type {typeof AudioContext} */ (window['webkitAudioContext'])
    const ctx = new AudioCtx()
    const notes = [523.25, 659.25, 783.99, 1046.5] // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      osc.type = 'sine'
      const t = ctx.currentTime + i * 0.09
      gain.gain.setValueAtTime(0.28, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22)
      osc.start(t)
      osc.stop(t + 0.25)
    })
  } catch (_) {}
}

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#9B59B6', '#F39C12',
  '#2ECC71', '#E91E63', '#FF9800', '#00BCD4', '#8BC34A',
  '#FF5722', '#607D8B', '#9C27B0', '#03A9F4', '#4CAF50',
  '#FFC107', '#F44336', '#3F51B5',
]

export const ALL_LETTERS = [
  // Vowels
  { id: 'a',    letter: 'അ',  romanization: 'a',    type: 'vowel' },
  { id: 'aa',   letter: 'ആ',  romanization: 'aa',   type: 'vowel' },
  { id: 'i',    letter: 'ഇ',  romanization: 'i',    type: 'vowel' },
  { id: 'ii',   letter: 'ഈ',  romanization: 'ii',   type: 'vowel' },
  { id: 'u',    letter: 'ഉ',  romanization: 'u',    type: 'vowel' },
  { id: 'uu',   letter: 'ഊ',  romanization: 'uu',   type: 'vowel' },
  { id: 'ri',   letter: 'ഋ',  romanization: 'ri',   type: 'vowel' },
  { id: 'e',    letter: 'എ',  romanization: 'e',    type: 'vowel' },
  { id: 'ee',   letter: 'ഏ',  romanization: 'ee',   type: 'vowel' },
  { id: 'ai',   letter: 'ഐ',  romanization: 'ai',   type: 'vowel' },
  { id: 'o',    letter: 'ഒ',  romanization: 'o',    type: 'vowel' },
  { id: 'oo',   letter: 'ഓ',  romanization: 'oo',   type: 'vowel' },
  { id: 'au',   letter: 'ഔ',  romanization: 'au',   type: 'vowel' },
  { id: 'am',   letter: 'അം', romanization: 'am',   type: 'vowel' },
  // Consonants
  { id: 'ka',   letter: 'ക',  romanization: 'ka',   type: 'consonant' },
  { id: 'kha',  letter: 'ഖ',  romanization: 'kha',  type: 'consonant' },
  { id: 'ga',   letter: 'ഗ',  romanization: 'ga',   type: 'consonant' },
  { id: 'gha',  letter: 'ഘ',  romanization: 'gha',  type: 'consonant' },
  { id: 'nga',  letter: 'ങ',  romanization: 'nga',  type: 'consonant' },
  { id: 'cha',  letter: 'ച',  romanization: 'cha',  type: 'consonant' },
  { id: 'chha', letter: 'ഛ',  romanization: 'chha', type: 'consonant' },
  { id: 'ja',   letter: 'ജ',  romanization: 'ja',   type: 'consonant' },
  { id: 'jha',  letter: 'ഝ',  romanization: 'jha',  type: 'consonant' },
  { id: 'nya',  letter: 'ഞ',  romanization: 'nya',  type: 'consonant' },
  { id: 'tta',  letter: 'ട',  romanization: 'tta',  type: 'consonant' },
  { id: 'ttha', letter: 'ഠ',  romanization: 'ttha', type: 'consonant' },
  { id: 'dda',  letter: 'ഡ',  romanization: 'dda',  type: 'consonant' },
  { id: 'ddha', letter: 'ഢ',  romanization: 'ddha', type: 'consonant' },
  { id: 'nna',  letter: 'ണ',  romanization: 'nna',  type: 'consonant' },
  { id: 'tha',  letter: 'ത',  romanization: 'tha',  type: 'consonant' },
  { id: 'thha', letter: 'ഥ',  romanization: 'thha', type: 'consonant' },
  { id: 'da',   letter: 'ദ',  romanization: 'da',   type: 'consonant' },
  { id: 'dha',  letter: 'ധ',  romanization: 'dha',  type: 'consonant' },
  { id: 'na',   letter: 'ന',  romanization: 'na',   type: 'consonant' },
  { id: 'pa',   letter: 'പ',  romanization: 'pa',   type: 'consonant' },
  { id: 'pha',  letter: 'ഫ',  romanization: 'pha',  type: 'consonant' },
  { id: 'ba',   letter: 'ബ',  romanization: 'ba',   type: 'consonant' },
  { id: 'bha',  letter: 'ഭ',  romanization: 'bha',  type: 'consonant' },
  { id: 'ma',   letter: 'മ',  romanization: 'ma',   type: 'consonant' },
  { id: 'ya',   letter: 'യ',  romanization: 'ya',   type: 'consonant' },
  { id: 'ra',   letter: 'ര',  romanization: 'ra',   type: 'consonant' },
  { id: 'rra',  letter: 'റ',  romanization: 'rra',  type: 'consonant' },
  { id: 'la',   letter: 'ല',  romanization: 'la',   type: 'consonant' },
  { id: 'lla',  letter: 'ള',  romanization: 'lla',  type: 'consonant' },
  { id: 'zha',  letter: 'ഴ',  romanization: 'zha',  type: 'consonant' },
  { id: 'va',   letter: 'വ',  romanization: 'va',   type: 'consonant' },
  { id: 'sha',  letter: 'ശ',  romanization: 'sha',  type: 'consonant' },
  { id: 'shha', letter: 'ഷ',  romanization: 'shha', type: 'consonant' },
  { id: 'sa',   letter: 'സ',  romanization: 'sa',   type: 'consonant' },
  { id: 'ha',   letter: 'ഹ',  romanization: 'ha',   type: 'consonant' },
].map((l, i) => ({ ...l, color: COLORS[i % COLORS.length] }))

export function pickSubset(n = 16) {
  return [...ALL_LETTERS].sort(() => Math.random() - 0.5).slice(0, n)
}

export function pickTarget(letters) {
  return letters[Math.floor(Math.random() * letters.length)]
}

export function checkAnswer(balloonId, targetId) {
  return balloonId === targetId
}

export function getStars(score) {
  if (score >= 10) return 3;
  if (score >= 5)  return 2;
  if (score >= 1)  return 1;
  return 0;
}
