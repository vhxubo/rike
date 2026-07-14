import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { MonthView, WeekView } from '@/features/calendar/components'
import { usePlanStore } from '@/features/plans/store'

describe('calendar summary views', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-07-14T08:00:00+08:00'))
    usePlanStore.setState({
      selectedDate: '2026-07-14',
      calendarView: 'week',
      records: {},
      hydrationState: 'ready',
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders seven week summaries and opens a date in day view', async () => {
    const user = userEvent.setup()
    render(<WeekView date="2026-07-14" />)

    expect(screen.getByLabelText('本周七日概览').querySelectorAll('button')).toHaveLength(7)
    await user.click(screen.getByRole('button', { name: /^2026-07-16/ }))

    expect(usePlanStore.getState()).toMatchObject({
      selectedDate: '2026-07-16',
      calendarView: 'day',
    })
  })

  it('renders six calendar weeks and opens an adjacent month date in day view', async () => {
    const user = userEvent.setup()
    usePlanStore.setState({ calendarView: 'month' })
    render(<MonthView date="2026-07-14" />)

    expect(screen.getAllByRole('button')).toHaveLength(42)
    await user.click(screen.getByRole('button', { name: /^2026-08-01/ }))

    expect(usePlanStore.getState()).toMatchObject({
      selectedDate: '2026-08-01',
      calendarView: 'day',
    })
  })
})
