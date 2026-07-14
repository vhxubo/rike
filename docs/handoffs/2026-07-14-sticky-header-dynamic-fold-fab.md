# 增强交接：固定头部、动态折痕与回到今天 FAB

## 关联文档

- 设计规格：`docs/superpowers/specs/2026-07-14-sticky-header-dynamic-fold-fab-design.md`
- 实现计划：`docs/plans/2026-07-14-sticky-header-dynamic-fold-fab-implementation.md`
- 需求过程：`docs/requirements/2026-07-14-rike-requirements-log.md`
- 测试状态：`docs/testing/STATUS.md`

## 已完成

- header 提升到翻页容器外，并使用 sticky 吸附在视口顶部。
- header 左侧保留工具栏或返回及“日课”，手机端隐藏 `Rike`。
- header 右侧增加本周总结按钮和紧凑日/周/月切换。
- 移除实际应用中的设置图标、内容区视图切换和底部 TabBar。
- 删除 `BottomNav` 组件及 `AppShell` navigation 接口。
- 移除日历页 `TODAY`、`PLAN` 和统计页装饰性英文 eyebrow。
- 每日一句成为 header 下方首行，日期导航与计划内容依次排列。
- 手机端页面外侧左右 gutter 归零，内部阅读 padding 保留。
- `PageTurn`、`PaperSheet` 和工作区直接父级允许 overflow visible，桌面 gutter 可以显示越界纸页与阴影。
- 翻页持续采样手指纵向比例，局部折痕中心和角度跟随触点变化。
- 按钮翻页使用 60% 默认折痕位置，减少动态效果继续直接切换。
- 回到今天改为唯一共享 FAB，在当前上下文不包含今天时显示。
- FAB 支持轻点、键盘激活和拖动；拖动不会误触回到今天。
- FAB 使用归一化坐标持久化，恢复和视口变化时夹紧到可视区域。

## 关键路径

- 页面工作区：`src/pages/daily-plan-page.tsx`
- 固定 header：`src/features/calendar/components/sticky-workspace-header.tsx`
- 动态折痕翻页：`src/features/calendar/components/page-turn.tsx`
- 翻页运动模型：`src/features/calendar/page-turn-motion.ts`
- FAB 组件：`src/features/calendar/components/today-fab.tsx`
- FAB 坐标模型：`src/features/calendar/today-fab-position.ts`
- 页面壳：`src/components/layout/app-shell.tsx`、`page-container.tsx`

## 关键规则

- header 和 FAB 不在 `PageTurn` 内，日期翻页不会移动它们。
- 只有最外层工作台抑制横向滚动条，纸页直接父级不裁切视觉。
- 折痕使用连续纵向比例，不采用上/中/下离散档位。
- FAB 在日/周/月、周总结和周/月/年统计范围不包含今天时显示；全部统计隐藏。
- header 从统计或总结页切换到日历视图时保留统一返回快照。
- 手机端仅取消页面外侧 gutter，内容内部边距不变。

## 验证结果

- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test`：通过，23 个测试文件、64 个测试。
- `pnpm build`：通过。

## 人工验收项

- iOS/Android sticky header 与刘海安全区。
- 不同页面滚动位置的折痕触点跟随和纸页越界效果。
- 手机端日课标题、总结按钮和日/周/月按钮的单行布局。
- FAB 在真实触控设备上的拖动阈值、边缘夹紧和安全区距离。
- 桌面宽度下纸页进入外侧 gutter 时的阴影与横向滚动抑制。

## 后续事项

- 根据真实设备体验微调折痕高度、角度与 FAB 默认位置。
- 数据导入导出、正式每日一句、PWA 和模板管理仍未实现。
