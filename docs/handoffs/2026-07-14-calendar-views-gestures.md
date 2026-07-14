# 第三阶段交接：日周年视图、缩放与翻页

## 关联文档

- 设计规格：`docs/superpowers/specs/2026-07-14-calendar-views-gestures-design.md`
- 实现计划：`docs/plans/2026-07-14-calendar-views-gestures-implementation.md`
- 需求过程：`docs/requirements/2026-07-14-rike-requirements-log.md`
- 测试状态：`docs/testing/STATUS.md`

## 已完成

- 增加完整日、周、年三个日历视图和始终可见的切换控件。
- 周视图展示七日计划数量、完成数、未完成数、整体状态和周日完成率。
- 年视图展示十二个月网格、选中日、今天和每日计划状态。
- 点击周或年视图日期会原子设置日期并进入对应日计划页。
- 按日、周、年视图分别导航一天、一周和一年，闰日跨年回退到 2 月最后一天。
- 增加手机双指、电脑触控板 wheel 和 Safari gesture 的逐级视图缩放。
- 每次连续缩放手势最多切换一级，并在双指开始时取消单指翻页。
- 增加日、周、年通用 CSS 3D 纸页翻动，支持跟手进度、速度/距离提交、回弹、按钮自动翻页和减少动态效果降级。
- 强制拦截 viewport 缩放、Safari gesture、Ctrl/Command wheel、缩放快捷键、多指默认缩放和原生 dragstart。
- 非编辑内容禁止文本选中；输入框、文本域和显式可编辑区域继续允许选中、复制和修改。
- 计划 store 从 v1 升到 v2，持久化当前视图并无损迁移旧日期与计划记录。

## 关键路径

- 主日历页面：`src/pages/daily-plan-page.tsx`
- 周、年视图：`src/features/calendar/components/week-view.tsx`、`year-view.tsx`
- 翻页容器：`src/features/calendar/components/page-turn.tsx`
- 缩放编排：`src/features/calendar/use-calendar-zoom.ts`
- 原生行为拦截：`src/app/native-behavior.ts`
- 日期范围工具：`src/features/plans/date.ts`
- 单日概览与周统计：`src/features/plans/statistics/index.ts`
- v2 状态与迁移：`src/features/plans/store/index.ts`

## 数据与交互规则

- 周、年摘要全部从现有 `records` 派生，不进入持久化数据。
- 无有效计划的周六、周日保持空状态；过去未决工作日按既有规则显示未完成。
- 周、年日期点击属于层级展开，不使用跨范围翻页动画。
- 日、周、年同层级范围切换使用翻页；视图层级切换使用缩放和淡入淡出。
- 输入、按钮、链接等交互区域不启动翻页。
- 双指缩放优先于单指翻页；动画令牌防止取消后的旧回调提交范围变化。
- 浏览器菜单发起的页面缩放无法由网页脚本拦截。

## 验证结果

- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test`：通过，18 个测试文件、45 个测试。
- `pnpm build`：通过。

## 人工验收项

当前自动化环境不能替代真实触控设备和触控板，仍需人工检查：

- iOS/Android 双指收拢、展开和页面原生缩放拦截。
- Mac/Windows 触控板捏合、普通滚轮和浏览器缩放拦截。
- Safari gesture 事件。
- 三个视图的翻页方向、阴影、跟手、完成和回弹手感。
- 输入内容可选中编辑，非编辑文字不可选中，页面元素不可原生拖拽。
- 手机端十二个月网格阅读密度和桌面端三列布局。

## 后续事项

- JSON 数据导入导出与版本迁移。
- 400 条正式每日一句及内容校审。
- PWA 离线缓存与安装体验。
- 用户可配置模板与周期预设。
