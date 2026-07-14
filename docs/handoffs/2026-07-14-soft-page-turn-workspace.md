# 增强交接：柔软翻页、月视图、工具栏与统计

## 关联文档

- 设计规格：`docs/superpowers/specs/2026-07-14-soft-page-turn-month-view-design.md`
- 实现计划：`docs/plans/2026-07-14-soft-page-turn-workspace-implementation.md`
- 需求过程：`docs/requirements/2026-07-14-rike-requirements-log.md`
- 测试状态：`docs/testing/STATUS.md`

## 已完成

- 日历层级从日、周、年调整为日、周、月，完全移除年日历总览。
- 月视图固定显示六周七列，相邻月份补位日期弱化但可点击进入日页。
- 计划 store 升至 v3，旧 v2 `year` 自动迁移为 `month`，日期和计划记录保持不变。
- 翻页从整页 180°刚性旋转改为横向跟手、最高 10°轻倾斜、目标页视差和动态边缘光影。
- 完成和回弹使用不同弹簧参数，按钮翻页与拖动共用运动模型。
- 左上角增加工具栏，提供本周总结、周视图、月视图和总统计入口。
- 工具栏目标使用同一左上角返回按钮，并恢复进入前的日期和日历视图。
- 日视图增加“查看本周总结”快捷按钮。
- 日、周、月、本周总结和统计范围支持语义一致的回到今天。
- 总统计支持本周、本月、本年和全部范围。
- 统一统计口径截至今天，未来日期和计划不进入统计。
- 增加系统、日间、夜间主题，系统模式实时跟随 `prefers-color-scheme`，偏好独立持久化。
- 夜间主题覆盖工作台、纸面、文字、状态色、横线、工具栏、统计图和翻页光影。

## 关键路径

- 工作区组合：`src/pages/daily-plan-page.tsx`
- 工具栏：`src/features/calendar/components/workspace-toolbar.tsx`
- 月视图：`src/features/calendar/components/month-view.tsx`
- 柔软翻页：`src/features/calendar/components/page-turn.tsx`
- 翻页运动模型：`src/features/calendar/page-turn-motion.ts`
- 统计页面：`src/features/calendar/components/statistics-page.tsx`
- 统计面板：`src/features/calendar/components/statistics-panel.tsx`
- 范围统计：`src/features/plans/statistics/index.ts`
- 主题：`src/features/theme/`
- v3 迁移：`src/features/plans/store/index.ts`

## 关键规则

- `CalendarView` 只包含 `day / week / month`；统计范围中的 `year` 不属于日历视图。
- 月视图点击当前月或相邻月日期都会进入对应日页。
- 返回快照是会话状态，不写入计划持久化。
- 周/月工具栏入口建立返回快照，普通分段控件切换不建立快照。
- 完成率只用已完成与未完成项作分母；当天待处理项进入计划总数但不拉低完成率。
- 全部统计从不晚于今天的最早本地记录开始；没有历史记录时只统计今天。
- 浏览器菜单缩放仍无法由网页脚本拦截。

## 验证结果

- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test`：通过，21 个测试文件、57 个测试。
- `pnpm build`：通过。

## 人工验收项

- 真实手机和触控板上的柔软翻页跟手、完成、回弹和双指取消。
- 工具栏在窄屏的定位、外部关闭、Escape 和焦点恢复。
- 日间、夜间、系统主题切换时的纸面层次和状态色辨识度。
- 月视图 42 格在小屏上的点击尺寸与阅读密度。
- 历史数据实际升级后的 v2 `year` 到 v3 `month` 恢复结果。

## 后续事项

- 数据导入导出与备份迁移。
- 400 条正式每日一句。
- PWA 离线与安装体验。
- 模板与周期预设管理。
