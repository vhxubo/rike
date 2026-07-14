import type { CalendarView } from '@/features/calendar'

export function getDateSwipeAmount(offsetX: number, velocityX: number) {
  const hasIntent = Math.abs(offsetX) > 70 || Math.abs(velocityX) > 500
  if (!hasIntent) return 0
  return offsetX < 0 ? 1 : -1
}

export function canStartDateSwipe(target: EventTarget | null) {
  if (!(target instanceof Element)) return false
  return !target.closest('input, textarea, button, a, [role="button"], [data-no-date-swipe]')
}

const viewOrder: CalendarView[] = ['day', 'week', 'month']

export function getZoomedView(
  view: CalendarView,
  direction: 'in' | 'out',
): CalendarView {
  const index = viewOrder.indexOf(view)
  const nextIndex = direction === 'in' ? index - 1 : index + 1
  return viewOrder[Math.max(0, Math.min(viewOrder.length - 1, nextIndex))]
}

export function getPinchZoomDirection(
  initialDistance: number,
  currentDistance: number,
  threshold = 36,
): 'in' | 'out' | null {
  const delta = currentDistance - initialDistance
  if (Math.abs(delta) < threshold) return null
  return delta > 0 ? 'in' : 'out'
}

export function getWheelZoomDirection(
  accumulatedDeltaY: number,
  threshold = 60,
): 'in' | 'out' | null {
  if (Math.abs(accumulatedDeltaY) < threshold) return null
  return accumulatedDeltaY < 0 ? 'in' : 'out'
}
