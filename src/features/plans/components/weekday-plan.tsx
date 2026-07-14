import { Textarea } from '@/components/ui/text-field'
import { getTodayISO } from '@/features/plans/date'
import { PlanItemRow } from '@/features/plans/components/plan-item-row'
import { canEditJournal, canEditPlan, canToggleStatus, getItemDisplayStatus } from '@/features/plans/status'
import { usePlanStore } from '@/features/plans/store'
import { getWeekdayTemplate, isEffectiveWeekdayItem } from '@/features/plans/templates'

interface WeekdayPlanProps {
  date: string
}

export function WeekdayPlan({ date }: WeekdayPlanProps) {
  const record = usePlanStore((state) => {
    const candidate = state.records[date]
    return candidate?.kind === 'weekday' ? candidate : undefined
  })
  const setWeekdayInput = usePlanStore((state) => state.setWeekdayInput)
  const setJournal = usePlanStore((state) => state.setJournal)
  const toggleResolution = usePlanStore((state) => state.toggleWeekdayResolution)
  const today = getTodayISO()
  const planEditable = canEditPlan(date, today)
  const journalEditable = canEditJournal(date, today)
  const template = getWeekdayTemplate(date)

  return (
    <div className="grid gap-8">
      <ol className="grid gap-3">
        {template.map((item) => {
          const input = record?.inputs[item.id] ?? ''
          const status = getItemDisplayStatus(
            date,
            record?.resolutions[item.id] ?? null,
            today,
          )
          const effective = isEffectiveWeekdayItem(item, input)

          return (
            <PlanItemRow
              canEdit={planEditable && item.editableMode !== 'none'}
              canToggle={canToggleStatus(date, today) && effective}
              input={input}
              isEffective={effective}
              item={item}
              key={item.id}
              onInputChange={(value) => setWeekdayInput(date, item.id, value)}
              onToggle={() => toggleResolution(date, item.id)}
              status={status}
            />
          )
        })}
      </ol>

      <div className="border-t border-line pt-7">
        <Textarea
          disabled={date > today}
          label="日结 / 日记"
          onChange={(event) => setJournal(date, event.target.value)}
          placeholder={journalEditable ? '写下今天想记住的事……' : ''}
          readOnly={date < today}
          value={record?.journal ?? ''}
        />
      </div>
    </div>
  )
}
