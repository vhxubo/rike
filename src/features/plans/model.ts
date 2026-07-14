export type Subject = '语文' | '英语' | '数学' | '化学' | '生物' | '物理'

export type DayKind = 'weekday' | 'saturday' | 'sunday'

export type EditableMode = 'none' | 'suffix-input' | 'full-input' | 'middle-input'

export type ItemResolution = 'completed' | 'missed' | null

export type ItemDisplayStatus = 'upcoming' | 'pending' | 'completed' | 'missed'

export interface PlanTemplateItem {
  id: string
  order: number
  subject: Subject | null
  prefix: string
  suffix?: string
  editableMode: EditableMode
}

export interface WeekdayDayRecord {
  kind: 'weekday'
  date: string
  inputs: Record<string, string>
  resolutions: Record<string, ItemResolution>
  journal: string
}

export interface SaturdayItemRecord {
  id: string
  text: string
  subject: null
  resolution: ItemResolution
}

export interface SaturdayDayRecord {
  kind: 'saturday'
  date: string
  items: SaturdayItemRecord[]
}

export type DayPlanRecord = WeekdayDayRecord | SaturdayDayRecord

export type PlanRecords = Record<string, DayPlanRecord>
