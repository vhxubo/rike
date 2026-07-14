import type { Subject } from '@/features/plans/model'
import type { StatisticsSummary } from '@/features/plans/statistics'

const subjects: Subject[] = ['语文', '英语', '数学', '化学', '生物', '物理']

function Metric({ label, value, suffix }: { label: string; value: number; suffix: string }) {
  return (
    <div className="border-b border-line p-4 sm:border-b-0 sm:border-r last:border-0">
      <p className="font-data text-[10px] text-graphite">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold text-ink">
        {value}<span className="ml-1 text-xs font-normal text-graphite">{suffix}</span>
      </p>
    </div>
  )
}

export function StatisticsPanel({ summary }: { summary: StatisticsSummary }) {
  const maxMissed = Math.max(1, ...Object.values(summary.missedBySubject))

  return (
    <div className="grid gap-8">
      <section aria-label="数量统计" className="border-y border-line sm:grid sm:grid-cols-3">
        <Metric label="计划总数" suffix="项" value={summary.totalPlans} />
        <Metric label="已完成" suffix="项" value={summary.completedPlans} />
        <Metric label="未完成" suffix="项" value={summary.missedPlans} />
        <Metric label="完成率" suffix="%" value={summary.completionRate} />
        <Metric label="计划文字" suffix="字" value={summary.planCharacterCount} />
        <Metric label="日结文字" suffix="字" value={summary.journalCharacterCount} />
      </section>

      <section aria-labelledby="range-missed-heading">
        <div className="mb-5 flex items-baseline justify-between gap-3">
          <h3 className="font-display text-xl font-semibold" id="range-missed-heading">未完成项分布</h3>
          <span className="font-data text-[10px] text-graphite">截至今天 · 六科</span>
        </div>
        <div className="grid gap-4">
          {subjects.map((subject) => {
            const value = summary.missedBySubject[subject]
            return (
              <div className="grid grid-cols-[3rem_1fr_2rem] items-center gap-3" key={subject}>
                <span className="text-sm">{subject}</span>
                <span className="h-2 bg-line/55">
                  <span className="block h-full bg-cinnabar" style={{ width: `${(value / maxMissed) * 100}%` }} />
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
