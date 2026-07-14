import { calculateDayOverview } from '@/features/plans/statistics'
import type { PlanRecords } from '@/features/plans/model'

describe('day overview', () => {
  const today = '2026-07-14'

  it('derives pending, missed, upcoming, and completed weekdays', () => {
    expect(calculateDayOverview(today, {}, today)).toMatchObject({
      totalPlans: 7,
      status: 'pending',
    })
    expect(calculateDayOverview('2026-07-13', {}, today).status).toBe('missed')
    expect(calculateDayOverview('2026-07-15', {}, today).status).toBe('upcoming')

    const resolutions = Object.fromEntries(
      Array.from({ length: 8 }, (_, index) => [`weekday-${index + 1}`, 'completed']),
    )
    const records = {
      [today]: { kind: 'weekday', date: today, inputs: {}, resolutions, journal: '' },
    } as PlanRecords

    expect(calculateDayOverview(today, records, today).status).toBe('completed')
  })

  it('keeps empty weekends neutral and counts effective Saturday rows', () => {
    expect(calculateDayOverview('2026-07-18', {}, today).status).toBe('empty')
    expect(calculateDayOverview('2026-07-19', {}, today).status).toBe('empty')

    const records: PlanRecords = {
      '2026-07-18': {
        kind: 'saturday',
        date: '2026-07-18',
        items: [
          { id: 'blank', text: ' ', subject: null, resolution: null },
          { id: 'plan', text: '复习', subject: null, resolution: 'completed' },
        ],
      },
    }

    expect(calculateDayOverview('2026-07-18', records, '2026-07-18')).toMatchObject({
      totalPlans: 1,
      completedPlans: 1,
      status: 'completed',
    })
  })
})
