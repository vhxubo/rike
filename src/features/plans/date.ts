import {
  addDays,
  addMonths,
  addYears,
  compareAsc,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  getDay,
  parseISO,
  startOfMonth,
  startOfWeek,
  startOfYear,
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

export function addISOWeek(date: string, amount: number) {
  return addISODate(date, amount * 7)
}

export function addISOMonth(date: string, amount: number) {
  return toISODate(addMonths(parseISODate(date), amount))
}

export function addISOYear(date: string, amount: number) {
  return toISODate(addYears(parseISODate(date), amount))
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

export function getYearDates(date: string) {
  const parsedDate = parseISODate(date)
  return eachDayOfInterval({
    start: startOfYear(parsedDate),
    end: endOfYear(parsedDate),
  }).map(toISODate)
}

export function getMonthDates(date: string) {
  const parsedDate = parseISODate(date)
  return eachDayOfInterval({
    start: startOfMonth(parsedDate),
    end: endOfMonth(parsedDate),
  }).map(toISODate)
}

export function getCalendarMonthDates(date: string) {
  const start = startOfWeek(startOfMonth(parseISODate(date)), { weekStartsOn: 1 })
  return Array.from({ length: 42 }, (_, index) => toISODate(addDays(start, index)))
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

export function formatMonth(date: string) {
  return format(parseISODate(date), 'M月', { locale: zhCN })
}

export function formatMonthTitle(date: string) {
  return format(parseISODate(date), 'yyyy年M月', { locale: zhCN })
}

export function formatYear(date: string) {
  return format(parseISODate(date), 'yyyy年', { locale: zhCN })
}
