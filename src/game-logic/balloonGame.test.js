import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  ALL_LETTERS, FIXED_DURATION,
  pickSubset, createBalloon, initBalloons, replaceBalloon,
  pickVisibleTarget, checkAnswer, getStars,
} from './balloonGame'

beforeEach(() => {
  vi.stubGlobal('innerWidth', 1000)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('getStars', () => {
  it.each([
    [0, 0], [1, 1], [4, 1], [5, 2], [9, 2], [10, 3], [20, 3],
  ])('score %i -> %i stars', (score, expected) => {
    expect(getStars(score)).toBe(expected)
  })
})

describe('checkAnswer', () => {
  it('returns true when ids match', () => {
    expect(checkAnswer('ka', 'ka')).toBe(true)
  })
  it('returns false when ids differ', () => {
    expect(checkAnswer('ka', 'kha')).toBe(false)
  })
})

describe('ALL_LETTERS', () => {
  it('has exactly 50 entries', () => {
    expect(ALL_LETTERS).toHaveLength(50)
  })
  it('has unique ids', () => {
    const ids = ALL_LETTERS.map(l => l.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('has unique letter glyphs', () => {
    const glyphs = ALL_LETTERS.map(l => l.letter)
    expect(new Set(glyphs).size).toBe(glyphs.length)
  })
})

describe('pickSubset', () => {
  it('returns the requested number of letters', () => {
    expect(pickSubset(8)).toHaveLength(8)
  })
  it('returns unique letters drawn from ALL_LETTERS', () => {
    const subset = pickSubset(16)
    const allIds = new Set(ALL_LETTERS.map(l => l.id))
    const subsetIds = subset.map(l => l.id)
    expect(new Set(subsetIds).size).toBe(subsetIds.length)
    subsetIds.forEach(id => expect(allIds.has(id)).toBe(true))
  })
})

describe('createBalloon', () => {
  const letter = ALL_LETTERS[0]

  it('sets duration to FIXED_DURATION', () => {
    const b = createBalloon(letter, 0, 4, 100)
    expect(b.duration).toBe(FIXED_DURATION)
  })

  it('derives delay from progressOverride', () => {
    const b = createBalloon(letter, 0, 4, 100, 0.5)
    expect(b.delay).toBe(-(FIXED_DURATION * 0.5))
  })

  it('places the balloon within its lane band', () => {
    const totalLanes = 4
    const laneIndex = 1
    const balloonW = 100
    const laneW = 82 / totalLanes
    const laneStart = 6 + laneIndex * laneW
    const balloonWPct = (balloonW / window.innerWidth) * 100
    const offset = Math.max(laneW - balloonWPct - 0.5, 0)

    const b = createBalloon(letter, laneIndex, totalLanes, balloonW)
    expect(b.left).toBeGreaterThanOrEqual(laneStart)
    expect(b.left).toBeLessThanOrEqual(laneStart + offset)
  })
})

describe('initBalloons', () => {
  it('returns one balloon per letter, in order, with sequential laneIndex', () => {
    const letters = pickSubset(6)
    const balloons = initBalloons(letters, 100)
    expect(balloons).toHaveLength(6)
    balloons.forEach((b, i) => {
      expect(b.laneIndex).toBe(i)
      expect(b.id).toBe(letters[i].id)
    })
  })

  it('assigns delays matching a shuffled evenly-spaced progression', () => {
    const n = 5
    const letters = pickSubset(n)
    const balloons = initBalloons(letters, 100)
    const expectedDelays = Array.from({ length: n }, (_, i) => -(FIXED_DURATION * (i / n)))
      .sort((a, b) => a - b)
    const actualDelays = balloons.map(b => b.delay).sort((a, b) => a - b)
    expectedDelays.forEach((d, i) => {
      expect(actualDelays[i]).toBeCloseTo(d, 10)
    })
  })
})

describe('replaceBalloon', () => {
  it('always resets delay to 0', () => {
    const oldBalloon = { laneIndex: 2, delay: -6 }
    const newBalloon = replaceBalloon(oldBalloon, ALL_LETTERS[3], 100, 4)
    expect(newBalloon.delay).toBe(0)
  })

  it('carries over the lane index from the old balloon', () => {
    const oldBalloon = { laneIndex: 3, delay: -9 }
    const newBalloon = replaceBalloon(oldBalloon, ALL_LETTERS[5], 100, 8)
    expect(newBalloon.laneIndex).toBe(3)
  })

  it('assigns a fresh uid', () => {
    const oldBalloon = { uid: 'abc123', laneIndex: 0, delay: 0 }
    const newBalloon = replaceBalloon(oldBalloon, ALL_LETTERS[1], 100, 8)
    expect(newBalloon.uid).not.toBe(oldBalloon.uid)
  })
})

describe('pickVisibleTarget', () => {
  const NOW = 1_700_000_000_000

  function makeBalloon(id, progressFraction) {
    return {
      id,
      startedAt: NOW - progressFraction * FIXED_DURATION * 1000,
      delay: 0,
      duration: FIXED_DURATION,
    }
  }

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
  })

  it('picks the balloon closest to 45% progress within the 30-65% window', () => {
    const balloons = [
      makeBalloon('too-early', 0.1),
      makeBalloon('close', 0.5),
      makeBalloon('closer', 0.46),
      makeBalloon('too-late', 0.9),
    ]
    expect(pickVisibleTarget(balloons).id).toBe('closer')
  })

  it('falls back to the full balloon set when none are in the 30-65% window', () => {
    const balloons = [makeBalloon('early', 0.05), makeBalloon('late', 0.95)]
    const target = pickVisibleTarget(balloons)
    expect(['early', 'late']).toContain(target.id)
  })
})
