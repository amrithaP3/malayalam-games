import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Balloon from './Balloon'

const baseProps = {
  letter: 'ക',
  romanization: 'ka',
  color: '#FF6B6B',
  left: 20,
  duration: 12,
  delay: -6,
}

describe('Balloon', () => {
  it('renders the letter and applies the idle status class', () => {
    render(<Balloon {...baseProps} status="idle" onClick={() => {}} />)
    expect(screen.getByText('ക')).toBeInTheDocument()
    expect(screen.getByRole('button')).toHaveClass('balloon--idle')
  })

  it.each(['correct', 'wrong'])('applies the %s status class and disables the button', (status) => {
    render(<Balloon {...baseProps} status={status} onClick={() => {}} />)
    const button = screen.getByRole('button')
    expect(button).toHaveClass(`balloon--${status}`)
    expect(button).toBeDisabled()
  })

  it('calls onClick with the balloon center coordinates', () => {
    const onClick = vi.fn()
    render(<Balloon {...baseProps} status="idle" onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
    const [x, y] = onClick.mock.calls[0]
    expect(typeof x).toBe('number')
    expect(typeof y).toBe('number')
  })
})
