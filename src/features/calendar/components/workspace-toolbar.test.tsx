import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { WorkspaceToolbar } from '@/features/calendar/components/workspace-toolbar'
import { ThemeProvider } from '@/features/theme'

describe('WorkspaceToolbar', () => {
  afterEach(() => localStorage.clear())

  it('moves focus into the panel and restores it on Escape', async () => {
    const user = userEvent.setup()
    render(
      <ThemeProvider>
        <WorkspaceToolbar canGoBack={false} onBack={vi.fn()} onNavigate={vi.fn()} />
      </ThemeProvider>,
    )

    const trigger = screen.getByRole('button', { name: '打开工具栏' })
    await user.click(trigger)
    expect(screen.getByRole('button', { name: '本周总结' })).toHaveFocus()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog', { name: '日历工具栏' })).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('closes when clicking outside', async () => {
    const user = userEvent.setup()
    render(
      <ThemeProvider>
        <WorkspaceToolbar canGoBack={false} onBack={vi.fn()} onNavigate={vi.fn()} />
      </ThemeProvider>,
    )

    await user.click(screen.getByRole('button', { name: '打开工具栏' }))
    await user.click(document.body)
    expect(screen.queryByRole('dialog', { name: '日历工具栏' })).not.toBeInTheDocument()
  })
})
