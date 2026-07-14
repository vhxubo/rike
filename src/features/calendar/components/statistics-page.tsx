import { StatisticsPanel } from '@/features/calendar/components/statistics-panel'
import { readSystemConfig } from '@/features/system-config'
import { useState } from 'react'
import { getTodayISO } from '@/features/plans/date'
import {
  calculateStatisticsSummary,
  calculateWheelStatistics,
} from '@/features/plans/statistics'
import { usePlanStore } from '@/features/plans/store'
import { useFishingWheelStore } from '@/features/fishing-wheel/store'

export function StatisticsPage() {
  const [{ period }] = useState(readSystemConfig)
  const records = usePlanStore((state) => state.records)
  const spins = useFishingWheelStore((state) => state.spins)
  const today = getTodayISO()
  const summary = calculateStatisticsSummary('all', today, records, today, period)
  const wheelSummary = calculateWheelStatistics(spins, summary.startDate, summary.endDate)

  return (
    <div className="grid gap-8">
      <header className="text-center">
        <p className="font-display text-2xl font-semibold">{period.startDate} — {period.endDate}</p>
      </header>
      <StatisticsPanel summary={summary} wheelSummary={wheelSummary} />
    </div>
  )
}
