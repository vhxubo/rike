export interface PageTurnVisual {
  currentXPercent: number
  currentRotateY: number
  targetXPercent: number
  targetOpacity: number
  edgeIntensity: number
}

export function getPageTurnVisual(progress: number, direction: -1 | 1): PageTurnVisual {
  const clamped = Math.max(0, Math.min(1, progress))
  const eased = clamped * clamped * (3 - 2 * clamped)
  const edgeIntensity = clamped === 0 || clamped === 1 ? 0 : Math.sin(clamped * Math.PI)

  return {
    currentXPercent: eased === 0 ? 0 : -direction * eased * 100,
    currentRotateY: edgeIntensity === 0 ? 0 : -direction * edgeIntensity * 10,
    targetXPercent: direction * (1 - eased) * 6,
    targetOpacity: 0.88 + eased * 0.12,
    edgeIntensity,
  }
}
