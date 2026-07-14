import { getDayKind, getTodayISO, getWeekDates } from '@/features/plans/date'
import type {
  DayOverview,
  ItemResolution,
  PlanRecords,
  Subject,
  WeekdayDayRecord,
} from '@/features/plans/model'
import { getItemDisplayStatus } from '@/features/plans/status'
import { getWeekdayTemplate, isEffectiveWeekdayItem } from '@/features/plans/templates'

export interface WeekSummary {
  planCharacterCount: number
  journalCharacterCount: number
  totalPlans: number
  completedPlans: number
  missedPlans: number
  missedBySubject: Record<Subject, number>
}

const subjects: Subject[] = ['语文', '英语', '数学', '化学', '生物', '物理']

export function countCharacters(value: string) {
  return Array.from(value.replace(/\s/g, '')).length
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
): WeekSummary {
  const summary: WeekSummary = {
    planCharacterCount: 0,
    journalCharacterCount: 0,
    totalPlans: 0,
    completedPlans: 0,
    missedPlans: 0,
    missedBySubject: emptySubjectCounts(),
  }

  for (const date of getWeekDates(weekDate).slice(0, 6)) {
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
        if (status === 'missed') summary.missedPlans += 1
      }
    }
  }

  return summary
}

export function calculateDayOverview(
  date: string,
  records: PlanRecords,
  asOfDate = getTodayISO(),
): DayOverview {
  const overview: DayOverview = {
    totalPlans: 0,
    completedPlans: 0,
    missedPlans: 0,
    status: 'empty',
  }
  const kind = getDayKind(date)
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
