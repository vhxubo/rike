import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/cn'

export interface BottomNavItem {
  label: string
  icon: LucideIcon
  active?: boolean
}

interface BottomNavProps {
  items: BottomNavItem[]
}

export function BottomNav({ items }: BottomNavProps) {
  return (
    <nav
      aria-label="主要导航"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line-strong bg-paper/95 px-[max(0.75rem,env(safe-area-inset-left))] pb-[env(safe-area-inset-bottom)] backdrop-blur-sm sm:bottom-5 sm:left-1/2 sm:right-auto sm:w-[min(32rem,calc(100%-3rem))] sm:-translate-x-1/2 sm:border"
    >
      <ul className="grid h-16 grid-cols-4">
        {items.map(({ label, icon: Icon, active }) => (
          <li key={label}>
            <button
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex h-full w-full flex-col items-center justify-center gap-1 text-[11px] text-graphite transition-colors hover:text-ink',
                active && 'text-cinnabar',
              )}
              type="button"
            >
              <Icon aria-hidden="true" size={19} strokeWidth={1.7} />
              <span>{label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

