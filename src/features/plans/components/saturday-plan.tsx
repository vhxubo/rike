import { useEffect, useRef, useState, type KeyboardEvent } from 'react'

import { EmptyState } from '@/components/feedback/empty-state'
import { FilePenLine } from 'lucide-react'
import { getTodayISO } from '@/features/plans/date'
import { PlanItemRow } from '@/features/plans/components/plan-item-row'
import type { PlanTemplateItem } from '@/features/plans/model'
import { canEditPlan, canToggleStatus, getItemDisplayStatus } from '@/features/plans/status'
import { usePlanStore } from '@/features/plans/store'

interface SaturdayPlanProps {
  date: string
}

function saturdayTemplate(order: number): PlanTemplateItem {
  return {
    id: `saturday-${order}`,
    order,
    subject: null,
    prefix: '',
    editableMode: 'full-input',
  }
}

export function SaturdayPlan({ date }: SaturdayPlanProps) {
  const record = usePlanStore((state) => {
    const candidate = state.records[date]
    return candidate?.kind === 'saturday' ? candidate : undefined
  })
  const ensureSaturday = usePlanStore((state) => state.ensureSaturday)
  const insertItem = usePlanStore((state) => state.insertSaturdayItem)
  const removeItem = usePlanStore((state) => state.removeSaturdayItem)
  const setItemText = usePlanStore((state) => state.setSaturdayItemText)
  const toggleResolution = usePlanStore((state) => state.toggleSaturdayResolution)
  const [focusId, setFocusId] = useState<string | null>(null)
  const inputRefs = useRef(new Map<string, HTMLInputElement>())
  const today = getTodayISO()
  const editable = canEditPlan(date, today)

  useEffect(() => {
    if (editable) ensureSaturday(date)
  }, [date, editable, ensureSaturday])

  useEffect(() => {
    if (!focusId) return
    inputRefs.current.get(focusId)?.focus()
  }, [focusId, record?.items.length])

  const handleKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    itemId: string,
    value: string,
  ) => {
    if (!editable) return

    if (event.key === 'Enter') {
      event.preventDefault()
      const newId = insertItem(date, itemId)
      if (newId) setFocusId(newId)
    }

    if (event.key === 'Backspace' && !value) {
      const previousId = removeItem(date, itemId)
      if (previousId) {
        event.preventDefault()
        setFocusId(previousId)
      }
    }
  }

  return (
    <div className="grid gap-8">
      <h2 className="text-center font-display text-3xl font-semibold text-ink">今日总目标</h2>

      {record ? (
        <ol className="grid gap-5">
          {record.items.map((item, index) => {
            const status = getItemDisplayStatus(date, item.resolution, today)

            return (
              <PlanItemRow
                canEdit={editable}
                canToggle={canToggleStatus(date, today) && Boolean(item.text.trim())}
                input={item.text}
                inputRef={(element) => {
                  if (element) inputRefs.current.set(item.id, element)
                  else inputRefs.current.delete(item.id)
                }}
                item={saturdayTemplate(index + 1)}
                isEffective={Boolean(item.text.trim())}
                key={item.id}
                onInputChange={(value) => setItemText(date, item.id, value)}
                onInputKeyDown={(event) => handleKeyDown(event, item.id, item.text)}
                onToggle={() => toggleResolution(date, item.id)}
                size="large"
                status={status}
              />
            )
          })}
        </ol>
      ) : (
        <EmptyState
          description="这一天没有留下计划内容。"
          icon={FilePenLine}
          title="无计划记录"
        />
      )}
    </div>
  )
}
