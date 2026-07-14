import { getPageTurnVisual } from '@/features/calendar/page-turn-motion'

describe('soft page turn motion', () => {
  it('starts and ends without residual tilt or shadow', () => {
    expect(getPageTurnVisual(0, 1)).toEqual({
      currentXPercent: 0,
      currentRotateY: 0,
      targetXPercent: 6,
      targetOpacity: 0.88,
      edgeIntensity: 0,
      foldCenterPercent: 60,
      foldAngle: 0,
    })
    expect(getPageTurnVisual(1, 1)).toMatchObject({
      currentXPercent: -100,
      currentRotateY: 0,
      targetXPercent: 0,
      targetOpacity: 1,
      edgeIntensity: 0,
      foldCenterPercent: 60,
      foldAngle: 0,
    })
  })

  it('adds a soft tilt and reverses direction', () => {
    expect(getPageTurnVisual(0.5, 1)).toMatchObject({
      currentXPercent: -50,
      currentRotateY: -10,
      targetXPercent: 3,
      edgeIntensity: 1,
    })
    expect(getPageTurnVisual(0.5, -1)).toMatchObject({
      currentXPercent: 50,
      currentRotateY: 10,
      targetXPercent: -3,
    })
  })

  it('moves and tilts the fold with the pointer height', () => {
    expect(getPageTurnVisual(0.5, 1, 0.1)).toMatchObject({
      foldCenterPercent: 10,
      foldAngle: -9.6,
    })
    expect(getPageTurnVisual(0.5, 1, 0.9)).toMatchObject({
      foldCenterPercent: 90,
      foldAngle: 9.6,
    })
  })
})
