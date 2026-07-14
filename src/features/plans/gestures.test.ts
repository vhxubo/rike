import {
  canStartDateSwipe,
  getDateSwipeAmount,
  getPinchZoomDirection,
  getWheelZoomDirection,
  getZoomedView,
} from '@/features/plans/gestures'

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

describe('calendar zoom intent', () => {
  it('moves one view level without wrapping', () => {
    expect(getZoomedView('day', 'out')).toBe('week')
    expect(getZoomedView('week', 'out')).toBe('month')
    expect(getZoomedView('month', 'out')).toBe('month')
    expect(getZoomedView('month', 'in')).toBe('week')
    expect(getZoomedView('day', 'in')).toBe('day')
  })

  it('recognizes pinch and trackpad directions after a threshold', () => {
    expect(getPinchZoomDirection(100, 150)).toBe('in')
    expect(getPinchZoomDirection(100, 50)).toBe('out')
    expect(getPinchZoomDirection(100, 120)).toBeNull()
    expect(getWheelZoomDirection(-70)).toBe('in')
    expect(getWheelZoomDirection(70)).toBe('out')
  })
})
