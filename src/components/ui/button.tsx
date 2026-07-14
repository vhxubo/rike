import type { ButtonHTMLAttributes } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'

import { cn } from '@/lib/cn'

const buttonStyles = tv({
  base: 'inline-flex min-h-10 items-center justify-center gap-2 border px-4 text-sm font-medium transition-[color,background-color,border-color,transform] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45',
  variants: {
    variant: {
      primary: 'border-ink bg-ink text-paper hover:bg-ink/90',
      secondary: 'border-line-strong bg-paper text-ink hover:border-ink',
      accent: 'border-cinnabar bg-cinnabar text-paper hover:bg-cinnabar/90',
      ghost: 'border-transparent bg-transparent text-ink hover:bg-ink/5',
    },
    size: {
      sm: 'min-h-9 px-3 text-xs',
      md: 'min-h-10 px-4 text-sm',
      lg: 'min-h-11 px-5 text-base',
      icon: 'size-10 min-h-10 p-0',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
})

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonStyles> {}

export function Button({ className, variant, size, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonStyles({ variant, size }), className)}
      type={type}
      {...props}
    />
  )
}

