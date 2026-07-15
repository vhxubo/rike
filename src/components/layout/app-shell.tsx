import type { ReactNode } from 'react'

import { PageContainer } from '@/components/layout/page-container'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="h-dvh overflow-hidden bg-workbench pb-[calc(1rem+env(safe-area-inset-bottom))] sm:py-3 sm:pb-[calc(.75rem+env(safe-area-inset-bottom))] lg:py-4 lg:pb-[calc(1rem+env(safe-area-inset-bottom))]">
      <PageContainer>{children}</PageContainer>
    </div>
  )
}
