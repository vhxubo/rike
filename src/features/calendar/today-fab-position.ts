export interface NormalizedFabPosition {
  x: number
  y: number
}

export interface FabPixelPosition {
  left: number
  top: number
}

export const DEFAULT_FAB_POSITION: NormalizedFabPosition = { x: 0.9, y: 0.86 }

export function isNormalizedFabPosition(value: unknown): value is NormalizedFabPosition {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<NormalizedFabPosition>
  return (
    typeof candidate.x === 'number' &&
    typeof candidate.y === 'number' &&
    Number.isFinite(candidate.x) &&
    Number.isFinite(candidate.y) &&
    candidate.x >= 0 &&
    candidate.x <= 1 &&
    candidate.y >= 0 &&
    candidate.y <= 1
  )
}

export function clampFabPosition(
  position: NormalizedFabPosition,
  viewportWidth: number,
  viewportHeight: number,
  size = 48,
  headerHeight = 72,
  margin = 12,
): FabPixelPosition {
  const desiredLeft = position.x * viewportWidth - size / 2
  const desiredTop = position.y * viewportHeight - size / 2
  return {
    left: Math.min(Math.max(margin, desiredLeft), Math.max(margin, viewportWidth - size - margin)),
    top: Math.min(
      Math.max(headerHeight + margin, desiredTop),
      Math.max(headerHeight + margin, viewportHeight - size - margin),
    ),
  }
}

export function normalizeFabPosition(
  pixels: FabPixelPosition,
  viewportWidth: number,
  viewportHeight: number,
  size = 48,
): NormalizedFabPosition {
  return {
    x: (pixels.left + size / 2) / viewportWidth,
    y: (pixels.top + size / 2) / viewportHeight,
  }
}
