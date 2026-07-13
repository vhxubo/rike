import { cn } from '@/lib/cn'

interface DividerProps {
  className?: string
  label?: string
}

export function Divider({ className, label }: DividerProps) {
  if (!label) {
    return <hr className={cn('border-0 border-t border-line', className)} />
  }

  return (
    <div className={cn('flex items-center gap-3', className)} role="separator">
      <span className="h-px flex-1 bg-line" />
      <span className="font-data text-[11px] text-graphite">{label}</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  )
}

