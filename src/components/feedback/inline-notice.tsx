import { CircleAlert, CircleCheck, Info } from 'lucide-react'
import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

interface InlineNoticeProps extends HTMLAttributes<HTMLDivElement> {
  tone?: 'info' | 'success' | 'warning'
  title: string
}

const toneStyles = {
  info: 'border-line-strong bg-workbench/60 text-ink',
  success: 'border-jade/45 bg-jade-soft/75 text-jade',
  warning: 'border-cinnabar/45 bg-cinnabar-soft/75 text-cinnabar',
}

const toneIcons = {
  info: Info,
  success: CircleCheck,
  warning: CircleAlert,
}

export function InlineNotice({
  tone = 'info',
  title,
  children,
  className,
  ...props
}: InlineNoticeProps) {
  const Icon = toneIcons[tone]

  return (
    <div
      className={cn('flex gap-3 rounded-sm border p-4', toneStyles[tone], className)}
      role="status"
      {...props}
    >
      <Icon aria-hidden="true" className="mt-0.5 shrink-0" size={18} strokeWidth={1.7} />
      <div>
        <p className="text-sm font-semibold">{title}</p>
        {children && <div className="mt-1 text-sm leading-6 opacity-85">{children}</div>}
      </div>
    </div>
  )
}

