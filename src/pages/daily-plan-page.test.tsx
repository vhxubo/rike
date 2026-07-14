import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { usePlanStore } from '@/features/plans/store'
import { ThemeProvider } from '@/features/theme'
import { DailyPlanPage } from '@/pages/daily-plan-page'

function renderPage() {
  return render(<ThemeProvider><DailyPlanPage /></ThemeProvider>)
}

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
    localStorage.clear()
    delete document.documentElement.dataset.theme
    delete document.documentElement.dataset.themePreference
    vi.useRealTimers()
  })

  it('changes the template with the date navigation buttons', async () => {
    const user = userEvent.setup()
    renderPage()

    expect(screen.getByText('英语教材深研')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '后一天' }))

    await waitFor(() => {
      expect(usePlanStore.getState().selectedDate).toBe('2026-07-15')
    })
    expect(await screen.findByText('语文点线面')).toBeInTheDocument()
  })

  it('switches between day, week, and month views with visible controls', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: '周' }))
    expect(usePlanStore.getState().calendarView).toBe('week')
    expect(await screen.findByLabelText('本周七日概览')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '月' }))
    expect(usePlanStore.getState().calendarView).toBe('month')
    expect(await screen.findByLabelText('2026-07月历')).toBeInTheDocument()
  })

  it('opens workspace tools and restores the previous calendar view', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: '打开工具栏' }))
    await user.click(screen.getByRole('button', { name: '总统计' }))
    await user.click(screen.getByRole('button', { name: '全部' }))
    expect(await screen.findByText('全部记录')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '返回' }))
    expect(await screen.findByText('英语教材深研')).toBeInTheDocument()
    expect(usePlanStore.getState()).toMatchObject({
      selectedDate: '2026-07-14',
      calendarView: 'day',
    })
  })

  it('opens the selected week summary from day view', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: '查看本周总结' }))
    expect(await screen.findByRole('heading', { name: '本周总结' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '返回' })).toBeInTheDocument()
  })

  it('returns the calendar context to today', async () => {
    const user = userEvent.setup()
    usePlanStore.setState({ selectedDate: '2026-06-10' })
    renderPage()

    await user.click(screen.getByRole('button', { name: '回到今天' }))
    expect(usePlanStore.getState().selectedDate).toBe('2026-07-14')
  })

  it('switches and persists the theme from the toolbar', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: '打开工具栏' }))
    await user.click(screen.getByRole('button', { name: '夜间' }))

    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(localStorage.getItem('rike-theme-preference')).toBe('dark')
  })
})
