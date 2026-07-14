import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { WeekdayPlan } from '@/features/plans/components/weekday-plan'
import { usePlanStore } from '@/features/plans/store'

describe('WeekdayPlan', () => {
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

  it('renders the Tuesday template and editable fields', async () => {
    const user = userEvent.setup()
    render(<WeekdayPlan date="2026-07-14" />)

    expect(screen.getByText('英语教材深研')).toBeInTheDocument()
    expect(screen.getByText('数学错题/知识点收集整理')).toBeInTheDocument()
    expect(screen.getByText('化学错题深研')).toBeInTheDocument()

    const biologyInput = screen.getByRole('textbox', { name: '第 4 项计划内容' })
    await user.type(biologyInput, '细胞章节')

    expect(usePlanStore.getState().records['2026-07-14']).toMatchObject({
      inputs: { 'weekday-4': '细胞章节' },
    })
    expect(screen.getByRole('button', { name: '没有计划内容' })).toBeDisabled()
  })

  it('cycles today through completed, missed, and completed visuals', async () => {
    const user = userEvent.setup()
    render(<WeekdayPlan date="2026-07-14" />)

    await user.click(screen.getAllByRole('button', { name: '标记为已完成' })[0])
    const completedButton = screen.getByRole('button', { name: '取消完成并标记为未完成' })
    expect(completedButton.closest('li')).toHaveTextContent('英语教材深研')

    await user.click(completedButton)
    const missedButton = screen.getByRole('button', { name: '重新标记为已完成' })
    expect(missedButton.closest('li')).toHaveClass('bg-missed')

    await user.click(missedButton)
    expect(screen.getByRole('button', { name: '取消完成并标记为未完成' })).toBeInTheDocument()
  })

  it('locks all content and status in the past', () => {
    render(<WeekdayPlan date="2026-07-13" />)

    expect(screen.getByRole('textbox', { name: '第 4 项计划内容' })).toHaveAttribute(
      'readonly',
    )
    expect(screen.getAllByRole('button', { name: '未完成' })[0]).toBeDisabled()
    expect(screen.getByRole('button', { name: '没有计划内容' }).closest('li')).not.toHaveClass(
      'bg-missed',
    )
  })

  it('allows future plan input but disables status and journal', () => {
    render(<WeekdayPlan date="2026-07-15" />)

    expect(screen.getByRole('textbox', { name: '第 4 项计划内容' })).not.toHaveAttribute(
      'readonly',
    )
    expect(screen.getAllByRole('button', { name: '未来计划，暂不可调整状态' })[0]).toBeDisabled()
    expect(screen.getByRole('textbox', { name: '日结 / 日记' })).toBeDisabled()
  })
})
