export type GuidanceCategory =
  | 'language'
  | 'reading'
  | 'writing'
  | 'review'
  | 'rest'
  | 'exam'
  | 'reflection'

export interface DailyGuidance {
  id: string
  text: string
  category: GuidanceCategory
  tags: string[]
}

