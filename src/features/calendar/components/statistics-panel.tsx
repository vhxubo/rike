import { useState } from 'react'

import { SegmentedControl } from '@/components/ui/segmented-control'
import type { Subject } from '@/features/plans/model'
import type { StatisticsSummary, WheelStatistics } from '@/features/plans/statistics'

const subjects: Subject[] = ['语文', '英语', '数学', '化学', '生物', '物理']

function Metric({
  className,
  label,
  value,
  suffix,
}: {
  className?: string
  label: string
  value: number
  suffix: string
}) {
  return (
    <div className={`p-3 sm:p-4 ${className ?? ''}`}>
      <p className="font-data text-[10px] text-graphite">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold text-ink">
        {value}<span className="ml-1 text-xs font-normal text-graphite">{suffix}</span>
      </p>
    </div>
  )
}

export function StatisticsPanel({
  summary,
  wheelSummary,
}: {
  summary: StatisticsSummary
  wheelSummary?: WheelStatistics
}) {
  const [missedGrouping, setMissedGrouping] = useState<'subject' | 'week'>('subject')
  const missedItems = missedGrouping === 'subject'
    ? subjects.map((subject) => ({ label: subject, value: summary.missedBySubject[subject] }))
    : summary.missedByWeek
  const maxMissed = Math.max(1, ...missedItems.map((item) => item.value))
  const maxPrize = Math.max(1, ...(wheelSummary?.prizes.map((prize) => prize.value) ?? []))

  return (
    <div className="grid gap-8">
      <section aria-label="数量统计" className="grid grid-cols-3 border-y border-line">
        <Metric className="border-b border-r border-line" label="计划总数" suffix="项" value={summary.totalPlans} />
        <Metric className="border-b border-r border-line" label="已完成" suffix="项" value={summary.completedPlans} />
        <Metric className="border-b border-line" label="未完成" suffix="项" value={summary.missedPlans} />
        <Metric className="border-r border-line" label="完成率" suffix="%" value={summary.completionRate} />
        <Metric className="border-r border-line" label="计划文字" suffix="字" value={summary.planCharacterCount} />
        <Metric label="日结文字" suffix="字" value={summary.journalCharacterCount} />
        <Metric className="col-span-3 border-t border-line" label="满勤周数" suffix="周" value={summary.perfectWeeks} />
      </section>

      <section aria-labelledby="range-missed-heading">
        <div className="mb-5 flex items-baseline justify-between gap-3">
          <h3 className="font-display text-xl font-semibold" id="range-missed-heading">未完成项分布</h3>
          <SegmentedControl
            label="未完成项分组"
            onValueChange={setMissedGrouping}
            options={[{ label: '按科目', value: 'subject' }, { label: '按周', value: 'week' }]}
            value={missedGrouping}
          />
        </div>
        <div className="grid gap-4">
          {missedItems.map(({ label, value }) => {
            return (
              <div className="grid grid-cols-[6.5rem_1fr_2rem] items-center gap-3" key={label}>
                <span className="text-sm">{label}</span>
                <span className="h-2 bg-line/55">
                  <span className="block h-full bg-cinnabar" style={{ width: `${(value / maxMissed) * 100}%` }} />
                </span>
                <span className="text-right font-data text-xs text-graphite">{value}</span>
              </div>
            )
          })}
        </div>
      </section>

      {wheelSummary && (
        <section aria-labelledby="wheel-statistics-heading">
          <div className="mb-5 flex items-baseline justify-between gap-3">
            <h3 className="font-display text-xl font-semibold" id="wheel-statistics-heading">中奖统计</h3>
            <span className="font-data text-[10px] text-graphite">欧皇指数 = 中奖率 + 稀有度</span>
          </div>
          <div className="mb-6 grid grid-cols-3 border-y border-line">
            <Metric className="border-r border-line" label="抽奖次数" suffix="次" value={wheelSummary.spins} />
            <Metric className="border-r border-line" label="中奖次数" suffix="次" value={wheelSummary.wins} />
            <Metric label="欧皇指数" suffix="分" value={wheelSummary.luckIndex} />
          </div>
          <div className="grid gap-4">
            {wheelSummary.prizes.length ? wheelSummary.prizes.map((prize) => (
              <div className="grid grid-cols-[9rem_1fr_2rem] items-center gap-3" key={prize.label}>
                <span className="truncate text-sm">{prize.label}</span>
                <span className="h-2 bg-line/55">
                  <span className="block h-full bg-jade" style={{ width: `${(prize.value / maxPrize) * 100}%` }} />
                </span>
                <span className="text-right font-data text-xs text-graphite">{prize.value}</span>
              </div>
            )) : <p className="text-sm text-graphite">暂无中奖项目</p>}
          </div>
        </section>
      )}
    </div>
  )
}
