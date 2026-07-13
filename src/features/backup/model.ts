import type { CalendarCursor } from '@/features/calendar'
import type { CyclePreset, PlanTemplate, WeeklyPlan } from '@/types/plans'

export const BACKUP_SCHEMA_VERSION = 1 as const

export interface BackupData {
  plans: WeeklyPlan[]
  templates: PlanTemplate[]
  cyclePresets: CyclePreset[]
  settings: Record<string, unknown>
  calendar: CalendarCursor
}

export interface BackupEnvelope {
  schemaVersion: typeof BACKUP_SCHEMA_VERSION
  exportedAt: string
  data: BackupData
}

export type BackupValidationResult =
  | { valid: true; backup: BackupEnvelope }
  | { valid: false; reason: 'invalid-json' | 'invalid-shape' | 'unsupported-version' }

