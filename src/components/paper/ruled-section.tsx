import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

interface RuledSectionProps extends HTMLAttributes<HTMLElement> {
  title?: string
  eyebrow?: string
}

export function RuledSection({
  title,
  eyebrow,
  className,
  children,
  ...props
}: RuledSectionProps) {
  return (
    <section className={cn('paper-rules px-6 py-7 sm:px-10', className)} {...props}>
      {(eyebrow || title) && (
        <header className="mb-5 bg-paper/92 py-1">
          {eyebrow && (
            <p className="font-data text-[11px] uppercase text-cinnabar">{eyebrow}</p>
          )}
          {title && <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>}
        </header>
      )}
      {children}
    </section>
  )
}

