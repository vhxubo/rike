import {
  CalendarDays,
  FileText,
  Home,
  LayoutTemplate,
  Plus,
  Quote,
  Settings,
} from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'

import { EmptyState } from '@/components/feedback/empty-state'
import { InlineNotice } from '@/components/feedback/inline-notice'
import { AppShell, type BottomNavItem } from '@/components/layout/app-shell'
import { TopBar } from '@/components/layout/top-bar'
import { DateStamp } from '@/components/paper/date-stamp'
import { PaperSheet } from '@/components/paper/paper-sheet'
import { RuledSection } from '@/components/paper/ruled-section'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Divider } from '@/components/ui/divider'
import { IconButton } from '@/components/ui/icon-button'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { Switch } from '@/components/ui/switch'
import { Textarea, TextField } from '@/components/ui/text-field'
import type { CalendarView } from '@/features/calendar'
import { SAMPLE_DAILY_GUIDANCE } from '@/features/daily-guidance'

const navigation: BottomNavItem[] = [
  { label: '首页', icon: Home, active: true },
  { label: '计划', icon: CalendarDays },
  { label: '模板', icon: LayoutTemplate },
  { label: '设置', icon: Settings },
]

const viewOptions = [
  { label: '日', value: 'day' },
  { label: '周', value: 'week' },
  { label: '月', value: 'month' },
] satisfies Array<{ label: string; value: CalendarView }>

interface ComponentShowcasePageProps {
  date?: Date
}

export function ComponentShowcasePage({ date = new Date() }: ComponentShowcasePageProps) {
  const [calendarView, setCalendarView] = useState<CalendarView>('week')
  const [completed, setCompleted] = useState(true)
  const [reminder, setReminder] = useState(false)
  const reduceMotion = useReducedMotion()

  const reveal = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.35, ease: 'easeOut' as const },
      }

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
          <motion.div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center" {...reveal}>
            <DateStamp date={date} />
            <blockquote className="flex gap-3 border-l border-cinnabar/45 bg-paper/90 py-2 pl-4 sm:justify-self-end sm:max-w-lg">
              <Quote
                aria-hidden="true"
                className="mt-1 shrink-0 text-cinnabar"
                size={18}
                strokeWidth={1.6}
              />
              <p className="font-display text-base leading-7 text-ink sm:text-lg">
                {SAMPLE_DAILY_GUIDANCE[0].text}
              </p>
            </blockquote>
          </motion.div>
        </RuledSection>

        <RuledSection className="border-b border-line" eyebrow="Controls" title="基础控件">
          <motion.div className="grid gap-8 lg:grid-cols-2" {...reveal}>
            <div className="grid content-start gap-5 bg-paper/90 py-1">
              <div className="flex flex-wrap gap-3">
                <Button>开始今日计划</Button>
                <Button variant="secondary">查看模板</Button>
                <Button variant="accent">
                  <Plus aria-hidden="true" size={17} />
                  新建
                </Button>
                <IconButton label="新增学习项目" variant="secondary">
                  <Plus aria-hidden="true" size={18} />
                </IconButton>
              </div>

              <Divider label="视图" />

              <SegmentedControl
                label="计划视图"
                onValueChange={setCalendarView}
                options={viewOptions}
                value={calendarView}
              />

              <div className="flex flex-wrap gap-x-6 gap-y-2">
                <Checkbox
                  checked={completed}
                  label="已完成今日阅读"
                  onChange={(event) => setCompleted(event.target.checked)}
                />
                <Switch checked={reminder} label="学习提醒" onCheckedChange={setReminder} />
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge>待开始</Badge>
                <Badge tone="accent">重点</Badge>
                <Badge tone="success">已完成</Badge>
              </div>
            </div>

            <div className="grid gap-5 bg-paper/90 py-1">
              <TextField
                hint="保持简短，后续可以继续补充。"
                label="学习项目"
                placeholder="例如：朗读课文第三段"
              />
              <Textarea
                label="学习笔记"
                placeholder="写下今天读懂的一句话……"
              />
            </div>
          </motion.div>
        </RuledSection>

        <RuledSection className="border-b border-line" eyebrow="Paper" title="纸面节奏">
          <motion.div className="grid gap-5 sm:grid-cols-2" {...reveal}>
            <div className="border-l-2 border-cinnabar bg-paper/90 py-2 pl-4">
              <p className="font-data text-[11px] text-cinnabar">07:30 · 语文</p>
              <h3 className="mt-2 font-display text-lg font-semibold">晨读十五分钟</h3>
              <p className="mt-1 text-sm leading-6 text-graphite">
                先读准确，再试着读出句子的停顿。
              </p>
            </div>
            <div className="border-l-2 border-jade bg-paper/90 py-2 pl-4">
              <p className="font-data text-[11px] text-jade">19:40 · 复习</p>
              <h3 className="mt-2 font-display text-lg font-semibold">整理三个词语</h3>
              <p className="mt-1 text-sm leading-6 text-graphite">
                写下词义，再为每个词造一个短句。
              </p>
            </div>
          </motion.div>
        </RuledSection>

        <RuledSection className="pb-28 sm:pb-24" eyebrow="Status" title="状态反馈">
          <motion.div className="grid gap-5 lg:grid-cols-2" {...reveal}>
            <InlineNotice tone="success" title="今天已经完成一小步">
              进度会在后续持久化阶段保存到本地。
            </InlineNotice>
            <EmptyState
              action={<Button variant="secondary">创建第一项</Button>}
              description="从一件十分钟内能完成的事情开始。"
              icon={FileText}
              title="这一天还没有计划"
            />
          </motion.div>
        </RuledSection>
      </PaperSheet>
    </AppShell>
  )
}
