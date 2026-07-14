import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  CalendarRange,
  ChartNoAxesCombined,
  Dices,
  Heart,
  Menu,
  Rows3,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { IconButton } from '@/components/ui/icon-button'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { useTheme, type ThemePreference } from '@/features/theme'

export type ToolbarDestination =
  | 'day'
  | 'week-summary'
  | 'week'
  | 'month'
  | 'statistics'
  | 'favorites'
  | 'fishing-wheel'

interface WorkspaceToolbarProps {
  canGoBack: boolean
  onBack: () => void
  onNavigate: (destination: ToolbarDestination) => void
}

const themeOptions = [
  { label: '系统', value: 'system' },
  { label: '日间', value: 'light' },
  { label: '夜间', value: 'dark' },
] satisfies Array<{ label: string; value: ThemePreference }>

const destinations = [
  { value: 'day', label: '日视图', icon: CalendarDays },
  { value: 'week', label: '周视图', icon: CalendarRange },
  { value: 'month', label: '月视图', icon: BarChart3 },
  { value: 'week-summary', label: '本周总结', icon: Rows3 },
  { value: 'statistics', label: '总统计', icon: ChartNoAxesCombined },
  { value: 'favorites', label: '每日一句收藏', icon: Heart },
  { value: 'fishing-wheel', label: '摸鱼大转盘', icon: Dices },
] satisfies Array<{ value: ToolbarDestination; label: string; icon: typeof Rows3 }>

export function WorkspaceToolbar({ canGoBack, onBack, onNavigate }: WorkspaceToolbarProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const firstItemRef = useRef<HTMLButtonElement>(null)
  const { preference, resolvedTheme, setPreference } = useTheme()

  useEffect(() => {
    if (!open) return
    firstItemRef.current?.focus()

    const handlePointer = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const handleKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      triggerRef.current?.querySelector('button')?.focus()
    }

    document.addEventListener('pointerdown', handlePointer)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('pointerdown', handlePointer)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  return (
    <div className="relative flex items-center" ref={containerRef}>
      {canGoBack && (
        <IconButton label="返回" onClick={onBack} variant="ghost">
          <ArrowLeft aria-hidden="true" size={21} />
        </IconButton>
      )}
      <div ref={triggerRef}>
        <IconButton
          aria-expanded={open}
          label="打开工具栏"
          onClick={() => setOpen((value) => !value)}
          variant="ghost"
        >
          <Menu aria-hidden="true" size={21} />
        </IconButton>
      </div>

      {open && (
        <div
          aria-label="日历工具栏"
          className="absolute left-0 top-12 z-50 w-64 border border-line-strong bg-paper p-3 shadow-paper"
          role="dialog"
        >
          <div className="grid gap-1">
            {destinations.map(({ value, label, icon: Icon }, index) => (
              <button
                className="flex min-h-10 items-center gap-3 border border-transparent px-3 text-left text-sm text-ink hover:border-line-strong hover:bg-workbench"
                key={value}
                onClick={() => {
                  setOpen(false)
                  onNavigate(value)
                }}
                ref={index === 0 ? firstItemRef : undefined}
                type="button"
              >
                <Icon aria-hidden="true" size={18} strokeWidth={1.7} />
                {label}
              </button>
            ))}
          </div>

          <div className="mt-3 border-t border-line pt-3">
            <p className="mb-2 font-data text-[10px] text-graphite">
              主题 · {preference === 'system' ? `系统当前${resolvedTheme === 'dark' ? '夜间' : '日间'}` : '手动'}
            </p>
            <SegmentedControl
              label="主题模式"
              onValueChange={setPreference}
              options={themeOptions}
              value={preference}
            />
          </div>
        </div>
      )}
    </div>
  )
}
