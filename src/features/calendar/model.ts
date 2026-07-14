import type { ISODateString } from '@/types/plans'

export type CalendarView = 'day' | 'week' | 'month'

export interface CalendarCursor {
  date: ISODateString
  view: CalendarView
}

export type CalendarGesture =
  | { type: 'navigate'; direction: 'previous' | 'next' }
  | { type: 'zoom'; direction: 'in' | 'out' }
