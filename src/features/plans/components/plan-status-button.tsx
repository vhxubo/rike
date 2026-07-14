import { Clock3, Square, SquareCheckBig, TriangleAlert } from 'lucide-react'
import { tv } from 'tailwind-variants'

import type { ItemDisplayStatus } from '@/features/plans/model'
import { cn } from '@/lib/cn'

const statusButtonStyles = tv({
  base: 'grid shrink-0 place-items-center border bg-paper transition-[color,border-color,background-color,transform] enabled:active:scale-95 disabled:cursor-default',
  variants: {
    size: {
      default: 'size-10',
      large: 'size-15 border-2',
    },
    status: {
      upcoming: 'border-line text-graphite',
      pending: 'border-line-strong text-ink enabled:hover:border-cinnabar enabled:hover:text-cinnabar',
      completed: 'border-jade bg-jade-soft text-jade',
      missed: 'border-cinnabar bg-cinnabar text-warning',
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

const icons = {
  upcoming: Clock3,
  pending: Square,
  completed: SquareCheckBig,
  missed: TriangleAlert,
}

function getLabel(status: ItemDisplayStatus, canToggle: boolean) {
  if (status === 'upcoming') return '未来计划，暂不可调整状态'
  if (status === 'pending') return '标记为已完成'
  if (status === 'completed') return canToggle ? '取消完成并标记为未完成' : '已完成'
  return canToggle ? '重新标记为已完成' : '未完成'
}

interface PlanStatusButtonProps {
  canToggle: boolean
  inactive?: boolean
  onToggle: () => void
  size?: 'default' | 'large'
  status: ItemDisplayStatus
}

export function PlanStatusButton({
  canToggle,
  inactive = false,
  onToggle,
  size = 'default',
  status,
}: PlanStatusButtonProps) {
  const visualStatus = inactive ? 'upcoming' : status
  const Icon = icons[visualStatus]
  const iconSize = size === 'large' ? 29 : 20
  const label = inactive ? '没有计划内容' : getLabel(status, canToggle)

  return (
    <button
      aria-label={label}
      aria-pressed={status === 'completed'}
      className={cn(statusButtonStyles({ size, status: visualStatus }))}
      disabled={!canToggle}
      onClick={onToggle}
      title={label}
      type="button"
    >
      <Icon aria-hidden="true" size={iconSize} strokeWidth={1.8} />
    </button>
  )
}
