import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { IconButton } from '@/components/ui/icon-button'
import { formatCompactDate, formatDisplayDate, formatWeekday, getTodayISO } from '@/features/plans/date'

interface DateNavigatorProps {
  date: string
  onNext: () => void
  onPrevious: () => void
}

export function DateNavigator({ date, onNext, onPrevious }: DateNavigatorProps) {
  const isToday = date === getTodayISO()

  return (
    <div className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-3" aria-live="polite">
      <IconButton label="前一天" onClick={onPrevious} variant="ghost">
        <ChevronLeft aria-hidden="true" size={22} />
      </IconButton>

      <div className="min-w-0 text-center" title={formatDisplayDate(date)}>
        <div className="flex min-h-6 items-center justify-center gap-2">
          <span className="font-data text-xs text-graphite">{formatCompactDate(date)}</span>
          {isToday && <Badge tone="accent">今天</Badge>}
        </div>
        <p className="mt-1 font-display text-2xl font-semibold text-ink">{formatWeekday(date)}</p>
      </div>

      <IconButton label="后一天" onClick={onNext} variant="ghost">
        <ChevronRight aria-hidden="true" size={22} />
      </IconButton>
    </div>
  )
}
