import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface WheelExemptionTarget {
  date: string
  itemIds: 'all' | string[]
  kind: 'weekday' | 'saturday'
}

export interface WheelSpinRecord {
  applied: boolean
  id: string
  prizeId: string
  source: 'daily' | 'paper'
  spinDate: string
  spunAt: string
  targets: WheelExemptionTarget[]
  title: string
}

export function isWheelItemExempted(
  spins: WheelSpinRecord[],
  date: string,
  itemId: string,
) {
  return spins.some((spin) =>
    spin.applied && spin.targets.some((target) =>
      target.date === date &&
      (target.itemIds === 'all' || target.itemIds.includes(itemId)),
    ),
  )
}

export function isWheelDayExempted(spins: WheelSpinRecord[], date: string) {
  return spins.some((spin) =>
    spin.applied && spin.targets.some((target) => target.date === date && target.itemIds === 'all'),
  )
}

interface FishingWheelStore {
  spins: WheelSpinRecord[]
  markApplied: (id: string) => void
  recordSpin: (spin: WheelSpinRecord) => void
}

function isWheelExemptionTarget(value: unknown): value is WheelExemptionTarget {
  if (!value || typeof value !== 'object') return false
  const target = value as Partial<WheelExemptionTarget>
  return (
    typeof target.date === 'string' &&
    (target.itemIds === 'all' ||
      (Array.isArray(target.itemIds) && target.itemIds.every((itemId) => typeof itemId === 'string'))) &&
    (target.kind === 'weekday' || target.kind === 'saturday')
  )
}

function isWheelSpinRecord(value: unknown): value is WheelSpinRecord {
  if (!value || typeof value !== 'object') return false
  const spin = value as Partial<WheelSpinRecord>
  return (
    typeof spin.applied === 'boolean' &&
    typeof spin.id === 'string' &&
    typeof spin.prizeId === 'string' &&
    (spin.source === 'daily' || spin.source === 'paper') &&
    typeof spin.spinDate === 'string' &&
    typeof spin.spunAt === 'string' &&
    Array.isArray(spin.targets) && spin.targets.every(isWheelExemptionTarget) &&
    typeof spin.title === 'string'
  )
}

export const useFishingWheelStore = create<FishingWheelStore>()(
  persist(
    (set) => ({
      spins: [],
      markApplied(id) {
        set((state) => ({
          spins: state.spins.map((spin) => spin.id === id ? { ...spin, applied: true } : spin),
        }))
      },
      recordSpin(spin) {
        set((state) => ({ spins: [...state.spins, spin] }))
      },
    }),
    {
      name: 'rike-fishing-wheel',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ spins: state.spins }),
      merge: (persisted, current) => ({
        ...current,
        spins: Array.isArray((persisted as Partial<FishingWheelStore> | undefined)?.spins)
          ? (persisted as Partial<FishingWheelStore>).spins?.filter(isWheelSpinRecord) ?? []
          : [],
      }),
    },
  ),
)
