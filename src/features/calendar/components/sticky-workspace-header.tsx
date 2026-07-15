import { ArrowLeft, BookOpenCheck } from 'lucide-react'

import {
  WorkspaceToolbar,
  type ToolbarDestination,
} from '@/features/calendar/components/workspace-toolbar'

interface StickyWorkspaceHeaderProps {
  canGoBack: boolean
  isWeekSummary: boolean
  onBack: () => void
  onNavigate: (destination: ToolbarDestination) => void
  onOpenWeekSummary: () => void
}

export function StickyWorkspaceHeader({
  canGoBack,
  isWeekSummary,
  onBack,
  onNavigate,
  onOpenWeekSummary,
}: StickyWorkspaceHeaderProps) {
  return (
    <header className="sticky top-0 z-[60] flex min-h-12 items-center justify-between border-b border-line bg-paper px-2 pt-[env(safe-area-inset-top)] sm:px-6">
      <div className="flex min-w-0 items-center gap-1 sm:gap-3">
        <WorkspaceToolbar canGoBack={canGoBack} onBack={onBack} onNavigate={onNavigate} />
        <span className="font-display text-xl font-semibold text-ink sm:text-2xl">日课</span>
        <span className="hidden font-data text-[10px] uppercase text-graphite sm:inline">Rike</span>
      </div>

      <div className="flex shrink-0 items-center" data-no-date-swipe>
        <button
          aria-label={isWeekSummary ? '返回上一页面' : '查看本周总结'}
          className="grid size-9 place-items-center border border-transparent text-ink hover:border-line-strong hover:bg-workbench"
          onClick={onOpenWeekSummary}
          title={isWeekSummary ? '返回上一页面' : '查看本周总结'}
          type="button"
        >
          {isWeekSummary
            ? <ArrowLeft aria-hidden="true" size={18} strokeWidth={1.7} />
            : <BookOpenCheck aria-hidden="true" size={18} strokeWidth={1.7} />}
        </button>
      </div>
    </header>
  )
}
