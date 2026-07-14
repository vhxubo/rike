import { Quote } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

import { InlineNotice } from '@/components/feedback/inline-notice'
import { AppShell } from '@/components/layout/app-shell'
import { PaperSheet } from '@/components/paper/paper-sheet'
import { RuledSection } from '@/components/paper/ruled-section'
import type { CalendarView } from '@/features/calendar'
import {
  MonthView,
  PageTurn,
  type PageTurnHandle,
  StatisticsPage,
  StatisticsPanel,
  StickyWorkspaceHeader,
  TodayFab,
  type ToolbarDestination,
  WeekView,
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
  getCalendarMonthDates,
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

function CalendarPage({
  date,
  hydrationState,
  interactive = true,
  onNavigate,
  view,
}: {
  date: string
  hydrationState: StoreHydrationState
  interactive?: boolean
  onNavigate: (amount: -1 | 1) => void
  view: CalendarView
}) {
  const reduceMotion = useReducedMotion()
  const guidance = SAMPLE_DAILY_GUIDANCE[Number(date.slice(-2)) % SAMPLE_DAILY_GUIDANCE.length]

  return (
    <PaperSheet>
      <RuledSection className="border-b border-line py-4">
        <blockquote className="flex gap-3 border-l border-cinnabar/45 bg-paper/90 py-2 pl-4 sm:mx-auto sm:max-w-2xl">
          <Quote aria-hidden="true" className="mt-1 shrink-0 text-cinnabar" size={18} strokeWidth={1.6} />
          <p className="font-display text-base leading-7 text-ink sm:text-lg">{guidance.text}</p>
        </blockquote>
      </RuledSection>

      <RuledSection className="border-b border-line py-5">
        <DateNavigator date={date} onNext={() => onNavigate(1)} onPrevious={() => onNavigate(-1)} view={view} />
      </RuledSection>

      <RuledSection className="overflow-visible pb-10 sm:pb-12">
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

function WeekSummaryPage({ anchorDate }: { anchorDate: string }) {
  const records = usePlanStore((state) => state.records)
  const today = getTodayISO()
  const weekDates = getWeekDates(anchorDate)
  const summary = calculateStatisticsSummary('week', anchorDate, records, today)

  return (
    <PaperSheet>
      <RuledSection className="pb-10 sm:pb-12">
        <header className="mb-8 text-center">
          <p className="font-data text-xs text-cinnabar">{weekDates[0]} — {weekDates[6]}</p>
          <h1 className="mt-2 font-display text-3xl font-semibold">本周总结</h1>
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
  const records = usePlanStore((state) => state.records)
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
  const today = getTodayISO()
  const contextDate = workspacePage === 'calendar' ? selectedDate : pageAnchor
  const isCanonicalTodayDay =
    workspacePage === 'calendar' && calendarView === 'day' && selectedDate === today

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
    setPageAnchor(contextDate)
    setWorkspacePage('week-summary')
  }

  const openDestination = (destination: ToolbarDestination) => {
    if (destination === 'day' || destination === 'week' || destination === 'month') {
      if (workspacePage !== 'calendar') saveReturnSnapshot()
      setCalendarCursor(contextDate, destination)
      setWorkspacePage('calendar')
      return
    }
    saveReturnSnapshot()
    setPageAnchor(contextDate)
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

  const navigateStatistics = (amount: -1 | 1) => {
    setPageAnchor((date) =>
      statisticsRange === 'week'
        ? addISOWeek(date, amount)
        : statisticsRange === 'month'
          ? addISOMonth(date, amount)
          : addISOYear(date, amount),
    )
  }

  const isTodayContext =
    workspacePage === 'calendar'
      ? calendarView === 'day'
        ? selectedDate === today
        : calendarView === 'week'
          ? getWeekDates(selectedDate).includes(today)
          : selectedDate.slice(0, 7) === today.slice(0, 7)
      : workspacePage === 'week-summary'
        ? getWeekDates(pageAnchor).includes(today)
        : statisticsRange === 'all'
          ? true
          : statisticsRange === 'week'
            ? getWeekDates(pageAnchor).includes(today)
            : statisticsRange === 'month'
              ? pageAnchor.slice(0, 7) === today.slice(0, 7)
              : pageAnchor.slice(0, 4) === today.slice(0, 4)

  const goToday = () => {
    if (workspacePage === 'calendar') setSelectedDate(today)
    else setPageAnchor(today)
  }

  useEffect(() => {
    if (
      isCanonicalTodayDay && returnSnapshot
    ) {
      setReturnSnapshot(null)
    }
  }, [isCanonicalTodayDay, returnSnapshot])

  const renderCalendarPage = (date: string, interactive: boolean) => (
    <CalendarPage
      date={date}
      hydrationState={hydrationState}
      interactive={interactive}
      onNavigate={(amount) => interactive && pageTurnRef.current?.turn(amount)}
      view={calendarView}
    />
  )

  const pageTextureKey = (date: string) => {
    const visibleDates = calendarView === 'day'
      ? [date]
      : calendarView === 'week'
        ? getWeekDates(date)
        : getCalendarMonthDates(date)
    const contentRevision = visibleDates.map((visibleDate) => [
      visibleDate,
      records[visibleDate] ?? null,
    ])
    return `${calendarView}:${date}:${hydrationState}:${JSON.stringify(contentRevision)}`
  }

  return (
    <AppShell>
      <StickyWorkspaceHeader
        canGoBack={Boolean(returnSnapshot) && !isCanonicalTodayDay}
        onBack={goBack}
        onNavigate={openDestination}
        onOpenWeekSummary={openWeekSummary}
      />
      <div ref={workspaceRef}>
        {workspacePage === 'calendar' && (
          <PageTurn
            adjacentKeys={{
              previous: pageTextureKey(getAdjacentDate(selectedDate, calendarView, -1)),
              next: pageTextureKey(getAdjacentDate(selectedDate, calendarView, 1)),
            }}
            currentKey={pageTextureKey(selectedDate)}
            onTurn={navigateRange}
            ref={pageTurnRef}
            renderAdjacent={(amount) => renderCalendarPage(getAdjacentDate(selectedDate, calendarView, amount), false)}
          >
            {renderCalendarPage(selectedDate, true)}
          </PageTurn>
        )}
        {workspacePage === 'week-summary' && <WeekSummaryPage anchorDate={pageAnchor} />}
        {workspacePage === 'statistics' && (
          <PaperSheet>
            <RuledSection className="pb-10 sm:pb-12">
              <StatisticsPage
                anchorDate={pageAnchor}
                onNavigate={navigateStatistics}
                onRangeChange={setStatisticsRange}
                range={statisticsRange}
              />
            </RuledSection>
          </PaperSheet>
        )}
      </div>
      {!isTodayContext && <TodayFab onToday={goToday} />}
    </AppShell>
  )
}
