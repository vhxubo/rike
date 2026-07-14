import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { CalendarView } from '@/features/calendar'
import {
  addISODate,
  addISOMonth,
  addISOWeek,
  getDayKind,
  getTodayISO,
} from '@/features/plans/date'
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

const PLAN_STORE_VERSION = 3

export interface PlanPersistedState {
  selectedDate: string
  calendarView: CalendarView
  records: PlanRecords
}

interface PlanStore extends PlanPersistedState {
  hydrationState: StoreHydrationState
  setSelectedDate: (date: string) => void
  setCalendarView: (view: CalendarView) => void
  setCalendarCursor: (date: string, view: CalendarView) => void
  openDateInDayView: (date: string) => void
  navigateDate: (amount: number) => void
  navigateRange: (amount: number) => void
  setWeekdayInput: (date: string, itemId: string, value: string) => void
  setJournal: (date: string, value: string) => void
  toggleWeekdayResolution: (date: string, itemId: string) => void
  ensureSaturday: (date: string) => string | null
  insertSaturdayItem: (date: string, afterId: string) => string | null
  removeSaturdayItem: (date: string, itemId: string) => string | null
  setSaturdayItemText: (date: string, itemId: string, value: string) => void
  toggleSaturdayResolution: (date: string, itemId: string) => void
  applyWheelExemptions: (targets: Array<{
    date: string
    itemIds: 'all' | string[]
    kind: 'weekday' | 'saturday'
  }>) => void
}

function isCalendarView(value: unknown): value is CalendarView {
  return value === 'day' || value === 'week' || value === 'month'
}

export function migratePlanPersistedState(persistedState: unknown): PlanPersistedState {
  const candidate =
    persistedState && typeof persistedState === 'object'
      ? (persistedState as {
          selectedDate?: unknown
          calendarView?: unknown
          records?: unknown
        })
      : {}

  return {
    selectedDate:
      typeof candidate.selectedDate === 'string' ? candidate.selectedDate : getTodayISO(),
    calendarView:
      candidate.calendarView === 'year'
        ? 'month'
        : isCalendarView(candidate.calendarView)
          ? candidate.calendarView
          : 'day',
    records:
      candidate.records && typeof candidate.records === 'object'
        ? (candidate.records as PlanRecords)
        : {},
  }
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
      calendarView: 'day',
      records: {},
      hydrationState: 'hydrating',

      setSelectedDate(date) {
        set({ selectedDate: date })
      },

      setCalendarView(calendarView) {
        set({ calendarView })
      },

      setCalendarCursor(selectedDate, calendarView) {
        set({ selectedDate, calendarView })
      },

      openDateInDayView(date) {
        set({ selectedDate: date, calendarView: 'day' })
      },

      navigateDate(amount) {
        set((state) => ({ selectedDate: addISODate(state.selectedDate, amount) }))
      },

      navigateRange(amount) {
        set((state) => ({
          selectedDate:
            state.calendarView === 'day'
              ? addISODate(state.selectedDate, amount)
              : state.calendarView === 'week'
                ? addISOWeek(state.selectedDate, amount)
                : addISOMonth(state.selectedDate, amount),
        }))
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

      applyWheelExemptions(targets) {
        set((state) => {
          let records = state.records

          for (const target of targets) {
            if (target.kind === 'weekday') {
              if (getDayKind(target.date) !== 'weekday') continue
              const current = records[target.date]
              const record = current?.kind === 'weekday' ? current : createWeekdayRecord(target.date)
              const templateItemIds = getWeekdayTemplate(target.date).map((item) => item.id)
              const itemIds = target.itemIds === 'all'
                ? templateItemIds
                : target.itemIds.filter((itemId) => templateItemIds.includes(itemId))
              const resolutions = { ...record.resolutions }
              for (const itemId of itemIds) resolutions[itemId] = 'completed'
              records = setRecord(records, target.date, { ...record, resolutions })
              continue
            }

            const current = records[target.date]
            if (getDayKind(target.date) !== 'saturday') continue
            if (current?.kind !== 'saturday') continue
            const itemIds = target.itemIds === 'all'
              ? new Set(current.items.map((item) => item.id))
              : new Set(target.itemIds)
            records = setRecord(records, target.date, {
              ...current,
              items: current.items.map((item) =>
                itemIds.has(item.id) && item.text.trim()
                  ? { ...item, resolution: 'completed' as const }
                  : item,
              ),
            })
          }

          return { records }
        })
      },
    }),
    {
      name: 'rike-plan-state',
      version: PLAN_STORE_VERSION,
      storage: createJSONStorage(() => planStateStorage),
      partialize: (state): PlanPersistedState => ({
        selectedDate: state.selectedDate,
        calendarView: state.calendarView,
        records: state.records,
      }),
      migrate: (persistedState) => migratePlanPersistedState(persistedState),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...migratePlanPersistedState(persistedState),
      }),
      onRehydrateStorage: () => (_state, error) => {
        setPlanStorageWritesBlocked(Boolean(error))
        usePlanStore.setState({ hydrationState: error ? 'failed' : 'ready' })
      },
    },
  ),
)
