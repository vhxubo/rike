import type { HTMLAttributes } from 'react'

import { BindingLine } from '@/components/paper/binding-line'
import { cn } from '@/lib/cn'

export function PaperSheet({ className, children, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <main
      className={cn(
        'relative min-h-dvh overflow-visible bg-paper text-ink shadow-paper sm:min-h-0',
        className,
      )}
      {...props}
    >
      <BindingLine />
      {children}
    </main>
  )
}
