import {
  compareISODates,
  getDateRange,
  getDayKind,
  getMonthDates,
  getTodayISO,
  getWeekDates,
  getYearDates,
} from '@/features/plans/date'
import type {
  DayOverview,
  ItemResolution,
  PlanRecords,
  Subject,
  WeekdayDayRecord,
} from '@/features/plans/model'
import { getItemDisplayStatus } from '@/features/plans/status'
import { getWeekdayTemplate, isEffectiveWeekdayItem } from '@/features/plans/templates'
import { isDateInPeriod, type SystemPeriod } from '@/features/system-config'
import type { WheelSpinRecord } from '@/features/fishing-wheel/store'

export interface WeekSummary {
  planCharacterCount: number
  journalCharacterCount: number
  totalPlans: number
  completedPlans: number
  missedPlans: number
  missedBySubject: Record<Subject, number>
}

export type StatisticsRange = 'week' | 'month' | 'year' | 'all'

export interface StatisticsSummary extends WeekSummary {
  completionRate: number
  startDate: string
  endDate: string
  perfectWeeks: number
  missedByWeek: Array<{ label: string; value: number }>
}

export interface WheelStatistics {
  spins: number
  wins: number
  luckIndex: number
  prizes: Array<{ label: string; value: number }>
}

const subjects: Subject[] = ['语文', '英语', '数学', '化学', '生物', '物理']
const prizeChance: Record<string, number> = {
  saturday: 0.5,
  workweek: 0.001,
  ...Object.fromEntries(Array.from({ length: 8 }, (_, index) => [`task-${index + 1}`, 1])),
  ...Object.fromEntries(Array.from({ length: 5 }, (_, index) => [`weekday-${index + 1}`, 0.1])),
}

export function countCharacters(value: string) {
  return Array.from(value.replace(/\s/g, '')).length
}

export function calculateWheelStatistics(
  spins: WheelSpinRecord[],
  startDate: string,
  endDate: string,
): WheelStatistics {
  const visible = spins.filter((spin) => spin.spinDate >= startDate && spin.spinDate <= endDate)
  const wins = visible.filter((spin) => spin.prizeId !== 'none')
  const prizes = new Map<string, number>()
  for (const spin of wins) prizes.set(spin.title, (prizes.get(spin.title) ?? 0) + 1)
  const winRateScore = visible.length ? Math.min(1, wins.length / visible.length / 0.09001) : 0
  const rarityScore = wins.length
    ? wins.reduce((total, spin) => total + Math.min(1, 0.1 / (prizeChance[spin.prizeId] ?? 1)), 0) / wins.length
    : 0

  return {
    spins: visible.length,
    wins: wins.length,
    luckIndex: Math.round((winRateScore + rarityScore) * 50),
    prizes: [...prizes].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value),
  }
}

function emptySubjectCounts(): Record<Subject, number> {
  return Object.fromEntries(subjects.map((subject) => [subject, 0])) as Record<Subject, number>
}

function getResolution(record: WeekdayDayRecord | undefined, itemId: string): ItemResolution {
  return record?.resolutions[itemId] ?? null
}

export function calculateWeekSummary(
  weekDate: string,
  records: PlanRecords,
  asOfDate = getTodayISO(),
  period?: SystemPeriod,
): WeekSummary {
  const summary = calculateStatisticsSummary('week', weekDate, records, asOfDate, period)
  return {
    planCharacterCount: summary.planCharacterCount,
    journalCharacterCount: summary.journalCharacterCount,
    totalPlans: summary.totalPlans,
    completedPlans: summary.completedPlans,
    missedPlans: summary.missedPlans,
    missedBySubject: summary.missedBySubject,
  }
}

function getStatisticsDates(
  range: StatisticsRange,
  anchorDate: string,
  records: PlanRecords,
  asOfDate: string,
  period?: SystemPeriod,
) {
  let dates: string[]

  if (range === 'week') dates = getWeekDates(anchorDate)
  else if (range === 'month') dates = getMonthDates(anchorDate)
  else if (range === 'year') dates = getYearDates(anchorDate)
  else if (period) {
    dates = getDateRange(period.startDate, period.endDate)
  } else {
    dates = Object.keys(records)
      .filter((date) =>
        compareISODates(date, asOfDate) <= 0 && (!period || isDateInPeriod(date, period)),
      )
      .sort()
  }

  return dates.filter(
    (date) => compareISODates(date, asOfDate) <= 0 && (!period || isDateInPeriod(date, period)),
  )
}

export function calculateStatisticsSummary(
  range: StatisticsRange,
  anchorDate: string,
  records: PlanRecords,
  asOfDate = getTodayISO(),
  period?: SystemPeriod,
): StatisticsSummary {
  const dates = getStatisticsDates(range, anchorDate, records, asOfDate, period)
  const summary: StatisticsSummary = {
    planCharacterCount: 0,
    journalCharacterCount: 0,
    totalPlans: 0,
    completedPlans: 0,
    missedPlans: 0,
    missedBySubject: emptySubjectCounts(),
    completionRate: 0,
    startDate: dates[0] ?? asOfDate,
    endDate: dates.at(-1) ?? asOfDate,
    perfectWeeks: 0,
    missedByWeek: [],
  }
  const weeks = new Map<string, { endDate: string; missed: number }>()

  for (const date of dates) {
    const weekDates = getWeekDates(date).filter((day) => !period || isDateInPeriod(day, period))
    const weekStart = weekDates[0]
    const week = weeks.get(weekStart) ?? { endDate: weekDates.at(-1) ?? date, missed: 0 }
    weeks.set(weekStart, week)
    const kind = getDayKind(date)
    const record = records[date]

    if (kind === 'weekday') {
      const weekdayRecord = record?.kind === 'weekday' ? record : undefined
      const template = getWeekdayTemplate(date)

      summary.journalCharacterCount += countCharacters(weekdayRecord?.journal ?? '')

      for (const item of template) {
        const input = weekdayRecord?.inputs[item.id] ?? ''

        if (item.editableMode !== 'none') {
          summary.planCharacterCount += countCharacters(input)
        }

        if (!isEffectiveWeekdayItem(item, input)) continue

        summary.totalPlans += 1
        const status = getItemDisplayStatus(date, getResolution(weekdayRecord, item.id), asOfDate)

        if (status === 'completed') {
          summary.completedPlans += 1
          continue
        }

        if (status === 'missed') {
          summary.missedPlans += 1
          week.missed += 1
          if (item.subject) summary.missedBySubject[item.subject] += 1
        }
      }

      continue
    }

    if (kind === 'saturday' && record?.kind === 'saturday') {
      for (const item of record.items) {
        if (!item.text.trim()) continue

        summary.planCharacterCount += countCharacters(item.text)
        summary.totalPlans += 1

        const status = getItemDisplayStatus(date, item.resolution, asOfDate)
        if (status === 'completed') summary.completedPlans += 1
        if (status === 'missed') {
          summary.missedPlans += 1
          week.missed += 1
        }
      }
    }
  }

  const resolvedPlans = summary.completedPlans + summary.missedPlans
  summary.completionRate = resolvedPlans
    ? Math.round((summary.completedPlans / resolvedPlans) * 100)
    : 0
  summary.missedByWeek = [...weeks].map(([startDate, week]) => ({
    label: `${startDate.slice(5)}—${week.endDate.slice(5)}`,
    value: week.missed,
  }))
  summary.perfectWeeks = [...weeks.values()].filter(
    (week) => compareISODates(week.endDate, asOfDate) <= 0 && week.missed === 0,
  ).length

  return summary
}

export function calculateDayOverview(
  date: string,
  records: PlanRecords,
  asOfDate = getTodayISO(),
  period?: SystemPeriod,
): DayOverview {
  const overview: DayOverview = {
    totalPlans: 0,
    completedPlans: 0,
    missedPlans: 0,
    status: 'empty',
  }
  const kind = getDayKind(date)
  if (period && !isDateInPeriod(date, period)) return overview
  const record = records[date]
  const resolutions: ItemResolution[] = []

  if (kind === 'weekday') {
    const weekdayRecord = record?.kind === 'weekday' ? record : undefined

    for (const item of getWeekdayTemplate(date)) {
      const input = weekdayRecord?.inputs[item.id] ?? ''
      if (!isEffectiveWeekdayItem(item, input)) continue
      resolutions.push(weekdayRecord?.resolutions[item.id] ?? null)
    }
  }

  if (kind === 'saturday' && record?.kind === 'saturday') {
    for (const item of record.items) {
      if (item.text.trim()) resolutions.push(item.resolution)
    }
  }

  for (const resolution of resolutions) {
    overview.totalPlans += 1
    const status = getItemDisplayStatus(date, resolution, asOfDate)
    if (status === 'completed') overview.completedPlans += 1
    if (status === 'missed') overview.missedPlans += 1
  }

  if (overview.totalPlans === 0) return overview
  if (overview.missedPlans > 0) overview.status = 'missed'
  else if (overview.completedPlans === overview.totalPlans) overview.status = 'completed'
  else if (date > asOfDate) overview.status = 'upcoming'
  else overview.status = 'pending'

  return overview
}
