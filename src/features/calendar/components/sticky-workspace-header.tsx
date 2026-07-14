import { BookOpenCheck } from 'lucide-react'

import type { CalendarView } from '@/features/calendar'
import {
  WorkspaceToolbar,
  type ToolbarDestination,
} from '@/features/calendar/components/workspace-toolbar'
import { cn } from '@/lib/cn'

const views = [
  { label: '日', value: 'day' },
  { label: '周', value: 'week' },
  { label: '月', value: 'month' },
] satisfies Array<{ label: string; value: CalendarView }>

interface StickyWorkspaceHeaderProps {
  canGoBack: boolean
  onBack: () => void
  onNavigate: (destination: ToolbarDestination) => void
  onOpenWeekSummary: () => void
  onViewChange: (view: CalendarView) => void
  view: CalendarView
}

export function StickyWorkspaceHeader({
  canGoBack,
  onBack,
  onNavigate,
  onOpenWeekSummary,
  onViewChange,
  view,
}: StickyWorkspaceHeaderProps) {
  return (
    <header className="sticky top-0 z-[60] flex min-h-16 items-center justify-between border-b border-line bg-paper/95 px-2 pt-[env(safe-area-inset-top)] backdrop-blur-sm sm:px-6">
      <div className="flex min-w-0 items-center gap-1 sm:gap-3">
        <WorkspaceToolbar canGoBack={canGoBack} onBack={onBack} onNavigate={onNavigate} />
        <span className="font-display text-xl font-semibold text-ink sm:text-2xl">日课</span>
        <span className="hidden font-data text-[10px] uppercase text-graphite sm:inline">Rike</span>
      </div>

      <div className="flex shrink-0 items-center gap-1" data-no-date-swipe>
        <button
          aria-label="查看本周总结"
          className="grid size-9 place-items-center border border-transparent text-ink hover:border-line-strong hover:bg-workbench"
          onClick={onOpenWeekSummary}
          title="查看本周总结"
          type="button"
        >
          <BookOpenCheck aria-hidden="true" size={18} strokeWidth={1.7} />
        </button>
        <div aria-label="日历视图" className="grid grid-cols-3 border border-line-strong bg-paper p-0.5">
          {views.map((option) => {
            const selected = view === option.value
            return (
              <button
                aria-pressed={selected}
                className={cn(
                  'grid size-8 place-items-center font-data text-[11px] text-graphite hover:text-ink',
                  selected && 'bg-ink text-paper hover:text-paper',
                )}
                key={option.value}
                onClick={() => onViewChange(option.value)}
                type="button"
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>
    </header>
  )
}
