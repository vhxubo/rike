import { useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

interface FieldFrameProps {
  id: string
  label: string
  hint?: string
  children: React.ReactNode
}

function FieldFrame({ id, label, hint, children }: FieldFrameProps) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium text-ink" htmlFor={id}>
        {label}
      </label>
      {children}
      {hint && (
        <p className="text-xs leading-5 text-graphite" id={`${id}-hint`}>
          {hint}
        </p>
      )}
    </div>
  )
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
}

export function TextField({ id, label, hint, className, ...props }: TextFieldProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId

  return (
    <FieldFrame hint={hint} id={fieldId} label={label}>
      <input
        aria-describedby={hint ? `${fieldId}-hint` : undefined}
        className={cn(
          'min-h-11 w-full rounded-sm border border-line-strong bg-paper px-3 text-sm text-ink placeholder:text-graphite/70 hover:border-ink disabled:cursor-not-allowed disabled:bg-workbench disabled:opacity-60',
          className,
        )}
        id={fieldId}
        {...props}
      />
    </FieldFrame>
  )
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  hint?: string
}

export function Textarea({ id, label, hint, className, ...props }: TextareaProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId

  return (
    <FieldFrame hint={hint} id={fieldId} label={label}>
      <textarea
        aria-describedby={hint ? `${fieldId}-hint` : undefined}
        className={cn(
          'min-h-28 w-full resize-y rounded-sm border border-line-strong bg-paper px-3 py-2 text-sm leading-6 text-ink placeholder:text-graphite/70 hover:border-ink disabled:cursor-not-allowed disabled:bg-workbench disabled:opacity-60',
          className,
        )}
        id={fieldId}
        {...props}
      />
    </FieldFrame>
  )
}

