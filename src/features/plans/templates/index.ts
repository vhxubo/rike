import { getDay } from 'date-fns'

import { parseISODate } from '@/features/plans/date'
import type { PlanTemplateItem } from '@/features/plans/model'

function fixedItem(
  order: number,
  subject: PlanTemplateItem['subject'],
  prefix: string,
): PlanTemplateItem {
  return {
    id: `weekday-${order}`,
    order,
    subject,
    prefix,
    editableMode: 'none',
  }
}

const sharedTail: PlanTemplateItem[] = [
  {
    id: 'weekday-4',
    order: 4,
    subject: '生物',
    prefix: '生物',
    editableMode: 'suffix-input',
  },
  fixedItem(5, '物理', '物理错题/知识点收集整理'),
  {
    id: 'weekday-6',
    order: 6,
    subject: null,
    prefix: '',
    editableMode: 'full-input',
  },
  {
    id: 'weekday-7',
    order: 7,
    subject: '生物',
    prefix: '生物课本',
    suffix: '阅读研习',
    editableMode: 'middle-input',
  },
  fixedItem(8, '物理', '物理错题深研'),
]

const languageChemistryHead: PlanTemplateItem[] = [
  fixedItem(1, '语文', '语文点线面'),
  fixedItem(2, '化学', '化学错题/知识点收集整理'),
  fixedItem(3, '数学', '数学错题深研'),
]

const englishMathHead: PlanTemplateItem[] = [
  fixedItem(1, '英语', '英语教材深研'),
  fixedItem(2, '数学', '数学错题/知识点收集整理'),
  fixedItem(3, '化学', '化学错题深研'),
]

export function getWeekdayTemplate(date: string): PlanTemplateItem[] {
  const weekday = getDay(parseISODate(date))

  if (weekday === 0 || weekday === 6) {
    return []
  }

  const head = weekday === 2 || weekday === 4 ? englishMathHead : languageChemistryHead

  return [...head, ...sharedTail]
}

export function isEffectiveWeekdayItem(item: PlanTemplateItem, input: string) {
  return item.id !== 'weekday-6' || input.trim().length > 0
}
