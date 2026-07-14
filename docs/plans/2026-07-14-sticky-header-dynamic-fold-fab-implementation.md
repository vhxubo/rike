# Rike 固定头部、动态折痕与 FAB 实现计划

## 目标

依据 `docs/superpowers/specs/2026-07-14-sticky-header-dynamic-fold-fab-design.md`，重构页面壳与翻页层级，集中 header 操作，加入触点局部折痕和可拖动回到今天 FAB。

## 实施顺序

1. 移除 `BottomNav` 与 `AppShell` navigation 接口，手机端页面外侧 gutter 归零。
2. 建立位于翻页外层的 sticky header，组合工具栏/返回、标题、周总结和日周月按钮。
3. 移除设置、内容区视图切换、`TODAY` 和 `PLAN`，重排每日一句、日期导航与计划内容。
4. 将 `PageTurn` 直接父级改为 overflow visible，最外层只抑制横向滚动条。
5. 扩展翻页运动模型，按触点纵向比例计算折痕中心和角度。
6. 把折痕改为局部渐变层，按钮翻页使用 60% 默认起折位置。
7. 建立 `TodayFab`，实现显隐、点击、拖动阈值、视口夹紧和归一化位置持久化。
8. 将 FAB 回到今天语义接入日历、周总结和统计页面。
9. 更新组件陈列、测试台账和交接文档，执行完整验证。

## 风险控制

- sticky header 与 FAB 位于 `PageTurn` 外，不能被页面 transform 建立的层叠上下文影响。
- 只在视口最外层抑制横向滚动，纸页直接父级必须允许视觉越界。
- 折痕位置使用纯函数和归一化输入，视口尺寸变化不影响计算一致性。
- FAB 拖动超过阈值后抑制点击，位置恢复始终经过边界夹紧。
- 删除底部导航后同步移除所有底部 padding，避免空白占位。

## 验收命令

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```
