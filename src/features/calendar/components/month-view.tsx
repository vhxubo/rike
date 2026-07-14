import { useState } from 'react'

import { readSystemConfig, isDateInPeriod } from '@/features/system-config'
import { cn } from '@/lib/cn'
import { getCalendarMonthDates, getTodayISO } from '@/features/plans/date'
import { calculateDayOverview } from '@/features/plans/statistics'
import { usePlanStore } from '@/features/plans/store'

const weekdays = ['一', '二', '三', '四', '五', '六', '日']
const statusLabels = {
  empty: '无计划',
  upcoming: '未开始',
  pending: '待处理',
  completed: '已完成',
  missed: '未完成',
} as const

export function MonthView({ date, interactive = true }: { date: string; interactive?: boolean }) {
  const [{ period }] = useState(readSystemConfig)
  const records = usePlanStore((state) => state.records)
  const openDate = usePlanStore((state) => state.openDateInDayView)
  const today = getTodayISO()
  const month = date.slice(0, 7)

  return (
    <section aria-label={`${month}月历`} className="border border-line-strong bg-paper/92 p-3 sm:p-5">
      <div className="grid grid-cols-7 text-center font-data text-[11px] text-graphite">
        {weekdays.map((weekday) => <span className="py-2" key={weekday}>{weekday}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-px bg-line">
        {getCalendarMonthDates(date).map((day) => {
          const inPeriod = isDateInPeriod(day, period)
          const overview = calculateDayOverview(day, records, today, period)
          const selected = day === date
          const isToday = day === today
          const outside = day.slice(0, 7) !== month

          return (
            <button
              aria-label={`${day}，${inPeriod ? statusLabels[overview.status] : '区间外'}${outside ? '，相邻月份' : ''}`}
              className={cn(
                'relative grid min-h-14 place-items-center bg-paper px-1 font-data text-xs text-ink sm:min-h-20',
                'hover:z-10 hover:outline hover:outline-1 hover:outline-ink disabled:pointer-events-none',
                outside && !selected && 'opacity-55',
                !inPeriod && 'cursor-not-allowed opacity-30',
                selected && 'z-10 bg-ink text-paper outline outline-1 outline-ink',
                isToday && !selected && 'outline outline-1 outline-cinnabar text-cinnabar',
                overview.status === 'completed' && !selected && 'bg-jade-soft text-jade',
                overview.status === 'missed' && !selected && 'bg-missed text-cinnabar',
                overview.status === 'pending' && !selected && 'after:absolute after:bottom-2 after:size-1 after:bg-warning',
              )}
              disabled={!interactive || !inPeriod}
              key={day}
              onClick={() => openDate(day)}
              type="button"
            >
              {Number(day.slice(-2))}
            </button>
          )
        })}
      </div>
    </section>
  )
}
