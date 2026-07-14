import { render, screen } from '@testing-library/react'

import { SundaySummary } from '@/features/plans/components/sunday-summary'
import { usePlanStore } from '@/features/plans/store'

describe('SundaySummary', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-07-19T08:00:00+08:00'))
    usePlanStore.setState({ records: {}, hydrationState: 'ready' })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows the fixed weekly baseline and subject distribution', () => {
    render(<SundaySummary date="2026-07-19" />)

    expect(screen.getByText('计划总数').parentElement).toHaveTextContent('35项')
    expect(screen.getByText('已完成').parentElement).toHaveTextContent('0项')
    expect(screen.getByText('未完成').parentElement).toHaveTextContent('35项')
    expect(screen.getByText('生物').parentElement).toHaveTextContent('10')
    expect(screen.getByText('物理').parentElement).toHaveTextContent('10')
  })
})
