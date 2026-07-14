import { cn } from '@/lib/cn'
import { formatMonth, getMonthGridDates, getTodayISO } from '@/features/plans/date'
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

export function YearView({ date, interactive = true }: { date: string; interactive?: boolean }) {
  const records = usePlanStore((state) => state.records)
  const openDate = usePlanStore((state) => state.openDateInDayView)
  const today = getTodayISO()
  const year = date.slice(0, 4)
  const months = Array.from({ length: 12 }, (_, index) =>
    `${year}-${String(index + 1).padStart(2, '0')}-01`,
  )

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" aria-label={`${year}年日历`}>
      {months.map((month) => (
        <section className="border border-line-strong bg-paper/92 p-3" key={month}>
          <h2 className="mb-3 font-display text-lg font-semibold">{formatMonth(month)}</h2>
          <div className="grid grid-cols-7 gap-y-1 text-center font-data text-[10px] text-graphite">
            {weekdays.map((weekday) => <span key={weekday}>{weekday}</span>)}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-0.5">
            {getMonthGridDates(month).map((day, index) => {
              if (!day) return <span aria-hidden="true" className="aspect-square" key={`blank-${index}`} />
              const overview = calculateDayOverview(day, records, today)
              const selected = day === date
              const isToday = day === today

              return (
                <button
                  aria-label={`${day}，${statusLabels[overview.status]}`}
                  className={cn(
                    'relative grid aspect-square place-items-center border border-transparent font-data text-[10px] text-ink',
                    'hover:border-ink disabled:pointer-events-none',
                    selected && 'border-ink bg-ink text-paper',
                    isToday && !selected && 'border-cinnabar text-cinnabar',
                    overview.status === 'completed' && !selected && 'bg-jade-soft text-jade',
                    overview.status === 'missed' && !selected && 'bg-missed text-cinnabar',
                    overview.status === 'pending' && !selected && 'after:absolute after:bottom-0.5 after:size-1 after:bg-warning',
                    overview.status === 'upcoming' && !selected && 'text-graphite',
                  )}
                  disabled={!interactive}
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
      ))}
    </div>
  )
}
