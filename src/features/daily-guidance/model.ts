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

export interface DailyGuidanceFavorite {
  date: string
  guidanceId: string
  savedAt: number
  text: string
}
