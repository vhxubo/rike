import { LuckyWheel } from '@lucky-canvas/react'
import { Dices, TicketCheck } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { EmptyState } from '@/components/feedback/empty-state'
import { InlineNotice } from '@/components/feedback/inline-notice'
import { PaperSheet } from '@/components/paper/paper-sheet'
import { RuledSection } from '@/components/paper/ruled-section'
import { Button } from '@/components/ui/button'
import {
  useFishingWheelStore,
  type WheelExemptionTarget,
  type WheelSpinRecord,
} from '@/features/fishing-wheel/store'
import {
  addISODate,
  addISOWeek,
  formatDisplayDate,
  getDayKind,
  getTodayISO,
  getWeekDates,
  parseISODate,
} from '@/features/plans/date'
import type { PlanRecords, PlanTemplateItem } from '@/features/plans/model'
import { usePlanStore } from '@/features/plans/store'
import { getWeekdayTemplate } from '@/features/plans/templates'

interface PrizeDefinition {
  id: string
  label: string
  taskOrder?: number
  title: string
  weekday?: number
  weight: number
}

const WEEKDAY_LABELS = ['周一', '周二', '周三', '周四', '周五']
const WHEEL_COLORS = ['#f4e2dc', '#dcebe4', '#f8edc9', '#dfe8ef']

const BASE_PRIZES: PrizeDefinition[] = [
  { id: 'none', label: '未中', title: '这次没有免单', weight: 90.999 },
  ...Array.from({ length: 8 }, (_, index) => ({
    id: `task-${index + 1}`,
    label: `免任务\n${index + 1}`,
    taskOrder: index + 1,
    title: `免下一个工作日第 ${index + 1} 项任务`,
    weight: 1,
  })),
  { id: 'saturday', label: '免周六', title: '免下一个周六努力', weight: 0.5 },
  ...WEEKDAY_LABELS.map((label, index) => ({
    id: `weekday-${index + 1}`,
    label: `免${label}`,
    title: `免下一个${label}全天`,
    weekday: index + 1,
    weight: 0.1,
  })),
  { id: 'workweek', label: '免下周\n工作日', title: '免下一周全部工作日', weight: 0.001 },
]

function getPrizeDefinitions(skipSixthTask: boolean) {
  if (!skipSixthTask) return BASE_PRIZES
  return BASE_PRIZES
    .filter((prize) => prize.taskOrder !== 6)
    .map((prize) => prize.taskOrder ? { ...prize, weight: 8 / 7 } : prize)
}

function pickPrizeIndex(prizes: PrizeDefinition[]) {
  let roll = Math.random() * 100
  for (let index = 0; index < prizes.length; index += 1) {
    roll -= prizes[index].weight
    if (roll < 0) return index
  }
  return 0
}

function nextDate(date: string, predicate: (candidate: string) => boolean) {
  let candidate = date
  do candidate = addISODate(candidate, 1)
  while (!predicate(candidate))
  return candidate
}

function getNextWorkday(date: string) {
  return nextDate(date, (candidate) => getDayKind(candidate) === 'weekday')
}

function getTargets(prize: PrizeDefinition, today: string): WheelExemptionTarget[] {
  if (prize.taskOrder) {
    return [{
      date: getNextWorkday(today),
      itemIds: [`weekday-${prize.taskOrder}`],
      kind: 'weekday',
    }]
  }
  if (prize.id === 'saturday') {
    return [{
      date: nextDate(today, (candidate) => getDayKind(candidate) === 'saturday'),
      itemIds: 'all',
      kind: 'saturday',
    }]
  }
  if (prize.weekday) {
    return [{
      date: nextDate(today, (candidate) => parseISODate(candidate).getDay() === prize.weekday),
      itemIds: 'all',
      kind: 'weekday',
    }]
  }
  if (prize.id === 'workweek') {
    return getWeekDates(addISOWeek(today, 1)).slice(0, 5).map((date) => ({
      date,
      itemIds: 'all',
      kind: 'weekday' as const,
    }))
  }
  return []
}

function isSixthTaskBlank(date: string, records: PlanRecords) {
  const record = records[date]
  return record?.kind !== 'weekday' || !(record.inputs['weekday-6'] ?? '').trim()
}

function getBlankSixthTaskDates(targets: WheelExemptionTarget[], records: PlanRecords) {
  return targets
    .filter((target) => target.kind === 'weekday' && target.itemIds === 'all')
    .map((target) => target.date)
    .filter((date) => isSixthTaskBlank(date, records))
}

function getPlanText(item: PlanTemplateItem, input: string) {
  if (item.editableMode === 'full-input') return input
  return `${item.prefix}${input}${item.suffix ?? ''}`
}

function countCompletedPapers(records: PlanRecords, spins: WheelSpinRecord[]) {
  const exemptedItems = new Set<string>()
  for (const spin of spins) {
    if (!spin.applied) continue
    for (const target of spin.targets) {
      if (target.itemIds === 'all') exemptedItems.add(`${target.date}:*`)
      else for (const itemId of target.itemIds) exemptedItems.add(`${target.date}:${itemId}`)
    }
  }

  let count = 0
  for (const [date, record] of Object.entries(records)) {
    if (record.kind === 'weekday') {
      for (const item of getWeekdayTemplate(date)) {
        if (record.resolutions[item.id] !== 'completed') continue
        if (exemptedItems.has(`${date}:*`) || exemptedItems.has(`${date}:${item.id}`)) continue
        if (getPlanText(item, record.inputs[item.id] ?? '').includes('试卷')) count += 1
      }
      continue
    }
    for (const item of record.items) {
      if (item.resolution !== 'completed') continue
      if (exemptedItems.has(`${date}:*`) || exemptedItems.has(`${date}:${item.id}`)) continue
      if (item.text.includes('试卷')) count += 1
    }
  }
  // ponytail: no holiday calendar exists; this local lifetime cap can be reset when holidays become explicit.
  return Math.min(3, count)
}

function createSpinId() {
  return globalThis.crypto?.randomUUID?.() ?? `wheel-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function formatTargets(targets: WheelExemptionTarget[]) {
  if (!targets.length) return '无免除项目'
  return targets.map((target) => {
    if (target.itemIds === 'all') return `${target.date} 全天`
    const orders = target.itemIds.map((itemId) => itemId.split('-').at(-1)).join('、')
    return `${target.date} 第 ${orders} 项`
  }).join('；')
}

export function FishingWheelPage() {
  const records = usePlanStore((state) => state.records)
  const hydrationState = usePlanStore((state) => state.hydrationState)
  const applyWheelExemptions = usePlanStore((state) => state.applyWheelExemptions)
  const spins = useFishingWheelStore((state) => state.spins)
  const recordSpin = useFishingWheelStore((state) => state.recordSpin)
  const markApplied = useFishingWheelStore((state) => state.markApplied)
  const [today, setToday] = useState(getTodayISO)
  const [spinning, setSpinning] = useState(false)
  const [wheelSize, setWheelSize] = useState(() => Math.min(360, Math.max(240, window.innerWidth - 96)))
  const wheelRef = useRef<LuckyWheel>(null)
  const pendingPrize = useRef<{
    prize: PrizeDefinition
    source: 'daily' | 'paper'
    spinDate: string
  } | null>(null)

  useEffect(() => {
    const updateSize = () => setWheelSize(Math.min(360, Math.max(240, window.innerWidth - 96)))
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  useEffect(() => {
    const now = new Date()
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    const timer = window.setTimeout(() => setToday(getTodayISO()), midnight.getTime() - now.getTime() + 100)
    return () => window.clearTimeout(timer)
  }, [today])

  const nextWorkday = getNextWorkday(today)
  const sixthTaskBlank = isSixthTaskBlank(nextWorkday, records)
  const prizeDefinitions = useMemo(() => getPrizeDefinitions(sixthTaskBlank), [sixthTaskBlank])
  const paperRewardsEarned = countCompletedPapers(records, spins)
  const paperRewardsUsed = spins.filter((spin) => spin.source === 'paper').length
  const paperRewardsAvailable = Math.max(0, paperRewardsEarned - paperRewardsUsed)
  const dailySpinUsed = spins.some((spin) => spin.source === 'daily' && spin.spinDate === today)
  const todaySpinsUsed = spins.filter((spin) => spin.spinDate === today).length
  const remainingSpins = (dailySpinUsed ? 0 : 1) + paperRewardsAvailable
  const todaySpinsTotal = todaySpinsUsed + remainingSpins
  const latestSpin = spins.at(-1)
  const wheelReady = hydrationState !== 'hydrating'

  const canvasPrizes = useMemo(() => prizeDefinitions.map((prize, index) => ({
    background: WHEEL_COLORS[index % WHEEL_COLORS.length],
    fonts: [{
      fontColor: '#20231f',
      fontSize: '12px',
      fontWeight: '600',
      lineClamp: 2,
      text: prize.label,
      top: '14%',
    }],
    range: prize.weight,
  })), [prizeDefinitions])

  const confirmBlankSixthTasks = (targets: WheelExemptionTarget[]) => {
    const blankDates = getBlankSixthTaskDates(targets, records)
    if (!blankDates.length) return true
    return window.confirm(
      `${blankDates.join('、')} 的第 6 项未填写。确认留空并应用免除吗？\n留空项不会进入统计；取消后可填写，再从中奖记录中应用。`,
    )
  }

  const applySpin = (spin: WheelSpinRecord) => {
    if (!wheelReady) return
    if (!confirmBlankSixthTasks(spin.targets)) return
    applyWheelExemptions(spin.targets)
    markApplied(spin.id)
  }

  const finishSpin = () => {
    const pending = pendingPrize.current
    if (!pending) return
    const targets = getTargets(pending.prize, pending.spinDate)
    const applied = confirmBlankSixthTasks(targets)
    const spin: WheelSpinRecord = {
      applied,
      id: createSpinId(),
      prizeId: pending.prize.id,
      source: pending.source,
      spinDate: pending.spinDate,
      spunAt: new Date().toISOString(),
      targets,
      title: pending.prize.title,
    }
    if (applied) applyWheelExemptions(targets)
    recordSpin(spin)
    pendingPrize.current = null
    setSpinning(false)
  }

  const startSpin = () => {
    if (!wheelReady || spinning || remainingSpins <= 0) return
    if (
      sixthTaskBlank &&
      !window.confirm(
        `${formatDisplayDate(nextWorkday)}第 6 项未填写。确认留空后，其 1% 概率会平分给其余七项。继续抽奖吗？`,
      )
    ) return

    const index = pickPrizeIndex(prizeDefinitions)
    pendingPrize.current = {
      prize: prizeDefinitions[index],
      source: dailySpinUsed ? 'paper' : 'daily',
      spinDate: today,
    }
    setSpinning(true)
    wheelRef.current?.play()
    window.setTimeout(() => wheelRef.current?.stop(index), 750)
  }

  return (
    <PaperSheet>
      <RuledSection className="border-b border-line pb-10" eyebrow="Lucky Draw" title="摸鱼大转盘">
        <div className="grid justify-items-center gap-6">
          <div className="border border-line-strong bg-paper p-3 shadow-paper">
            <LuckyWheel
              blocks={[
                { background: '#20231f', padding: '8px' },
                { background: '#fffdf7', padding: '5px' },
              ]}
              buttons={[{
                background: wheelReady && remainingSpins ? '#b74736' : '#929990',
                fonts: [{
                  fontColor: '#fffdf7',
                  fontSize: '17px',
                  fontWeight: '700',
                  text: !wheelReady ? '整理中' : spinning ? '转动中' : remainingSpins ? '摸鱼\n开转' : '明日\n再来',
                  top: '-18px',
                }],
                pointer: true,
                radius: '25%',
              }]}
              defaultConfig={{ accelerationTime: 650, decelerationTime: 1400, speed: 22 }}
              defaultStyle={{ fontStyle: 'sans-serif', wordWrap: true }}
              height={wheelSize}
              onEnd={finishSpin}
              onStart={startSpin}
              prizes={canvasPrizes}
              ref={wheelRef}
              width={wheelSize}
            />
          </div>

          <div className="flex w-full flex-wrap justify-center gap-x-6 gap-y-2 border-y border-line bg-paper/90 px-3 py-3 text-center">
            <p className="text-sm text-graphite">今日已用/总数 <strong className="font-data text-ink">({todaySpinsUsed}/{todaySpinsTotal})</strong></p>
            <p className="text-sm text-graphite">奖励获取/上限 <strong className="font-data text-ink">({paperRewardsEarned}/3)</strong></p>
            <p className="text-sm text-graphite">奖励已用/上限 <strong className="font-data text-ink">({paperRewardsUsed}/3)</strong></p>
          </div>

          {latestSpin && (
            <InlineNotice className="w-full" title={latestSpin.title} tone={latestSpin.prizeId === 'none' ? 'info' : 'success'}>
              {formatTargets(latestSpin.targets)}
              {!latestSpin.applied && ' · 第 6 项待确认，奖励尚未应用'}
            </InlineNotice>
          )}
        </div>
      </RuledSection>

      <RuledSection className="border-b border-line py-4">
        <p className="text-center text-xs leading-6 text-graphite">
          概率：任务 8% · 周六 0.5% · 单日 0.5% · 下周 0.001% · 其余未中
        </p>
      </RuledSection>

      <RuledSection className="pb-10 sm:pb-12" eyebrow="History" title="中奖记录">
        {spins.length ? (
          <ol className="grid gap-4">
            {[...spins].reverse().map((spin) => (
              <li className="border border-line-strong bg-paper/90 p-4" key={spin.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-lg font-semibold">{spin.title}</p>
                    <p className="mt-1 text-sm leading-6 text-graphite">{formatTargets(spin.targets)}</p>
                    <p className="mt-2 font-data text-[10px] text-graphite">
                      {new Date(spin.spunAt).toLocaleString('zh-CN', { hour12: false })}
                      {' · '}{spin.source === 'daily' ? '每日次数' : '试卷奖励次数'}
                    </p>
                  </div>
                  {spin.applied ? (
                    <span className="flex shrink-0 items-center gap-1 font-data text-[10px] text-jade">
                      <TicketCheck aria-hidden="true" size={15} />已应用
                    </span>
                  ) : (
                    <Button disabled={!wheelReady} onClick={() => applySpin(spin)} size="sm" variant="secondary">应用奖励</Button>
                  )}
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <EmptyState
            description="每日一次；完成含“试卷”的计划可获得额外次数。"
            icon={Dices}
            title="还没有转盘记录"
          />
        )}
      </RuledSection>
    </PaperSheet>
  )
}
