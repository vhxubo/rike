import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { IconButton } from '@/components/ui/icon-button'
import type { CalendarView } from '@/features/calendar'
import { isDateInPeriod, readSystemConfig } from '@/features/system-config'
import {
  formatCompactDate,
  formatDisplayDate,
  formatMonthTitle,
  formatWeekday,
  getTodayISO,
  getWeekDates,
} from '@/features/plans/date'

interface DateNavigatorProps {
  canGoNext?: boolean
  canGoPrevious?: boolean
  date: string
  onNext: () => void
  onPrevious: () => void
  view?: CalendarView
}

const labels: Record<CalendarView, { previous: string; next: string }> = {
  day: { previous: '前一天', next: '后一天' },
  week: { previous: '上一周', next: '下一周' },
  month: { previous: '上个月', next: '下个月' },
}

export function DateNavigator({
  canGoNext = true,
  canGoPrevious = true,
  date,
  onNext,
  onPrevious,
  view = 'day',
}: DateNavigatorProps) {
  const [{ period }] = useState(readSystemConfig)
  const today = getTodayISO()
  const isToday = date === today
  const weekDates = getWeekDates(date)
  const visibleWeekDates = weekDates.filter((day) => isDateInPeriod(day, period))
  const compactLabel =
    view === 'day'
      ? formatCompactDate(date)
      : view === 'week'
        ? `${visibleWeekDates[0]} — ${visibleWeekDates.at(-1)}`
        : formatMonthTitle(date)
  const title = view === 'day' ? formatWeekday(date) : view === 'week' ? '本周计划' : '月度计划'

  return (
    <div className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-3" aria-live="polite">
      <IconButton disabled={!canGoPrevious} label={labels[view].previous} onClick={onPrevious} variant="ghost">
        <ChevronLeft aria-hidden="true" size={22} />
      </IconButton>

      <div className="min-w-0 text-center" title={formatDisplayDate(date)}>
        <div className="flex min-h-6 items-center justify-center gap-2">
          <span className="font-data text-xs text-graphite">{compactLabel}</span>
          {isToday && <Badge tone="accent">今天</Badge>}
        </div>
        <p className="mt-1 font-display text-2xl font-semibold text-ink">{title}</p>
      </div>

      <IconButton disabled={!canGoNext} label={labels[view].next} onClick={onNext} variant="ghost">
        <ChevronRight aria-hidden="true" size={22} />
      </IconButton>
    </div>
  )
}
