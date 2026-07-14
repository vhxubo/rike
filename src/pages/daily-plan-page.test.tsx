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
})
