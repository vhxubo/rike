import { migratePlanPersistedState } from '@/features/plans/store'

describe('plan store migration', () => {
  it('keeps v1 records and defaults to day view', () => {
    const records = {
      '2026-07-14': {
        kind: 'weekday' as const,
        date: '2026-07-14',
        inputs: { 'weekday-4': '遗传' },
        resolutions: {},
        journal: '',
      },
    }

    expect(migratePlanPersistedState({ selectedDate: '2026-07-14', records })).toEqual({
      selectedDate: '2026-07-14',
      calendarView: 'day',
      records,
    })
  })

  it('keeps valid views and rejects invalid values', () => {
    expect(migratePlanPersistedState({ calendarView: 'week' }).calendarView).toBe('week')
    expect(migratePlanPersistedState({ calendarView: 'year' }).calendarView).toBe('month')
    expect(migratePlanPersistedState({ calendarView: 'decade' }).calendarView).toBe('day')
  })
})
