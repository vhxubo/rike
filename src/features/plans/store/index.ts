import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { addISODate, getDayKind, getTodayISO } from '@/features/plans/date'
import type {
  DayPlanRecord,
  ItemResolution,
  PlanRecords,
  SaturdayDayRecord,
  SaturdayItemRecord,
  WeekdayDayRecord,
} from '@/features/plans/model'
import { canEditJournal, canEditPlan, canToggleStatus, getNextResolution } from '@/features/plans/status'
import { getWeekdayTemplate, isEffectiveWeekdayItem } from '@/features/plans/templates'
import {
  planStateStorage,
  setPlanStorageWritesBlocked,
} from '@/features/plans/store/storage'
import type { StoreHydrationState } from '@/stores'

const PLAN_STORE_VERSION = 1

interface PlanPersistedState {
  selectedDate: string
  records: PlanRecords
}

interface PlanStore extends PlanPersistedState {
  hydrationState: StoreHydrationState
  setSelectedDate: (date: string) => void
  navigateDate: (amount: number) => void
  setWeekdayInput: (date: string, itemId: string, value: string) => void
  setJournal: (date: string, value: string) => void
  toggleWeekdayResolution: (date: string, itemId: string) => void
  ensureSaturday: (date: string) => string | null
  insertSaturdayItem: (date: string, afterId: string) => string | null
  removeSaturdayItem: (date: string, itemId: string) => string | null
  setSaturdayItemText: (date: string, itemId: string, value: string) => void
  toggleSaturdayResolution: (date: string, itemId: string) => void
}

function createWeekdayRecord(date: string): WeekdayDayRecord {
  return {
    kind: 'weekday',
    date,
    inputs: {},
    resolutions: {},
    journal: '',
  }
}

function createItemId() {
  return globalThis.crypto?.randomUUID?.() ?? `plan-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function createSaturdayItem(): SaturdayItemRecord {
  return {
    id: createItemId(),
    text: '',
    subject: null,
    resolution: null,
  }
}

function createSaturdayRecord(date: string): SaturdayDayRecord {
  return {
    kind: 'saturday',
    date,
    items: [createSaturdayItem()],
  }
}

function setRecord(records: PlanRecords, date: string, record: DayPlanRecord): PlanRecords {
  return { ...records, [date]: record }
}

export const usePlanStore = create<PlanStore>()(
  persist(
    (set, get) => ({
      selectedDate: getTodayISO(),
      records: {},
      hydrationState: 'hydrating',

      setSelectedDate(date) {
        set({ selectedDate: date })
      },

      navigateDate(amount) {
        set((state) => ({ selectedDate: addISODate(state.selectedDate, amount) }))
      },

      setWeekdayInput(date, itemId, value) {
        const today = getTodayISO()
        if (!canEditPlan(date, today) || getDayKind(date) !== 'weekday') return

        const item = getWeekdayTemplate(date).find((templateItem) => templateItem.id === itemId)
        if (!item || item.editableMode === 'none') return

        set((state) => {
          const current = state.records[date]
          const record = current?.kind === 'weekday' ? current : createWeekdayRecord(date)

          return {
            records: setRecord(state.records, date, {
              ...record,
              inputs: { ...record.inputs, [itemId]: value },
            }),
          }
        })
      },

      setJournal(date, value) {
        if (!canEditJournal(date, getTodayISO()) || getDayKind(date) !== 'weekday') return

        set((state) => {
          const current = state.records[date]
          const record = current?.kind === 'weekday' ? current : createWeekdayRecord(date)

          return {
            records: setRecord(state.records, date, { ...record, journal: value }),
          }
        })
      },

      toggleWeekdayResolution(date, itemId) {
        const today = getTodayISO()
        if (!canToggleStatus(date, today) || getDayKind(date) !== 'weekday') return

        const item = getWeekdayTemplate(date).find((templateItem) => templateItem.id === itemId)
        if (!item) return

        const current = get().records[date]
        const currentRecord = current?.kind === 'weekday' ? current : createWeekdayRecord(date)
        const input = currentRecord.inputs[itemId] ?? ''
        if (!isEffectiveWeekdayItem(item, input)) return

        set((state) => {
          const stateRecord = state.records[date]
          const record = stateRecord?.kind === 'weekday' ? stateRecord : currentRecord
          const currentResolution = record.resolutions[itemId] ?? null

          return {
            records: setRecord(state.records, date, {
              ...record,
              resolutions: {
                ...record.resolutions,
                [itemId]: getNextResolution(currentResolution),
              },
            }),
          }
        })
      },

      ensureSaturday(date) {
        if (!canEditPlan(date, getTodayISO()) || getDayKind(date) !== 'saturday') return null

        const existing = get().records[date]
        if (existing?.kind === 'saturday') return existing.items[0]?.id ?? null

        const record = createSaturdayRecord(date)
        set((state) => ({ records: setRecord(state.records, date, record) }))
        return record.items[0].id
      },

      insertSaturdayItem(date, afterId) {
        if (!canEditPlan(date, getTodayISO()) || getDayKind(date) !== 'saturday') return null

        const existing = get().records[date]
        const record = existing?.kind === 'saturday' ? existing : createSaturdayRecord(date)
        const index = record.items.findIndex((item) => item.id === afterId)
        if (index < 0) return null

        const item = createSaturdayItem()
        const items = [...record.items]
        items.splice(index + 1, 0, item)

        set((state) => ({
          records: setRecord(state.records, date, { ...record, items }),
        }))
        return item.id
      },

      removeSaturdayItem(date, itemId) {
        if (!canEditPlan(date, getTodayISO()) || getDayKind(date) !== 'saturday') return null

        const existing = get().records[date]
        if (existing?.kind !== 'saturday' || existing.items.length <= 1) return null

        const index = existing.items.findIndex((item) => item.id === itemId)
        if (index < 0 || existing.items[index].text.trim()) return null

        const focusIndex = Math.max(0, index - 1)
        const items = existing.items.filter((item) => item.id !== itemId)

        set((state) => ({
          records: setRecord(state.records, date, { ...existing, items }),
        }))
        return items[focusIndex]?.id ?? null
      },

      setSaturdayItemText(date, itemId, value) {
        if (!canEditPlan(date, getTodayISO()) || getDayKind(date) !== 'saturday') return

        set((state) => {
          const current = state.records[date]
          const record = current?.kind === 'saturday' ? current : createSaturdayRecord(date)
          const items = record.items.map((item) =>
            item.id === itemId ? { ...item, text: value } : item,
          )

          return { records: setRecord(state.records, date, { ...record, items }) }
        })
      },

      toggleSaturdayResolution(date, itemId) {
        if (!canToggleStatus(date, getTodayISO()) || getDayKind(date) !== 'saturday') return

        set((state) => {
          const current = state.records[date]
          if (current?.kind !== 'saturday') return state

          const item = current.items.find((candidate) => candidate.id === itemId)
          if (!item?.text.trim()) return state

          const items = current.items.map((candidate) =>
            candidate.id === itemId
              ? {
                  ...candidate,
                  resolution: getNextResolution(candidate.resolution) as ItemResolution,
                }
              : candidate,
          )

          return { records: setRecord(state.records, date, { ...current, items }) }
        })
      },
    }),
    {
      name: 'rike-plan-state',
      version: PLAN_STORE_VERSION,
      storage: createJSONStorage(() => planStateStorage),
      partialize: (state): PlanPersistedState => ({
        selectedDate: state.selectedDate,
        records: state.records,
      }),
      onRehydrateStorage: () => (_state, error) => {
        setPlanStorageWritesBlocked(Boolean(error))
        usePlanStore.setState({ hydrationState: error ? 'failed' : 'ready' })
      },
    },
  ),
)
