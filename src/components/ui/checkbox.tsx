import type { InputHTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
}

export function Checkbox({ label, className, ...props }: CheckboxProps) {
  return (
    <label className="inline-flex min-h-10 cursor-pointer items-center gap-3 text-sm text-ink">
      <input
        className={cn('size-4 rounded-sm accent-cinnabar', className)}
        type="checkbox"
        {...props}
      />
      <span>{label}</span>
    </label>
  )
}

