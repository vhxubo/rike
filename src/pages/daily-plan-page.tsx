import { CalendarDays, Home, LayoutTemplate, Quote, Settings } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useRef } from 'react'

import { InlineNotice } from '@/components/feedback/inline-notice'
import { AppShell, type BottomNavItem } from '@/components/layout/app-shell'
import { TopBar } from '@/components/layout/top-bar'
import { PaperSheet } from '@/components/paper/paper-sheet'
import { RuledSection } from '@/components/paper/ruled-section'
import { IconButton } from '@/components/ui/icon-button'
import type { CalendarView } from '@/features/calendar'
import {
  PageTurn,
  type PageTurnHandle,
  ViewSwitcher,
  WeekView,
  YearView,
} from '@/features/calendar/components'
import { useCalendarZoom } from '@/features/calendar/use-calendar-zoom'
import { SAMPLE_DAILY_GUIDANCE } from '@/features/daily-guidance'
import { DateNavigator } from '@/features/plans/components/date-navigator'
import { SaturdayPlan } from '@/features/plans/components/saturday-plan'
import { SundaySummary } from '@/features/plans/components/sunday-summary'
import { WeekdayPlan } from '@/features/plans/components/weekday-plan'
import {
  addISODate,
  addISOWeek,
  addISOYear,
  getDayKind,
} from '@/features/plans/date'
import { usePlanStore } from '@/features/plans/store'
import type { StoreHydrationState } from '@/stores'

const navigation: BottomNavItem[] = [
  { label: '首页', icon: Home, active: true },
  { label: '计划', icon: CalendarDays },
  { label: '模板', icon: LayoutTemplate },
  { label: '设置', icon: Settings },
]

function DatePlan({ date, interactive = true }: { date: string; interactive?: boolean }) {
  const kind = getDayKind(date)

  if (kind === 'saturday') return <SaturdayPlan date={date} initialize={interactive} />
  if (kind === 'sunday') return <SundaySummary date={date} />
  return <WeekdayPlan date={date} />
}

function getAdjacentDate(date: string, view: CalendarView, amount: -1 | 1) {
  if (view === 'day') return addISODate(date, amount)
  if (view === 'week') return addISOWeek(date, amount)
  return addISOYear(date, amount)
}

interface CalendarPageProps {
  date: string
  hydrationState: StoreHydrationState
  interactive?: boolean
  onNavigate: (amount: -1 | 1) => void
  onViewChange: (view: CalendarView) => void
  view: CalendarView
}

function CalendarPage({
  date,
  hydrationState,
  interactive = true,
  onNavigate,
  onViewChange,
  view,
}: CalendarPageProps) {
  const reduceMotion = useReducedMotion()
  const guidanceIndex = Number(date.slice(-2)) % SAMPLE_DAILY_GUIDANCE.length
  const guidance = SAMPLE_DAILY_GUIDANCE[guidanceIndex]

  return (
    <PaperSheet>
      <TopBar
        action={
          <IconButton disabled={!interactive} label="打开设置" variant="ghost">
            <Settings aria-hidden="true" size={20} strokeWidth={1.7} />
          </IconButton>
        }
      />

      <RuledSection className="border-b border-line" eyebrow="Today">
        <DateNavigator
          date={date}
          onNext={() => onNavigate(1)}
          onPrevious={() => onNavigate(-1)}
          view={view}
        />
        <ViewSwitcher onChange={onViewChange} value={view} />
        <blockquote className="mt-6 flex gap-3 border-l border-cinnabar/45 bg-paper/90 py-2 pl-4 sm:mx-auto sm:max-w-2xl">
          <Quote
            aria-hidden="true"
            className="mt-1 shrink-0 text-cinnabar"
            size={18}
            strokeWidth={1.6}
          />
          <p className="font-display text-base leading-7 text-ink sm:text-lg">{guidance.text}</p>
        </blockquote>
      </RuledSection>

      <RuledSection className="overflow-hidden pb-28 sm:pb-24" eyebrow="Plan">
        {hydrationState === 'hydrating' ? (
          <div className="grid min-h-64 place-items-center text-sm text-graphite" role="status">
            正在整理纸页…
          </div>
        ) : (
          <>
            {hydrationState === 'failed' && (
              <InlineNotice className="mb-6" title="本地记录暂未恢复" tone="warning">
                当前仍可继续使用，已有数据不会被自动覆盖。
              </InlineNotice>
            )}

            <AnimatePresence initial={false} mode="wait">
              <motion.div
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.97 }}
                initial={{ opacity: 0, scale: reduceMotion ? 1 : 1.03 }}
                key={view}
                transition={{ duration: reduceMotion ? 0 : 0.2, ease: 'easeOut' }}
              >
                {view === 'day' && <DatePlan date={date} interactive={interactive} />}
                {view === 'week' && <WeekView date={date} interactive={interactive} />}
                {view === 'year' && <YearView date={date} interactive={interactive} />}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </RuledSection>
    </PaperSheet>
  )
}

export function DailyPlanPage() {
  const selectedDate = usePlanStore((state) => state.selectedDate)
  const calendarView = usePlanStore((state) => state.calendarView)
  const hydrationState = usePlanStore((state) => state.hydrationState)
  const setCalendarView = usePlanStore((state) => state.setCalendarView)
  const navigateRange = usePlanStore((state) => state.navigateRange)
  const pageTurnRef = useRef<PageTurnHandle>(null)
  const workspaceRef = useRef<HTMLDivElement>(null)

  useCalendarZoom(
    workspaceRef,
    calendarView,
    setCalendarView,
    () => pageTurnRef.current?.cancel(),
  )

  const renderPage = (date: string, interactive: boolean) => (
    <CalendarPage
      date={date}
      hydrationState={hydrationState}
      interactive={interactive}
      onNavigate={(amount) => interactive && pageTurnRef.current?.turn(amount)}
      onViewChange={(view) => interactive && setCalendarView(view)}
      view={calendarView}
    />
  )

  return (
    <AppShell navigation={navigation}>
      <div ref={workspaceRef}>
        <PageTurn
          onTurn={navigateRange}
          ref={pageTurnRef}
          renderAdjacent={(amount) =>
            renderPage(getAdjacentDate(selectedDate, calendarView, amount), false)
          }
        >
          {renderPage(selectedDate, true)}
        </PageTurn>
      </div>
    </AppShell>
  )
}
