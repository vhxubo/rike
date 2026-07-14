import { CalendarDays, Home, LayoutTemplate, Quote, Settings } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useRef, useState, type ReactNode } from 'react'

import { InlineNotice } from '@/components/feedback/inline-notice'
import { AppShell, type BottomNavItem } from '@/components/layout/app-shell'
import { TopBar } from '@/components/layout/top-bar'
import { PaperSheet } from '@/components/paper/paper-sheet'
import { RuledSection } from '@/components/paper/ruled-section'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import type { CalendarView } from '@/features/calendar'
import {
  MonthView,
  PageTurn,
  type PageTurnHandle,
  StatisticsPage,
  StatisticsPanel,
  type ToolbarDestination,
  ViewSwitcher,
  WeekView,
  WorkspaceToolbar,
} from '@/features/calendar/components'
import { useCalendarZoom } from '@/features/calendar/use-calendar-zoom'
import { SAMPLE_DAILY_GUIDANCE } from '@/features/daily-guidance'
import { DateNavigator } from '@/features/plans/components/date-navigator'
import { SaturdayPlan } from '@/features/plans/components/saturday-plan'
import { SundaySummary } from '@/features/plans/components/sunday-summary'
import { WeekdayPlan } from '@/features/plans/components/weekday-plan'
import {
  addISODate,
  addISOMonth,
  addISOWeek,
  addISOYear,
  getDayKind,
  getTodayISO,
  getWeekDates,
} from '@/features/plans/date'
import {
  calculateStatisticsSummary,
  type StatisticsRange,
} from '@/features/plans/statistics'
import { usePlanStore } from '@/features/plans/store'
import type { StoreHydrationState } from '@/stores'

type WorkspacePage = 'calendar' | 'week-summary' | 'statistics'

interface ReturnSnapshot {
  date: string
  page: WorkspacePage
  view: CalendarView
}

const navigation: BottomNavItem[] = [
  { label: '首页', icon: Home, active: true },
  { label: '计划', icon: CalendarDays },
  { label: '模板', icon: LayoutTemplate },
  { label: '设置', icon: Settings },
]

function SettingsAction({ disabled = false }: { disabled?: boolean }) {
  return (
    <IconButton disabled={disabled} label="打开设置" variant="ghost">
      <Settings aria-hidden="true" size={20} strokeWidth={1.7} />
    </IconButton>
  )
}

function DatePlan({ date, interactive = true }: { date: string; interactive?: boolean }) {
  const kind = getDayKind(date)
  if (kind === 'saturday') return <SaturdayPlan date={date} initialize={interactive} />
  if (kind === 'sunday') return <SundaySummary date={date} />
  return <WeekdayPlan date={date} />
}

function getAdjacentDate(date: string, view: CalendarView, amount: -1 | 1) {
  if (view === 'day') return addISODate(date, amount)
  if (view === 'week') return addISOWeek(date, amount)
  return addISOMonth(date, amount)
}

interface CalendarPageProps {
  date: string
  hydrationState: StoreHydrationState
  interactive?: boolean
  leading: ReactNode
  onNavigate: (amount: -1 | 1) => void
  onOpenWeekSummary: () => void
  onToday: () => void
  onViewChange: (view: CalendarView) => void
  view: CalendarView
}

function CalendarPage({
  date,
  hydrationState,
  interactive = true,
  leading,
  onNavigate,
  onOpenWeekSummary,
  onToday,
  onViewChange,
  view,
}: CalendarPageProps) {
  const reduceMotion = useReducedMotion()
  const guidance = SAMPLE_DAILY_GUIDANCE[Number(date.slice(-2)) % SAMPLE_DAILY_GUIDANCE.length]

  return (
    <PaperSheet>
      <TopBar action={<SettingsAction disabled={!interactive} />} leading={leading} />

      <RuledSection className="border-b border-line" eyebrow="Today">
        <DateNavigator
          date={date}
          onNext={() => onNavigate(1)}
          onPrevious={() => onNavigate(-1)}
          onToday={interactive ? onToday : undefined}
          view={view}
        />
        <ViewSwitcher onChange={onViewChange} value={view} />
        {view === 'day' && interactive && (
          <div className="mt-4 flex justify-center" data-no-date-swipe>
            <Button onClick={onOpenWeekSummary} size="sm" variant="secondary">查看本周总结</Button>
          </div>
        )}
        <blockquote className="mt-6 flex gap-3 border-l border-cinnabar/45 bg-paper/90 py-2 pl-4 sm:mx-auto sm:max-w-2xl">
          <Quote aria-hidden="true" className="mt-1 shrink-0 text-cinnabar" size={18} strokeWidth={1.6} />
          <p className="font-display text-base leading-7 text-ink sm:text-lg">{guidance.text}</p>
        </blockquote>
      </RuledSection>

      <RuledSection className="overflow-hidden pb-28 sm:pb-24" eyebrow="Plan">
        {hydrationState === 'hydrating' ? (
          <div className="grid min-h-64 place-items-center text-sm text-graphite" role="status">正在整理纸页…</div>
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
                {view === 'month' && <MonthView date={date} interactive={interactive} />}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </RuledSection>
    </PaperSheet>
  )
}

function WeekSummaryPage({ anchorDate, leading, onToday }: { anchorDate: string; leading: ReactNode; onToday: () => void }) {
  const records = usePlanStore((state) => state.records)
  const today = getTodayISO()
  const weekDates = getWeekDates(anchorDate)
  const current = weekDates.includes(today)
  const summary = calculateStatisticsSummary('week', anchorDate, records, today)

  return (
    <PaperSheet>
      <TopBar action={<SettingsAction />} leading={leading} />
      <RuledSection className="pb-28 sm:pb-24" eyebrow="Week Summary">
        <header className="mb-8 text-center">
          <p className="font-data text-xs text-cinnabar">{weekDates[0]} — {weekDates[6]}</p>
          <h1 className="mt-2 font-display text-3xl font-semibold">本周总结</h1>
          {!current && (
            <button className="mt-3 border-b border-cinnabar font-data text-[11px] text-cinnabar" onClick={onToday} type="button">回到今天</button>
          )}
        </header>
        <StatisticsPanel summary={summary} />
      </RuledSection>
    </PaperSheet>
  )
}

export function DailyPlanPage() {
  const selectedDate = usePlanStore((state) => state.selectedDate)
  const calendarView = usePlanStore((state) => state.calendarView)
  const hydrationState = usePlanStore((state) => state.hydrationState)
  const setCalendarView = usePlanStore((state) => state.setCalendarView)
  const setCalendarCursor = usePlanStore((state) => state.setCalendarCursor)
  const setSelectedDate = usePlanStore((state) => state.setSelectedDate)
  const navigateRange = usePlanStore((state) => state.navigateRange)
  const [workspacePage, setWorkspacePage] = useState<WorkspacePage>('calendar')
  const [returnSnapshot, setReturnSnapshot] = useState<ReturnSnapshot | null>(null)
  const [pageAnchor, setPageAnchor] = useState(selectedDate)
  const [statisticsRange, setStatisticsRange] = useState<StatisticsRange>('week')
  const pageTurnRef = useRef<PageTurnHandle>(null)
  const workspaceRef = useRef<HTMLDivElement>(null)

  useCalendarZoom(
    workspaceRef,
    calendarView,
    (view) => workspacePage === 'calendar' && setCalendarView(view),
    () => pageTurnRef.current?.cancel(),
  )

  const saveReturnSnapshot = () => {
    if (!returnSnapshot) setReturnSnapshot({ date: selectedDate, page: workspacePage, view: calendarView })
  }

  const openWeekSummary = () => {
    saveReturnSnapshot()
    setPageAnchor(selectedDate)
    setWorkspacePage('week-summary')
  }

  const openDestination = (destination: ToolbarDestination) => {
    saveReturnSnapshot()
    setPageAnchor(selectedDate)
    if (destination === 'week' || destination === 'month') {
      setCalendarView(destination)
      setWorkspacePage('calendar')
      return
    }
    if (destination === 'statistics') {
      setStatisticsRange('week')
      setWorkspacePage('statistics')
      return
    }
    setWorkspacePage('week-summary')
  }

  const goBack = () => {
    if (!returnSnapshot) return
    setCalendarCursor(returnSnapshot.date, returnSnapshot.view)
    setWorkspacePage(returnSnapshot.page)
    setPageAnchor(returnSnapshot.date)
    setReturnSnapshot(null)
  }

  const leading = (
    <WorkspaceToolbar canGoBack={Boolean(returnSnapshot)} onBack={goBack} onNavigate={openDestination} />
  )

  const navigateStatistics = (amount: -1 | 1) => {
    setPageAnchor((date) =>
      statisticsRange === 'week'
        ? addISOWeek(date, amount)
        : statisticsRange === 'month'
          ? addISOMonth(date, amount)
          : addISOYear(date, amount),
    )
  }

  const renderCalendarPage = (date: string, interactive: boolean) => (
    <CalendarPage
      date={date}
      hydrationState={hydrationState}
      interactive={interactive}
      leading={interactive ? leading : <span className="block size-10" />}
      onNavigate={(amount) => interactive && pageTurnRef.current?.turn(amount)}
      onOpenWeekSummary={openWeekSummary}
      onToday={() => setSelectedDate(getTodayISO())}
      onViewChange={(view) => interactive && setCalendarView(view)}
      view={calendarView}
    />
  )

  return (
    <AppShell navigation={navigation}>
      <div ref={workspaceRef}>
        {workspacePage === 'calendar' && (
          <PageTurn
            onTurn={navigateRange}
            ref={pageTurnRef}
            renderAdjacent={(amount) => renderCalendarPage(getAdjacentDate(selectedDate, calendarView, amount), false)}
          >
            {renderCalendarPage(selectedDate, true)}
          </PageTurn>
        )}
        {workspacePage === 'week-summary' && (
          <WeekSummaryPage anchorDate={pageAnchor} leading={leading} onToday={() => setPageAnchor(getTodayISO())} />
        )}
        {workspacePage === 'statistics' && (
          <PaperSheet>
            <TopBar action={<SettingsAction />} leading={leading} />
            <RuledSection className="pb-28 sm:pb-24" eyebrow="Statistics">
              <StatisticsPage
                anchorDate={pageAnchor}
                onNavigate={navigateStatistics}
                onRangeChange={setStatisticsRange}
                onToday={() => setPageAnchor(getTodayISO())}
                range={statisticsRange}
              />
            </RuledSection>
          </PaperSheet>
        )}
      </div>
    </AppShell>
  )
}
