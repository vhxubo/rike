import type { HTMLAttributes } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'

import { cn } from '@/lib/cn'

const badgeStyles = tv({
  base: 'inline-flex min-h-6 items-center rounded-sm border px-2 font-data text-[11px]',
  variants: {
    tone: {
      neutral: 'border-line-strong bg-paper text-graphite',
      accent: 'border-cinnabar/40 bg-cinnabar-soft text-cinnabar',
      success: 'border-jade/40 bg-jade-soft text-jade',
    },
  },
  defaultVariants: {
    tone: 'neutral',
  },
})

interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeStyles> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeStyles({ tone }), className)} {...props} />
}

