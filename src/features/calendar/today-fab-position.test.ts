import {
  clampFabPosition,
  DEFAULT_FAB_POSITION,
  isNormalizedFabPosition,
  normalizeFabPosition,
} from '@/features/calendar/today-fab-position'

describe('today FAB position', () => {
  it('validates normalized positions', () => {
    expect(isNormalizedFabPosition(DEFAULT_FAB_POSITION)).toBe(true)
    expect(isNormalizedFabPosition({ x: 2, y: 0.5 })).toBe(false)
    expect(isNormalizedFabPosition({ x: Number.NaN, y: 0.5 })).toBe(false)
  })

  it('clamps pixels below the header and inside screen edges', () => {
    expect(clampFabPosition({ x: 0, y: 0 }, 320, 640)).toEqual({ left: 12, top: 84 })
    expect(clampFabPosition({ x: 1, y: 1 }, 320, 640)).toEqual({ left: 260, top: 580 })
  })

  it('normalizes restored pixel positions', () => {
    expect(normalizeFabPosition({ left: 136, top: 296 }, 320, 640)).toEqual({ x: 0.5, y: 0.5 })
  })
})
