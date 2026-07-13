import { render, screen } from '@testing-library/react'

import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders an accessible button', () => {
    render(<Button>开始学习</Button>)

    expect(screen.getByRole('button', { name: '开始学习' })).toBeEnabled()
  })

  it('supports the disabled state', () => {
    render(<Button disabled>暂不可用</Button>)

    expect(screen.getByRole('button', { name: '暂不可用' })).toBeDisabled()
  })
})

