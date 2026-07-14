import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TodayFab } from '@/features/calendar/components/today-fab'

describe('TodayFab', () => {
  afterEach(() => localStorage.clear())

  it('returns to today on a regular click', async () => {
    const onToday = vi.fn()
    const user = userEvent.setup()
    render(<TodayFab onToday={onToday} />)

    await user.click(screen.getByRole('button', { name: '回到今天' }))
    expect(onToday).toHaveBeenCalledOnce()
  })

  it('persists a drag without triggering the click action', () => {
    const onToday = vi.fn()
    render(<TodayFab onToday={onToday} />)
    const button = screen.getByRole('button', { name: '回到今天' })
    Object.defineProperty(button, 'setPointerCapture', { value: vi.fn() })

    fireEvent(button, new MouseEvent('pointerdown', { bubbles: true, clientX: 900, clientY: 600 }))
    fireEvent(button, new MouseEvent('pointermove', { bubbles: true, clientX: 760, clientY: 500 }))
    fireEvent(button, new MouseEvent('pointerup', { bubbles: true, clientX: 760, clientY: 500 }))
    fireEvent.click(button)

    expect(onToday).not.toHaveBeenCalled()
    expect(JSON.parse(localStorage.getItem('rike-today-fab-position') ?? 'null')).toEqual(
      expect.objectContaining({ x: expect.any(Number), y: expect.any(Number) }),
    )
  })
})
