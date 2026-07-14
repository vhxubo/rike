import type { ReactNode } from 'react'

import { PageContainer } from '@/components/layout/page-container'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-dvh overflow-x-clip bg-workbench sm:py-6 lg:py-10">
      <PageContainer>{children}</PageContainer>
    </div>
  )
}
