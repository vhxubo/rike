export interface SystemPeriod {
  endDate: string
  startDate: string
}

export interface SystemConfig {
  period: SystemPeriod
}

const STORAGE_KEY = 'rike-system-config'

const DEFAULT_CONFIG: SystemConfig = {
  period: {
    startDate: '2026-07-13',
    endDate: '2026-08-29',
  },
}

function isSystemPeriod(value: unknown): value is SystemPeriod {
  if (!value || typeof value !== 'object') return false
  const period = value as SystemPeriod
  return typeof period.startDate === 'string' &&
    typeof period.endDate === 'string' &&
    period.startDate <= period.endDate
}

export function readSystemConfig(storage: Pick<Storage, 'getItem' | 'setItem'> = localStorage) {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(STORAGE_KEY) ?? 'null')
    const config = parsed && typeof parsed === 'object' && isSystemPeriod((parsed as SystemConfig).period)
      ? parsed as SystemConfig
      : DEFAULT_CONFIG
    storage.setItem(STORAGE_KEY, JSON.stringify(config))
    return config
  } catch {
    return DEFAULT_CONFIG
  }
}
