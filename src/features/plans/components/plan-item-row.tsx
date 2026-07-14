import type { KeyboardEvent, Ref } from 'react'
import { tv } from 'tailwind-variants'

import type { ItemDisplayStatus, PlanTemplateItem } from '@/features/plans/model'
import { PlanStatusButton } from '@/features/plans/components/plan-status-button'
import { cn } from '@/lib/cn'

const rowStyles = tv({
  base: 'grid items-center border transition-colors',
  variants: {
    size: {
      default: 'grid-cols-[2rem_minmax(0,1fr)_2.5rem] gap-3 px-3 py-3',
      large: 'grid-cols-[3rem_minmax(0,1fr)_3.75rem] gap-4 border-2 px-5 py-5',
    },
    status: {
      upcoming: 'border-line bg-paper/80',
      pending: 'border-line-strong bg-paper',
      completed: 'border-jade/35 bg-jade-soft/45',
      missed: 'border-cinnabar/65 bg-missed',
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

const inputStyles = tv({
  base: 'min-w-0 border-0 border-b bg-transparent px-1 text-ink outline-none placeholder:text-graphite/55 focus-visible:border-cinnabar focus-visible:outline-none',
  variants: {
    size: {
      default: 'min-h-9 text-sm',
      large: 'min-h-13 border-b-2 text-lg',
    },
    completed: {
      true: 'line-through opacity-55',
      false: '',
    },
  },
  defaultVariants: {
    size: 'default',
    completed: false,
  },
})

interface PlanItemRowProps {
  canEdit: boolean
  canToggle: boolean
  exempted?: boolean
  input: string
  inputRef?: Ref<HTMLInputElement>
  isEffective?: boolean
  item: PlanTemplateItem
  onInputChange: (value: string) => void
  onInputKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void
  onToggle: () => void
  size?: 'default' | 'large'
  status: ItemDisplayStatus
}

export function PlanItemRow({
  canEdit,
  canToggle,
  exempted = false,
  input,
  inputRef,
  isEffective = true,
  item,
  onInputChange,
  onInputKeyDown,
  onToggle,
  size = 'default',
  status,
}: PlanItemRowProps) {
  const completed = status === 'completed'
  const visualStatus = isEffective ? status : 'upcoming'
  const contentClassName = cn(
    'min-w-0 leading-7',
    size === 'large' ? 'text-lg leading-9' : 'text-sm',
    completed && 'line-through opacity-55',
    visualStatus === 'missed' && 'text-cinnabar',
  )

  const inputControl = (
    <input
      aria-label={`第 ${item.order} 项计划内容`}
      className={inputStyles({ size, completed })}
      onChange={(event) => onInputChange(event.target.value)}
      onKeyDown={onInputKeyDown}
      placeholder="填写内容"
      readOnly={!canEdit}
      ref={inputRef}
      type="text"
      value={input}
    />
  )

  return (
    <li className={cn(rowStyles({ size, status: visualStatus }), exempted && 'plan-item-exempted')}>
      <span
        className={cn(
          'font-data text-sm text-graphite',
          size === 'large' && 'text-xl',
          visualStatus === 'missed' && 'text-cinnabar',
        )}
      >
        {item.order}.
      </span>

      <div className={contentClassName}>
        {item.editableMode === 'none' && item.prefix}
        {item.editableMode === 'full-input' && inputControl}
        {item.editableMode === 'suffix-input' && (
          <span className="flex min-w-0 items-baseline gap-2">
            <span className="shrink-0">{item.prefix}</span>
            {inputControl}
          </span>
        )}
        {item.editableMode === 'middle-input' && (
          <span className="flex min-w-0 flex-wrap items-baseline gap-2">
            <span className="shrink-0">{item.prefix}</span>
            {inputControl}
            <span className="shrink-0">{item.suffix}</span>
          </span>
        )}
      </div>

      <PlanStatusButton
        canToggle={canToggle}
        inactive={!isEffective}
        onToggle={onToggle}
        size={size}
        status={status}
      />
    </li>
  )
}
