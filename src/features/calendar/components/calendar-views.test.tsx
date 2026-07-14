import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { WeekView, YearView } from '@/features/calendar/components'
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

  it('renders twelve months and opens a year date in day view', async () => {
    const user = userEvent.setup()
    usePlanStore.setState({ calendarView: 'year' })
    render(<YearView date="2026-07-14" />)

    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(12)
    await user.click(screen.getByRole('button', { name: /^2026-12-20/ }))

    expect(usePlanStore.getState()).toMatchObject({
      selectedDate: '2026-12-20',
      calendarView: 'day',
    })
  })
})
