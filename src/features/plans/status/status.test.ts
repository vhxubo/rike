import {
  canEditJournal,
  canEditPlan,
  canToggleStatus,
  getItemDisplayStatus,
  getNextResolution,
} from '@/features/plans/status'

describe('plan status', () => {
  const today = '2026-07-14'

  it('derives upcoming, pending, completed, and missed states', () => {
    expect(getItemDisplayStatus('2026-07-15', null, today)).toBe('upcoming')
    expect(getItemDisplayStatus(today, null, today)).toBe('pending')
    expect(getItemDisplayStatus(today, 'completed', today)).toBe('completed')
    expect(getItemDisplayStatus(today, 'missed', today)).toBe('missed')
    expect(getItemDisplayStatus('2026-07-13', null, today)).toBe('missed')
  })

  it('cycles pending or missed to completed and completed to missed', () => {
    expect(getNextResolution(null)).toBe('completed')
    expect(getNextResolution('missed')).toBe('completed')
    expect(getNextResolution('completed')).toBe('missed')
  })

  it('only allows status and journal changes today', () => {
    expect(canToggleStatus(today, today)).toBe(true)
    expect(canToggleStatus('2026-07-13', today)).toBe(false)
    expect(canToggleStatus('2026-07-15', today)).toBe(false)
    expect(canEditJournal(today, today)).toBe(true)
    expect(canEditJournal('2026-07-15', today)).toBe(false)
  })

  it('allows plan input today and in the future, but not in the past', () => {
    expect(canEditPlan('2026-07-13', today)).toBe(false)
    expect(canEditPlan(today, today)).toBe(true)
    expect(canEditPlan('2026-07-15', today)).toBe(true)
  })
})
