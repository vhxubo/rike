import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { nextSaturday } from 'date-fns'

import { toISODate } from '@/features/plans/date'
import { SaturdayPlan } from '@/features/plans/components/saturday-plan'
import { usePlanStore } from '@/features/plans/store'

describe('SaturdayPlan', () => {
  const saturday = toISODate(nextSaturday(new Date()))

  beforeEach(async () => {
    await act(async () => {
      await usePlanStore.persist.rehydrate()
    })
    usePlanStore.setState({
      selectedDate: saturday,
      records: {
        [saturday]: {
          kind: 'saturday',
          date: saturday,
          items: [{ id: 'sat-first', text: '', subject: null, resolution: null }],
        },
      },
      hydrationState: 'ready',
    })
  })

  it('adds a numbered item with Enter and removes an empty item with Backspace', async () => {
    render(<SaturdayPlan date={saturday} />)

    const firstInput = await screen.findByRole('textbox', { name: '第 1 项计划内容' })
    expect(firstInput).toHaveClass('text-lg')

    fireEvent.change(firstInput, { target: { value: '完成本周复习' } })
    fireEvent.keyDown(firstInput, { key: 'Enter' })

    const secondInput = await screen.findByRole('textbox', { name: '第 2 项计划内容' })
    expect(secondInput).toHaveFocus()

    fireEvent.keyDown(secondInput, { key: 'Backspace' })
    await waitFor(() => {
      expect(screen.queryByRole('textbox', { name: '第 2 项计划内容' })).not.toBeInTheDocument()
    })

    expect(screen.getByRole('textbox', { name: '第 1 项计划内容' })).toHaveValue(
      '完成本周复习',
    )
  })
})
