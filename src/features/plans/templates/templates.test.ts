import { getWeekdayTemplate } from '@/features/plans/templates'

describe('weekday templates', () => {
  it('uses the language and chemistry mapping on Monday, Wednesday, and Friday', () => {
    for (const date of ['2026-07-13', '2026-07-15', '2026-07-17']) {
      const template = getWeekdayTemplate(date)

      expect(template.slice(0, 3).map((item) => item.prefix)).toEqual([
        '语文点线面',
        '化学错题/知识点收集整理',
        '数学错题深研',
      ])
      expect(template.slice(0, 3).map((item) => item.subject)).toEqual([
        '语文',
        '化学',
        '数学',
      ])
    }
  })

  it('uses the English and math mapping on Tuesday and Thursday', () => {
    for (const date of ['2026-07-14', '2026-07-16']) {
      const template = getWeekdayTemplate(date)

      expect(template.slice(0, 3).map((item) => item.prefix)).toEqual([
        '英语教材深研',
        '数学错题/知识点收集整理',
        '化学错题深研',
      ])
      expect(template.slice(0, 3).map((item) => item.subject)).toEqual([
        '英语',
        '数学',
        '化学',
      ])
    }
  })

  it('only allows input in items four, six, and seven', () => {
    const template = getWeekdayTemplate('2026-07-14')

    expect(template.filter((item) => item.editableMode !== 'none').map((item) => item.order)).toEqual([
      4, 6, 7,
    ])
    expect(template[4].prefix).toBe('物理错题/知识点收集整理')
    expect(template[6]).toMatchObject({
      prefix: '生物课本',
      suffix: '阅读研习',
      subject: '生物',
    })
  })
})
