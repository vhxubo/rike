import { render, screen } from '@testing-library/react'

import { ComponentShowcasePage } from '@/pages/component-showcase-page'

describe('ComponentShowcasePage', () => {
  it('shows the date, guidance, controls, and navigation', () => {
    render(<ComponentShowcasePage date={new Date('2026-07-14T08:00:00+08:00')} />)

    expect(screen.getByText('星期二')).toBeInTheDocument()
    expect(screen.getByText('今天只读一小段，读懂一句，也是在向前走。')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '基础控件' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: '主要导航' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '打开设置' })).toBeInTheDocument()
  })
})

