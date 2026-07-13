import type { ReactNode } from 'react'

interface TopBarProps {
  action?: ReactNode
}

export function TopBar({ action }: TopBarProps) {
  return (
    <header className="flex min-h-16 items-center justify-between border-b border-line px-5 sm:px-8">
      <div className="flex items-baseline gap-3">
        <span className="font-display text-2xl font-semibold text-ink">日课</span>
        <span className="font-data text-[11px] uppercase text-graphite">Rike</span>
      </div>
      {action}
    </header>
  )
}

