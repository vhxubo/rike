import { cn } from '@/lib/cn'

export interface SegmentOption<T extends string> {
  label: string
  value: T
}

interface SegmentedControlProps<T extends string> {
  label: string
  options: SegmentOption<T>[]
  value: T
  onValueChange: (value: T) => void
}

export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onValueChange,
}: SegmentedControlProps<T>) {
  return (
    <div aria-label={label} className="inline-grid grid-flow-col border border-line-strong bg-paper p-1">
      {options.map((option) => {
        const selected = option.value === value

        return (
          <button
            aria-pressed={selected}
            className={cn(
              'min-h-8 min-w-14 px-3 text-xs text-graphite transition-colors hover:text-ink',
              selected && 'bg-ink text-paper hover:text-paper',
            )}
            key={option.value}
            onClick={() => onValueChange(option.value)}
            type="button"
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

