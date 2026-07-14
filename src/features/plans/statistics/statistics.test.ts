import type { PlanRecords } from '@/features/plans/model'
import { calculateWeekSummary, countCharacters } from '@/features/plans/statistics'

describe('week statistics', () => {
  it('counts non-whitespace characters and keeps punctuation', () => {
    expect(countCharacters('今天 好。\n')).toBe(4)
  })

  it('counts fixed weekday plans, user text, statuses, and subject distribution', () => {
    const records: PlanRecords = {
      '2026-07-13': {
        kind: 'weekday',
        date: '2026-07-13',
        inputs: {
          'weekday-4': '细胞',
          'weekday-6': '   ',
          'weekday-7': '第一章',
        },
        resolutions: {
          'weekday-1': 'completed',
        },
        journal: '今天 好。',
      },
      '2026-07-18': {
        kind: 'saturday',
        date: '2026-07-18',
        items: [
          { id: 'sat-1', text: '整理笔记', subject: null, resolution: null },
          { id: 'sat-2', text: '  ', subject: null, resolution: 'completed' },
        ],
      },
    }

    expect(calculateWeekSummary('2026-07-19', records, '2026-07-19')).toEqual({
      planCharacterCount: 9,
      journalCharacterCount: 4,
      totalPlans: 36,
      completedPlans: 1,
      missedPlans: 35,
      missedBySubject: {
        语文: 2,
        英语: 2,
        数学: 5,
        化学: 5,
        生物: 10,
        物理: 10,
      },
    })
  })

  it('does not mark unresolved future weekdays as missed when previewing Sunday', () => {
    expect(calculateWeekSummary('2026-07-19', {}, '2026-07-14')).toMatchObject({
      totalPlans: 35,
      completedPlans: 0,
      missedPlans: 7,
      missedBySubject: {
        语文: 1,
        英语: 0,
        数学: 1,
        化学: 1,
        生物: 2,
        物理: 2,
      },
    })
  })
})
