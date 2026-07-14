import { compareISODates } from '@/features/plans/date'
import type { ItemDisplayStatus, ItemResolution } from '@/features/plans/model'

export function getItemDisplayStatus(
  date: string,
  resolution: ItemResolution,
  today: string,
): ItemDisplayStatus {
  if (resolution === 'completed') return 'completed'
  if (resolution === 'missed') return 'missed'

  const comparison = compareISODates(date, today)

  if (comparison < 0) return 'missed'
  if (comparison > 0) return 'upcoming'
  return 'pending'
}

export function getNextResolution(resolution: ItemResolution): Exclude<ItemResolution, null> {
  return resolution === 'completed' ? 'missed' : 'completed'
}

export function canToggleStatus(date: string, today: string) {
  return compareISODates(date, today) === 0
}

export function canEditPlan(date: string, today: string) {
  return compareISODates(date, today) >= 0
}

export function canEditJournal(date: string, today: string) {
  return compareISODates(date, today) === 0
}
