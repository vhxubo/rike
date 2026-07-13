export type ISODateString = string

export interface PlanItem {
  id: string
  title: string
  subject?: string
  date: ISODateString
  completed: boolean
  order: number
}

export interface WeeklyPlan {
  id: string
  weekStartsOn: ISODateString
  items: PlanItem[]
  updatedAt: string
}

export interface PlanTemplate {
  id: string
  name: string
  items: Array<Pick<PlanItem, 'title' | 'subject' | 'order'>>
}

export interface CyclePreset {
  id: string
  name: string
  cycle: 'day' | 'week' | 'month' | 'term'
  templateId: string
}

