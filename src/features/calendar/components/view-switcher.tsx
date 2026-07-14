import { SegmentedControl } from '@/components/ui/segmented-control'
import type { CalendarView } from '@/features/calendar'

const options = [
  { label: '日', value: 'day' },
  { label: '周', value: 'week' },
  { label: '年', value: 'year' },
] satisfies Array<{ label: string; value: CalendarView }>

interface ViewSwitcherProps {
  value: CalendarView
  onChange: (view: CalendarView) => void
}

export function ViewSwitcher({ value, onChange }: ViewSwitcherProps) {
  return (
    <div className="mt-5 flex justify-center" data-no-date-swipe>
      <SegmentedControl
        label="日历视图"
        onValueChange={onChange}
        options={options}
        value={value}
      />
    </div>
  )
}
