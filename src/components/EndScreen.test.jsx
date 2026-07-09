import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import EndScreen from './EndScreen'

describe('EndScreen', () => {
  it.each([
    [0, 0], [3, 1], [7, 2], [10, 3],
  ])('shows %i out of 3 stars for a score of %i', (score, stars) => {
    render(<EndScreen score={score} onPlayAgain={() => {}} onExit={() => {}} />)
    expect(screen.getByLabelText(`${stars} out of 3 stars`)).toBeInTheDocument()
  })

  it('calls onExit when the exit button is clicked', () => {
    const onExit = vi.fn()
    render(<EndScreen score={0} onPlayAgain={() => {}} onExit={onExit} />)
    fireEvent.click(screen.getByText('← Exit'))
    expect(onExit).toHaveBeenCalledTimes(1)
  })

  it('calls onPlayAgain when the play again button is clicked', () => {
    const onPlayAgain = vi.fn()
    render(<EndScreen score={0} onPlayAgain={onPlayAgain} onExit={() => {}} />)
    fireEvent.click(screen.getByText('Play Again ↩'))
    expect(onPlayAgain).toHaveBeenCalledTimes(1)
  })
})
