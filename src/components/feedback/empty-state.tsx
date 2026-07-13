import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  action?: ReactNode
  description: string
  icon: LucideIcon
  title: string
}

export function EmptyState({ action, description, icon: Icon, title }: EmptyStateProps) {
  return (
    <div className="grid justify-items-center rounded-sm border border-dashed border-line-strong bg-paper/80 px-5 py-8 text-center">
      <span className="grid size-11 place-items-center rounded-sm border border-line text-graphite">
        <Icon aria-hidden="true" size={21} strokeWidth={1.6} />
      </span>
      <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm leading-6 text-graphite">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

