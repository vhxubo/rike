import type { ReactNode } from 'react'

import { BottomNav, type BottomNavItem } from '@/components/layout/bottom-nav'
import { PageContainer } from '@/components/layout/page-container'

interface AppShellProps {
  children: ReactNode
  navigation: BottomNavItem[]
}

export function AppShell({ children, navigation }: AppShellProps) {
  return (
    <div className="min-h-dvh bg-workbench pb-20 sm:py-6 lg:py-10">
      <PageContainer>{children}</PageContainer>
      <BottomNav items={navigation} />
    </div>
  )
}

export type { BottomNavItem }

