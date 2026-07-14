import {
  addDays,
  compareAsc,
  eachDayOfInterval,
  endOfWeek,
  format,
  getDay,
  parseISO,
  startOfWeek,
} from 'date-fns'
import { zhCN } from 'date-fns/locale'

import type { DayKind } from '@/features/plans/model'

export function toISODate(date: Date) {
  return format(date, 'yyyy-MM-dd')
}

export function getTodayISO() {
  return toISODate(new Date())
}

export function parseISODate(date: string) {
  return parseISO(date)
}

export function addISODate(date: string, amount: number) {
  return toISODate(addDays(parseISODate(date), amount))
}

export function compareISODates(left: string, right: string) {
  return compareAsc(parseISODate(left), parseISODate(right))
}

export function getDayKind(date: string): DayKind {
  const weekday = getDay(parseISODate(date))

  if (weekday === 0) return 'sunday'
  if (weekday === 6) return 'saturday'
  return 'weekday'
}

export function getWeekDates(date: string) {
  const parsedDate = parseISODate(date)
  const start = startOfWeek(parsedDate, { weekStartsOn: 1 })
  const end = endOfWeek(parsedDate, { weekStartsOn: 1 })

  return eachDayOfInterval({ start, end }).map(toISODate)
}

export function formatDisplayDate(date: string) {
  return format(parseISODate(date), 'yyyy年M月d日 EEEE', { locale: zhCN })
}

export function formatCompactDate(date: string) {
  return format(parseISODate(date), 'yyyy / MM / dd')
}

export function formatWeekday(date: string) {
  return format(parseISODate(date), 'EEEE', { locale: zhCN })
}
