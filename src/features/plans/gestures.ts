export function getDateSwipeAmount(offsetX: number, velocityX: number) {
  const hasIntent = Math.abs(offsetX) > 70 || Math.abs(velocityX) > 500
  if (!hasIntent) return 0
  return offsetX < 0 ? 1 : -1
}

export function canStartDateSwipe(target: EventTarget | null) {
  if (!(target instanceof Element)) return false
  return !target.closest('input, textarea, button, a, [role="button"], [data-no-date-swipe]')
}
