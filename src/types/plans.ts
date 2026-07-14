import type { EditableMode, Subject } from '@/features/plans/model'

export type ISODateString = string

export interface UserPlanTemplate {
  id: string
  name: string
  items: Array<{
    id: string
    order: number
    subject: Subject | null
    prefix: string
    suffix?: string
    editableMode: EditableMode
  }>
}

export interface CyclePreset {
  id: string
  name: string
  cycle: 'day' | 'week' | 'month' | 'term'
  templateId: string
}
