import { usePlanStore } from '@/features/plans/store'

describe('plan store', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-14T08:00:00+08:00'))
    usePlanStore.setState({
      selectedDate: '2026-07-14',
      calendarView: 'day',
      records: {},
      hydrationState: 'ready',
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('cycles today from pending to completed, missed, and completed', () => {
    const { toggleWeekdayResolution } = usePlanStore.getState()

    toggleWeekdayResolution('2026-07-14', 'weekday-1')
    expect(usePlanStore.getState().records['2026-07-14']).toMatchObject({
      resolutions: { 'weekday-1': 'completed' },
    })

    toggleWeekdayResolution('2026-07-14', 'weekday-1')
    expect(usePlanStore.getState().records['2026-07-14']).toMatchObject({
      resolutions: { 'weekday-1': 'missed' },
    })

    toggleWeekdayResolution('2026-07-14', 'weekday-1')
    expect(usePlanStore.getState().records['2026-07-14']).toMatchObject({
      resolutions: { 'weekday-1': 'completed' },
    })
  })

  it('blocks status changes outside today and content changes in the past', () => {
    const store = usePlanStore.getState()

    store.toggleWeekdayResolution('2026-07-13', 'weekday-1')
    store.toggleWeekdayResolution('2026-07-15', 'weekday-1')
    store.setWeekdayInput('2026-07-13', 'weekday-4', '过去')
    store.setWeekdayInput('2026-07-15', 'weekday-4', '未来')

    expect(usePlanStore.getState().records['2026-07-13']).toBeUndefined()
    expect(usePlanStore.getState().records['2026-07-15']).toMatchObject({
      inputs: { 'weekday-4': '未来' },
      resolutions: {},
    })
  })

  it('does not toggle an empty weekday item six', () => {
    const store = usePlanStore.getState()

    store.toggleWeekdayResolution('2026-07-14', 'weekday-6')
    expect(usePlanStore.getState().records['2026-07-14']).toBeUndefined()

    store.setWeekdayInput('2026-07-14', 'weekday-6', '整理错题')
    store.toggleWeekdayResolution('2026-07-14', 'weekday-6')
    expect(usePlanStore.getState().records['2026-07-14']).toMatchObject({
      resolutions: { 'weekday-6': 'completed' },
    })
  })

  it('creates, inserts, and removes stable Saturday items', () => {
    const store = usePlanStore.getState()
    const firstId = store.ensureSaturday('2026-07-18')
    expect(firstId).toBeTruthy()

    const secondId = usePlanStore.getState().insertSaturdayItem('2026-07-18', firstId!)
    expect(secondId).toBeTruthy()

    const focusId = usePlanStore.getState().removeSaturdayItem('2026-07-18', secondId!)
    expect(focusId).toBe(firstId)
    expect(usePlanStore.getState().records['2026-07-18']).toMatchObject({
      items: [{ id: firstId }],
    })
  })

  it('navigates by the active view range', () => {
    const store = usePlanStore.getState()

    store.setCalendarView('week')
    usePlanStore.getState().navigateRange(1)
    expect(usePlanStore.getState().selectedDate).toBe('2026-07-21')

    usePlanStore.getState().setCalendarView('year')
    usePlanStore.getState().navigateRange(-1)
    expect(usePlanStore.getState().selectedDate).toBe('2025-07-21')
  })

  it('opens a calendar date atomically in day view', () => {
    usePlanStore.setState({ calendarView: 'year' })
    usePlanStore.getState().openDateInDayView('2026-12-20')

    expect(usePlanStore.getState()).toMatchObject({
      selectedDate: '2026-12-20',
      calendarView: 'day',
    })
  })
})
