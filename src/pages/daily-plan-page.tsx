import { CalendarDays, Home, LayoutTemplate, Quote, Settings } from 'lucide-react'
import {
  AnimatePresence,
  motion,
  useDragControls,
  useReducedMotion,
  type PanInfo,
} from 'motion/react'
import { useState, type PointerEvent } from 'react'

import { InlineNotice } from '@/components/feedback/inline-notice'
import { AppShell, type BottomNavItem } from '@/components/layout/app-shell'
import { TopBar } from '@/components/layout/top-bar'
import { PaperSheet } from '@/components/paper/paper-sheet'
import { RuledSection } from '@/components/paper/ruled-section'
import { IconButton } from '@/components/ui/icon-button'
import { SAMPLE_DAILY_GUIDANCE } from '@/features/daily-guidance'
import { getDayKind } from '@/features/plans/date'
import { canStartDateSwipe, getDateSwipeAmount } from '@/features/plans/gestures'
import { DateNavigator } from '@/features/plans/components/date-navigator'
import { SaturdayPlan } from '@/features/plans/components/saturday-plan'
import { SundaySummary } from '@/features/plans/components/sunday-summary'
import { WeekdayPlan } from '@/features/plans/components/weekday-plan'
import { usePlanStore } from '@/features/plans/store'

const navigation: BottomNavItem[] = [
  { label: '首页', icon: Home, active: true },
  { label: '计划', icon: CalendarDays },
  { label: '模板', icon: LayoutTemplate },
  { label: '设置', icon: Settings },
]

function DatePlan({ date }: { date: string }) {
  const kind = getDayKind(date)

  if (kind === 'saturday') return <SaturdayPlan date={date} />
  if (kind === 'sunday') return <SundaySummary date={date} />
  return <WeekdayPlan date={date} />
}

export function DailyPlanPage() {
  const selectedDate = usePlanStore((state) => state.selectedDate)
  const hydrationState = usePlanStore((state) => state.hydrationState)
  const navigateDate = usePlanStore((state) => state.navigateDate)
  const [direction, setDirection] = useState(0)
  const dragControls = useDragControls()
  const reduceMotion = useReducedMotion()
  const guidanceIndex = Number(selectedDate.slice(-2)) % SAMPLE_DAILY_GUIDANCE.length
  const guidance = SAMPLE_DAILY_GUIDANCE[guidanceIndex]

  const changeDate = (amount: number) => {
    setDirection(amount)
    navigateDate(amount)
  }

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!canStartDateSwipe(event.target)) return
    dragControls.start(event)
  }

  const finishDrag = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const amount = getDateSwipeAmount(info.offset.x, info.velocity.x)
    if (amount) changeDate(amount)
  }

  const slideDistance = reduceMotion ? 0 : 52

  return (
    <AppShell navigation={navigation}>
      <PaperSheet>
        <TopBar
          action={
            <IconButton label="打开设置" variant="ghost">
              <Settings aria-hidden="true" size={20} strokeWidth={1.7} />
            </IconButton>
          }
        />

        <RuledSection className="border-b border-line" eyebrow="Today">
          <DateNavigator
            date={selectedDate}
            onNext={() => changeDate(1)}
            onPrevious={() => changeDate(-1)}
          />
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

              <AnimatePresence custom={direction} initial={false} mode="wait">
                <motion.div
                  animate={{ opacity: 1, x: 0 }}
                  custom={direction}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragControls={dragControls}
                  dragElastic={0.12}
                  dragListener={false}
                  exit={{ opacity: 0, x: direction > 0 ? -slideDistance : slideDistance }}
                  initial={{ opacity: 0, x: direction > 0 ? slideDistance : -slideDistance }}
                  key={selectedDate}
                  onDragEnd={finishDrag}
                  onPointerDown={startDrag}
                  transition={{ duration: reduceMotion ? 0 : 0.22, ease: 'easeOut' }}
                >
                  <DatePlan date={selectedDate} />
                </motion.div>
              </AnimatePresence>
            </>
          )}
        </RuledSection>
      </PaperSheet>
    </AppShell>
  )
}
