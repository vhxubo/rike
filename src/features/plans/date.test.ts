import {
  addISOWeek,
  addISOYear,
  addISOMonth,
  getCalendarMonthDates,
  getWeekDates,
  getYearDates,
} from '@/features/plans/date'

describe('plan date ranges', () => {
  it('navigates weeks and keeps the weekday', () => {
    expect(addISOWeek('2026-07-14', 1)).toBe('2026-07-21')
    expect(getWeekDates('2026-01-01')).toEqual([
      '2025-12-29',
      '2025-12-30',
      '2025-12-31',
      '2026-01-01',
      '2026-01-02',
      '2026-01-03',
      '2026-01-04',
    ])
  })

  it('falls back from leap day when navigating years', () => {
    expect(addISOYear('2024-02-29', 1)).toBe('2025-02-28')
    expect(getYearDates('2024-07-14')).toHaveLength(366)
    expect(getYearDates('2025-07-14')).toHaveLength(365)
  })

  it('builds a stable six-week calendar with adjacent dates', () => {
    const dates = getCalendarMonthDates('2026-07-14')
    expect(dates).toHaveLength(42)
    expect(dates[0]).toBe('2026-06-29')
    expect(dates[41]).toBe('2026-08-09')
    expect(addISOMonth('2026-01-31', 1)).toBe('2026-02-28')
  })
})
