import type { ButtonHTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

interface SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked: boolean
  label: string
  onCheckedChange?: (checked: boolean) => void
}

export function Switch({
  checked,
  label,
  onCheckedChange,
  className,
  disabled,
  ...props
}: SwitchProps) {
  return (
    <button
      aria-checked={checked}
      className={cn(
        'inline-flex min-h-10 items-center gap-3 text-sm text-ink disabled:cursor-not-allowed disabled:opacity-45',
        className,
      )}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
      role="switch"
      type="button"
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          'relative h-6 w-11 border border-line-strong bg-workbench transition-colors',
          checked && 'border-jade bg-jade',
        )}
      >
        <span
          className={cn(
            'absolute left-0.5 top-0.5 size-4.5 border border-line-strong bg-paper transition-transform',
            checked && 'translate-x-5 border-paper',
          )}
        />
      </span>
      <span>{label}</span>
    </button>
  )
}

