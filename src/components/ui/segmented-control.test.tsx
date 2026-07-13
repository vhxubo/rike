import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'

import { SegmentedControl } from '@/components/ui/segmented-control'

function TestSegmentedControl() {
  const [value, setValue] = useState('week')

  return (
    <SegmentedControl
      label="计划视图"
      onValueChange={setValue}
      options={[
        { label: '日', value: 'day' },
        { label: '周', value: 'week' },
        { label: '年', value: 'year' },
      ]}
      value={value}
    />
  )
}

describe('SegmentedControl', () => {
  it('changes the selected option', async () => {
    const user = userEvent.setup()
    render(<TestSegmentedControl />)

    await user.click(screen.getByRole('button', { name: '日' }))

    expect(screen.getByRole('button', { name: '日' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '周' })).toHaveAttribute('aria-pressed', 'false')
  })
})

