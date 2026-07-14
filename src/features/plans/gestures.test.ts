import { canStartDateSwipe, getDateSwipeAmount } from '@/features/plans/gestures'

describe('date swipe intent', () => {
  it('maps sufficient horizontal movement or velocity to a date change', () => {
    expect(getDateSwipeAmount(-80, 0)).toBe(1)
    expect(getDateSwipeAmount(80, 0)).toBe(-1)
    expect(getDateSwipeAmount(-10, -600)).toBe(1)
    expect(getDateSwipeAmount(10, 200)).toBe(0)
  })

  it('only starts from non-interactive elements', () => {
    const surface = document.createElement('div')
    const input = document.createElement('input')
    const button = document.createElement('button')

    surface.append(input, button)

    expect(canStartDateSwipe(surface)).toBe(true)
    expect(canStartDateSwipe(input)).toBe(false)
    expect(canStartDateSwipe(button)).toBe(false)
  })
})
