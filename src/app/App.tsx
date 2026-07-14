import { DailyPlanPage } from '@/pages/daily-plan-page'
import { useNativeBehaviorGuards } from '@/app/native-behavior'

export function App() {
  useNativeBehaviorGuards()
  return <DailyPlanPage />
}
