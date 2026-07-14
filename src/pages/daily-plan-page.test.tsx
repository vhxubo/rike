import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { usePlanStore } from '@/features/plans/store'
import { DailyPlanPage } from '@/pages/daily-plan-page'

describe('DailyPlanPage', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
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

  it('changes the template with the date navigation buttons', async () => {
    const user = userEvent.setup()
    render(<DailyPlanPage />)

    expect(screen.getByText('英语教材深研')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '后一天' }))

    await waitFor(() => {
      expect(usePlanStore.getState().selectedDate).toBe('2026-07-15')
    })
    expect(await screen.findByText('语文点线面')).toBeInTheDocument()
  })

  it('switches between day, week, and year views with visible controls', async () => {
    const user = userEvent.setup()
    render(<DailyPlanPage />)

    await user.click(screen.getByRole('button', { name: '周' }))
    expect(usePlanStore.getState().calendarView).toBe('week')
    expect(await screen.findByLabelText('本周七日概览')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '年' }))
    expect(usePlanStore.getState().calendarView).toBe('year')
    expect(await screen.findByLabelText('2026年日历')).toBeInTheDocument()
  })
})
