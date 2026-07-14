import { CalendarDays } from 'lucide-react'

interface DateStampProps {
  date: Date
}

const weekdayFormatter = new Intl.DateTimeFormat('zh-CN', { weekday: 'long' })
const fullDateFormatter = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export function DateStamp({ date }: DateStampProps) {
  const dateParts = fullDateFormatter.formatToParts(date)
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    dateParts.find((item) => item.type === type)?.value ?? ''

  return (
    <div className="flex items-center gap-3" aria-label={fullDateFormatter.format(date)}>
      <span className="grid size-11 place-items-center border border-cinnabar text-cinnabar">
        <CalendarDays aria-hidden="true" size={21} strokeWidth={1.6} />
      </span>
      <div>
        <p className="font-data text-xs text-graphite">
          {part('year')} / {part('month')} / {part('day')}
        </p>
        <p className="font-display text-lg font-semibold">{weekdayFormatter.format(date)}</p>
      </div>
    </div>
  )
}

