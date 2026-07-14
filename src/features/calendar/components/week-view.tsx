import { AlertTriangle, CheckSquare2, Clock3 } from 'lucide-react'

import { cn } from '@/lib/cn'
import { formatWeekday, getTodayISO, getWeekDates } from '@/features/plans/date'
import { calculateDayOverview, calculateWeekSummary } from '@/features/plans/statistics'
import { usePlanStore } from '@/features/plans/store'
import type { DayOverviewStatus } from '@/features/plans/model'

const statusLabels: Record<DayOverviewStatus, string> = {
  empty: '无计划',
  upcoming: '未开始',
  pending: '待处理',
  completed: '已完成',
  missed: '未完成',
}

function StatusIcon({ status }: { status: DayOverviewStatus }) {
  if (status === 'completed') return <CheckSquare2 aria-hidden="true" size={17} />
  if (status === 'missed') return <AlertTriangle aria-hidden="true" size={17} />
  if (status === 'pending') return <Clock3 aria-hidden="true" size={17} />
  return null
}

export function WeekView({ date, interactive = true }: { date: string; interactive?: boolean }) {
  const records = usePlanStore((state) => state.records)
  const openDate = usePlanStore((state) => state.openDateInDayView)
  const today = getTodayISO()
  const dates = getWeekDates(date)
  const summary = calculateWeekSummary(date, records)
  const completion = summary.totalPlans
    ? Math.round((summary.completedPlans / summary.totalPlans) * 100)
    : 0

  return (
    <div className="grid gap-3 sm:grid-cols-2" aria-label="本周七日概览">
      {dates.map((day, index) => {
        const overview = calculateDayOverview(day, records, today)
        const selected = day === date
        const isToday = day === today
        const isSunday = index === 6

        return (
          <button
            aria-label={`${day} ${formatWeekday(day)}，${statusLabels[overview.status]}`}
            className={cn(
              'min-h-28 border border-line-strong bg-paper/92 p-4 text-left transition-colors',
              'hover:border-ink disabled:pointer-events-none',
              selected && 'border-2 border-ink',
              overview.status === 'completed' && 'bg-jade-soft/70 text-jade',
              overview.status === 'missed' && 'border-cinnabar bg-missed text-cinnabar',
            )}
            disabled={!interactive}
            key={day}
            onClick={() => openDate(day)}
            type="button"
          >
            <span className="flex items-start justify-between gap-3">
              <span>
                <span className="font-display text-lg font-semibold">{formatWeekday(day)}</span>
                <span className="ml-2 font-data text-xs text-graphite">{day.slice(5)}</span>
              </span>
              <span className="flex items-center gap-1 font-data text-[10px]">
                {isToday && <span className="border border-cinnabar px-1 text-cinnabar">今天</span>}
                <StatusIcon status={overview.status} />
              </span>
            </span>
            {isSunday ? (
              <span className="mt-5 block">
                <span className="font-data text-[11px] text-graphite">本周完成率</span>
                <span className="mt-1 block font-display text-2xl font-semibold">{completion}%</span>
              </span>
            ) : (
              <span className="mt-5 grid grid-cols-3 gap-2 font-data text-[11px] text-graphite">
                <span>计划 {overview.totalPlans}</span>
                <span>完成 {overview.completedPlans}</span>
                <span>未完 {overview.missedPlans}</span>
              </span>
            )}
            <span className="sr-only">{selected ? '当前选中日期' : ''}</span>
          </button>
        )
      })}
    </div>
  )
}
