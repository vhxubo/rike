import { Heart, Quote } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

import { EmptyState } from '@/components/feedback/empty-state'
import { InlineNotice } from '@/components/feedback/inline-notice'
import { AppShell } from '@/components/layout/app-shell'
import { PaperSheet } from '@/components/paper/paper-sheet'
import { RuledSection } from '@/components/paper/ruled-section'
import { IconButton } from '@/components/ui/icon-button'
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
import {
  getDailyGuidance,
  type DailyGuidance,
  type DailyGuidanceFavorite,
} from '@/features/daily-guidance'
import { FishingWheelPage } from '@/features/fishing-wheel/fishing-wheel-page'
import {
  clampDateToPeriod,
  isDateInPeriod,
  readSystemConfig,
} from '@/features/system-config'
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
  formatDisplayDate,
} from '@/features/plans/date'
import {
  calculateStatisticsSummary,
  type StatisticsRange,
} from '@/features/plans/statistics'
import { usePlanStore } from '@/features/plans/store'
import type { StoreHydrationState } from '@/stores'

type WorkspacePage = 'calendar' | 'week-summary' | 'statistics' | 'favorites' | 'fishing-wheel'

const FAVORITES_STORAGE_KEY = 'rike-daily-guidance-favorites'

function favoriteKey(date: string, guidanceId: string) {
  return `${date}:${guidanceId}`
}

function readFavorites(): DailyGuidanceFavorite[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) ?? 'null')
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item): item is DailyGuidanceFavorite =>
        Boolean(item) &&
        typeof item === 'object' &&
        typeof (item as DailyGuidanceFavorite).date === 'string' &&
        typeof (item as DailyGuidanceFavorite).guidanceId === 'string' &&
        typeof (item as DailyGuidanceFavorite).savedAt === 'number' &&
        typeof (item as DailyGuidanceFavorite).text === 'string',
    )
  } catch {
    return []
  }
}

function DailyGuidanceCard({
  copied,
  guidance,
  interactive,
  isFavorite,
  onCopy,
  onToggleFavorite,
}: {
  copied: boolean
  guidance: DailyGuidance
  interactive: boolean
  isFavorite: boolean
  onCopy: (text: string, key: string) => void
  onToggleFavorite: (date: string, guidance: DailyGuidance) => void
}) {
  const key = favoriteKey(guidance.date, guidance.id)

  return (
    <blockquote className="flex items-start gap-3 border-l border-cinnabar/45 bg-paper/90 py-2 pl-4 sm:mx-auto sm:max-w-2xl">
      <Quote aria-hidden="true" className="mt-1 shrink-0 text-cinnabar" size={18} strokeWidth={1.6} />
      <div className="flex min-w-0 flex-1 items-start gap-2">
        <button
          aria-label="复制每日一句"
          className="group min-w-0 flex-1 cursor-copy border-0 bg-transparent p-0 text-left"
          disabled={!interactive}
          onClick={() => onCopy(guidance.text, key)}
          type="button"
        >
          <p className="font-display text-base leading-7 text-ink group-hover:underline group-hover:decoration-dashed group-hover:underline-offset-4 sm:text-lg">
            {guidance.text}
          </p>
          {copied && <span className="font-data text-[10px] text-jade">已复制</span>}
        </button>
        {interactive && (
          <IconButton
            aria-pressed={isFavorite}
            className={isFavorite ? 'daily-guidance-heart !text-cinnabar' : 'text-graphite hover:!text-cinnabar'}
            label={isFavorite ? '取消收藏每日一句' : '收藏每日一句'}
            onClick={() => onToggleFavorite(guidance.date, guidance)}
            variant="ghost"
          >
            <Heart
              aria-hidden="true"
              fill={isFavorite ? 'currentColor' : 'none'}
              size={19}
              strokeWidth={1.7}
            />
          </IconButton>
        )}
      </div>
    </blockquote>
  )
}

function FavoritesPage({
  favorites,
  onCopy,
  onRemove,
  copiedKey,
}: {
  favorites: DailyGuidanceFavorite[]
  onCopy: (text: string, key: string) => void
  onRemove: (favorite: DailyGuidanceFavorite) => void
  copiedKey: string | null
}) {
  const sortedFavorites = [...favorites].sort(
    (left, right) => left.date.localeCompare(right.date) || left.savedAt - right.savedAt,
  )

  return (
    <PaperSheet>
      <RuledSection className="pb-10 sm:pb-12" eyebrow="Favorites" title="每日一句收藏">
        {sortedFavorites.length ? (
          <ol className="grid gap-5">
            {sortedFavorites.map((favorite) => {
              const key = favoriteKey(favorite.date, favorite.guidanceId)
              return (
                <li className="border-b border-line pb-5 last:border-b-0" key={key}>
                  <div className="flex items-start gap-2">
                    <button
                      aria-label="复制收藏的每日一句"
                      className="group min-w-0 flex-1 cursor-copy border-0 bg-transparent p-0 text-left"
                      onClick={() => onCopy(favorite.text, key)}
                      type="button"
                    >
                      <p className="font-display text-base leading-7 text-ink group-hover:underline group-hover:decoration-dashed group-hover:underline-offset-4 sm:text-lg">
                        {favorite.text}
                      </p>
                      <p className="mt-2 font-data text-[11px] text-graphite">
                        {formatDisplayDate(favorite.date)}
                      </p>
                      {copiedKey === key && <span className="font-data text-[10px] text-jade">已复制</span>}
                    </button>
                    <IconButton label="取消收藏每日一句" onClick={() => onRemove(favorite)} variant="ghost">
                      <Heart aria-hidden="true" fill="currentColor" size={19} strokeWidth={1.7} />
                    </IconButton>
                  </div>
                </li>
              )
            })}
          </ol>
        ) : (
          <EmptyState
            description="在每日一句右侧点击心形图标，就能把喜欢的句子留在这里。"
            icon={Heart}
            title="还没有收藏"
          />
        )}
      </RuledSection>
    </PaperSheet>
  )
}

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
  canNavigate,
  date,
  favorites,
  guidance,
  hydrationState,
  interactive = true,
  onNavigate,
  onCopy,
  onToggleFavorite,
  copiedKey,
  view,
}: {
  canNavigate: (amount: -1 | 1) => boolean
  date: string
  favorites: DailyGuidanceFavorite[]
  guidance: DailyGuidance
  hydrationState: StoreHydrationState
  interactive?: boolean
  onNavigate: (amount: -1 | 1) => void
  onCopy: (text: string, key: string) => void
  onToggleFavorite: (date: string, guidance: DailyGuidance) => void
  copiedKey: string | null
  view: CalendarView
}) {
  const reduceMotion = useReducedMotion()

  return (
    <PaperSheet>
      <RuledSection className="border-b border-line py-4">
        <DailyGuidanceCard
          copied={copiedKey === favoriteKey(guidance.date, guidance.id)}
          guidance={guidance}
          interactive={interactive}
          isFavorite={favorites.some((favorite) => favoriteKey(favorite.date, favorite.guidanceId) === favoriteKey(guidance.date, guidance.id))}
          onCopy={onCopy}
          onToggleFavorite={onToggleFavorite}
        />
      </RuledSection>

      <RuledSection className="border-b border-line py-5">
        <DateNavigator
          canGoNext={canNavigate(1)}
          canGoPrevious={canNavigate(-1)}
          date={date}
          onNext={() => onNavigate(1)}
          onPrevious={() => onNavigate(-1)}
          view={view}
        />
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
  const [{ period }] = useState(readSystemConfig)
  const records = usePlanStore((state) => state.records)
  const today = getTodayISO()
  const weekDates = getWeekDates(anchorDate)
  const visibleWeekDates = weekDates.filter((date) => isDateInPeriod(date, period))
  const summary = calculateStatisticsSummary('week', anchorDate, records, today, period)

  return (
    <PaperSheet>
      <RuledSection className="pb-10 sm:pb-12">
        <header className="mb-8 text-center">
          <p className="font-data text-xs text-cinnabar">{visibleWeekDates[0]} — {visibleWeekDates.at(-1)}</p>
          <h1 className="mt-2 font-display text-3xl font-semibold">本周总结</h1>
        </header>
        <StatisticsPanel summary={summary} />
      </RuledSection>
    </PaperSheet>
  )
}

export function DailyPlanPage() {
  const [{ period }] = useState(readSystemConfig)
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
  const [favorites, setFavorites] = useState<DailyGuidanceFavorite[]>(readFavorites)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const pageTurnRef = useRef<PageTurnHandle>(null)
  const workspaceRef = useRef<HTMLDivElement>(null)
  const [today, setToday] = useState(getTodayISO)
  const contextDate = workspacePage === 'calendar' ? selectedDate : pageAnchor
  const isCanonicalTodayDay =
    workspacePage === 'calendar' && calendarView === 'day' && selectedDate === today

  useEffect(() => {
    const now = new Date()
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    const timer = window.setTimeout(
      () => setToday(getTodayISO()),
      midnight.getTime() - now.getTime() + 100,
    )
    return () => window.clearTimeout(timer)
  }, [today])

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites))
    } catch {
      // Favorites remain available for the active session when storage is unavailable.
    }
  }, [favorites])

  const copyGuidance = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(key)
      window.setTimeout(() => setCopiedKey((current) => (current === key ? null : current)), 1400)
    } catch {
      setCopiedKey(null)
    }
  }

  const toggleFavorite = (date: string, guidance: DailyGuidance) => {
    const key = favoriteKey(date, guidance.id)
    setFavorites((current) => {
      if (current.some((favorite) => favoriteKey(favorite.date, favorite.guidanceId) === key)) {
        return current.filter((favorite) => favoriteKey(favorite.date, favorite.guidanceId) !== key)
      }
      return [...current, { date, guidanceId: guidance.id, savedAt: Date.now(), text: guidance.text }]
    })
  }

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
    if (destination === 'favorites' || destination === 'fishing-wheel') {
      saveReturnSnapshot()
      setWorkspacePage(destination)
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
      clampDateToPeriod(
        statisticsRange === 'week'
          ? addISOWeek(date, amount)
          : statisticsRange === 'month'
            ? addISOMonth(date, amount)
            : addISOYear(date, amount),
        period,
      ),
    )
  }

  const canNavigateStatistics = (amount: -1 | 1) => {
    if (statisticsRange === 'all') return false
    const nextDate =
      statisticsRange === 'week'
        ? addISOWeek(pageAnchor, amount)
        : statisticsRange === 'month'
          ? addISOMonth(pageAnchor, amount)
          : addISOYear(pageAnchor, amount)
    return isDateInPeriod(nextDate, period)
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
        : workspacePage === 'favorites' || workspacePage === 'fishing-wheel'
          ? true
        : statisticsRange === 'all'
          ? true
          : statisticsRange === 'week'
            ? getWeekDates(pageAnchor).includes(today)
            : statisticsRange === 'month'
              ? pageAnchor.slice(0, 7) === today.slice(0, 7)
              : pageAnchor.slice(0, 4) === today.slice(0, 4)

  const goToday = () => {
    if (workspacePage === 'calendar') setSelectedDate(today)
    else setPageAnchor(clampDateToPeriod(today, period))
  }

  useEffect(() => {
    if (
      isCanonicalTodayDay && returnSnapshot
    ) {
      setReturnSnapshot(null)
    }
  }, [isCanonicalTodayDay, returnSnapshot])

  const canNavigateCalendar = (date: string, amount: -1 | 1) =>
    isDateInPeriod(getAdjacentDate(date, calendarView, amount), period)

  const renderCalendarPage = (date: string, interactive: boolean) => (
    <CalendarPage
      canNavigate={(amount) => canNavigateCalendar(date, amount)}
      date={date}
      favorites={favorites}
      guidance={getDailyGuidance(today)}
      hydrationState={hydrationState}
      interactive={interactive}
      onNavigate={(amount) => interactive && pageTurnRef.current?.turn(amount)}
      onCopy={copyGuidance}
      onToggleFavorite={toggleFavorite}
      copiedKey={copiedKey}
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
    return `${calendarView}:${date}:${getDailyGuidance(today).id}:${hydrationState}:${JSON.stringify(contentRevision)}`
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
              previous: pageTextureKey(
                canNavigateCalendar(selectedDate, -1)
                  ? getAdjacentDate(selectedDate, calendarView, -1)
                  : selectedDate,
              ),
              next: pageTextureKey(
                canNavigateCalendar(selectedDate, 1)
                  ? getAdjacentDate(selectedDate, calendarView, 1)
                  : selectedDate,
              ),
            }}
            canTurn={(amount) => canNavigateCalendar(selectedDate, amount)}
            currentKey={pageTextureKey(selectedDate)}
            onTurn={navigateRange}
            ref={pageTurnRef}
            renderAdjacent={(amount) => renderCalendarPage(
              canNavigateCalendar(selectedDate, amount)
                ? getAdjacentDate(selectedDate, calendarView, amount)
                : selectedDate,
              false,
            )}
          >
            {renderCalendarPage(selectedDate, true)}
          </PageTurn>
        )}
        {workspacePage === 'week-summary' && <WeekSummaryPage anchorDate={pageAnchor} />}
        {workspacePage === 'favorites' && (
          <FavoritesPage
            copiedKey={copiedKey}
            favorites={favorites}
            onCopy={copyGuidance}
            onRemove={(favorite) =>
              setFavorites((current) =>
                current.filter(
                  (item) => favoriteKey(item.date, item.guidanceId) !== favoriteKey(favorite.date, favorite.guidanceId),
                ),
              )
            }
          />
        )}
        {workspacePage === 'fishing-wheel' && <FishingWheelPage />}
        {workspacePage === 'statistics' && (
          <PaperSheet>
            <RuledSection className="pb-10 sm:pb-12">
              <StatisticsPage
                anchorDate={pageAnchor}
                canNavigate={canNavigateStatistics}
                onNavigate={navigateStatistics}
                onRangeChange={setStatisticsRange}
                range={statisticsRange}
              />
            </RuledSection>
          </PaperSheet>
        )}
      </div>
      {!isTodayContext && isDateInPeriod(today, period) && <TodayFab onToday={goToday} />}
    </AppShell>
  )
}
