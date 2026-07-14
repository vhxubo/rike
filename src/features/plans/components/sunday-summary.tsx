import { getWeekDates } from '@/features/plans/date'
import type { Subject } from '@/features/plans/model'
import { calculateWeekSummary } from '@/features/plans/statistics'
import { usePlanStore } from '@/features/plans/store'

const subjects: Subject[] = ['语文', '英语', '数学', '化学', '生物', '物理']

interface SundaySummaryProps {
  date: string
}

function Metric({ label, value, suffix }: { label: string; value: number; suffix: string }) {
  return (
    <div className="border-b border-line py-5 sm:border-b-0 sm:border-r sm:px-5 last:border-0">
      <p className="font-data text-[11px] text-graphite">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-ink">
        {value}
        <span className="ml-1 text-sm font-normal text-graphite">{suffix}</span>
      </p>
    </div>
  )
}

export function SundaySummary({ date }: SundaySummaryProps) {
  const records = usePlanStore((state) => state.records)
  const summary = calculateWeekSummary(date, records)
  const weekDates = getWeekDates(date)
  const maxMissed = Math.max(1, ...Object.values(summary.missedBySubject))

  return (
    <div className="grid gap-10">
      <header className="text-center">
        <p className="font-data text-xs text-cinnabar">
          {weekDates[0]} — {weekDates[6]}
        </p>
        <h2 className="mt-2 font-display text-3xl font-semibold">本周统计</h2>
      </header>

      <section aria-label="本周数量统计" className="border-y border-line sm:grid sm:grid-cols-5">
        <Metric label="计划文字" suffix="字" value={summary.planCharacterCount} />
        <Metric label="日结文字" suffix="字" value={summary.journalCharacterCount} />
        <Metric label="计划总数" suffix="项" value={summary.totalPlans} />
        <Metric label="已完成" suffix="项" value={summary.completedPlans} />
        <Metric label="未完成" suffix="项" value={summary.missedPlans} />
      </section>

      <section aria-labelledby="missed-subject-heading">
        <div className="mb-5 flex items-baseline justify-between gap-3">
          <h3 className="font-display text-xl font-semibold" id="missed-subject-heading">
            未完成项分布
          </h3>
          <span className="font-data text-[11px] text-graphite">六科</span>
        </div>
        <div className="grid gap-4">
          {subjects.map((subject) => {
            const value = summary.missedBySubject[subject]
            const width = `${(value / maxMissed) * 100}%`

            return (
              <div className="grid grid-cols-[3rem_1fr_2rem] items-center gap-3" key={subject}>
                <span className="text-sm text-ink">{subject}</span>
                <span className="h-2 overflow-hidden rounded-sm bg-line/55">
                  <span className="block h-full bg-cinnabar" style={{ width }} />
                </span>
                <span className="text-right font-data text-xs text-graphite">{value}</span>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
