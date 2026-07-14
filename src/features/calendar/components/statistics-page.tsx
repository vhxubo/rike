import { ChevronLeft, ChevronRight } from 'lucide-react'

import { IconButton } from '@/components/ui/icon-button'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { StatisticsPanel } from '@/features/calendar/components/statistics-panel'
import { formatMonthTitle, formatYear, getTodayISO, getWeekDates } from '@/features/plans/date'
import {
  calculateStatisticsSummary,
  type StatisticsRange,
} from '@/features/plans/statistics'
import { usePlanStore } from '@/features/plans/store'

const rangeOptions = [
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '本年', value: 'year' },
  { label: '全部', value: 'all' },
] satisfies Array<{ label: string; value: StatisticsRange }>

function rangeTitle(range: StatisticsRange, date: string) {
  if (range === 'all') return '全部记录'
  if (range === 'month') return formatMonthTitle(date)
  if (range === 'year') return formatYear(date)
  const week = getWeekDates(date)
  return `${week[0]} — ${week[6]}`
}

export function StatisticsPage({
  anchorDate,
  onNavigate,
  onRangeChange,
  onToday,
  range,
}: {
  anchorDate: string
  onNavigate: (amount: -1 | 1) => void
  onRangeChange: (range: StatisticsRange) => void
  onToday: () => void
  range: StatisticsRange
}) {
  const records = usePlanStore((state) => state.records)
  const today = getTodayISO()
  const summary = calculateStatisticsSummary(range, anchorDate, records, today)
  const isCurrent =
    range === 'week'
      ? getWeekDates(anchorDate).includes(today)
      : range === 'month'
        ? anchorDate.slice(0, 7) === today.slice(0, 7)
        : range === 'year'
          ? anchorDate.slice(0, 4) === today.slice(0, 4)
          : true

  return (
    <div className="grid gap-8">
      <div className="flex justify-center">
        <SegmentedControl label="统计范围" onValueChange={onRangeChange} options={rangeOptions} value={range} />
      </div>
      <header className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-3 text-center">
        {range === 'all' ? <span /> : (
          <IconButton label="上一统计范围" onClick={() => onNavigate(-1)} variant="ghost">
            <ChevronLeft aria-hidden="true" size={22} />
          </IconButton>
        )}
        <div>
          <p className="font-display text-2xl font-semibold">{rangeTitle(range, anchorDate)}</p>
          {!isCurrent && range !== 'all' && (
            <button className="mt-2 border-b border-cinnabar font-data text-[11px] text-cinnabar" onClick={onToday} type="button">回到今天</button>
          )}
        </div>
        {range === 'all' ? <span /> : (
          <IconButton label="下一统计范围" onClick={() => onNavigate(1)} variant="ghost">
            <ChevronRight aria-hidden="true" size={22} />
          </IconButton>
        )}
      </header>
      <StatisticsPanel summary={summary} />
    </div>
  )
}
