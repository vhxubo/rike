# 第二阶段交接：日期模板与周统计

## 关联文档

- 设计规格：`docs/superpowers/specs/2026-07-14-date-templates-design.md`
- 实现计划：`docs/plans/2026-07-14-date-templates-implementation.md`
- 需求过程：`docs/requirements/2026-07-14-rike-requirements-log.md`
- 测试状态：`docs/testing/STATUS.md`

## 已完成

- 首页由组件陈列页切换为真实日计划页。
- 使用 `date-fns` 统一本地日期、星期和周范围计算。
- 完成周一/三/五与周二/四的 8 项固定模板映射。
- 模板项包含稳定 ID、科目字段、固定前后缀和编辑模式。
- 完成第 4、6、7 项指定输入区，其余固定文字只读。
- 完成未来未开始、当天待处理、已完成和未完成状态视觉。
- 完成当天 `待处理 -> 已完成 <-> 未完成`，过去与未来状态锁定。
- 过去内容只读，未来可填写计划但不能填写日结。
- 完成周六“今日总目标”大号自动编号列表和独立状态。
- 完成周日计划字数、日结字数、计划数量和六科未完成分布。
- 完成日期按钮与非交互区域左右滑动。
- 完成 Zustand + localForage 版本化持久化和恢复失败写保护。
- 同步更新备份数据契约，使其引用当前日期计划记录。

## 关键路径

- 首页：`src/pages/daily-plan-page.tsx`
- 领域模型：`src/features/plans/model.ts`
- 日期工具：`src/features/plans/date.ts`
- 工作日模板：`src/features/plans/templates/index.ts`
- 状态派生：`src/features/plans/status/index.ts`
- 周统计：`src/features/plans/statistics/index.ts`
- 持久化 store：`src/features/plans/store/`
- 日期计划组件：`src/features/plans/components/`
- 滑动边界：`src/features/plans/gestures.ts`

## 已确认规则

- 第 2、5 项完整保留“错题/知识点”。
- 第 6 项为空时不是有效计划，不显示未完成警报，也不进入统计。
- 周六空行不是有效计划。
- 第 6 项和周六条目计入数量，但不进入六科分布。
- 固定模板文字不计入计划字数。
- 未来周日预览不会把未来工作日提前算作未完成。
- 状态和内容权限在 store action 内再次校验，不能只依赖界面禁用。

## 验证结果

- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test`：通过，13 个测试文件、29 个测试。
- `pnpm build`：通过。
- 开发服务器：`http://localhost:5173/`，HTTP `200 OK`。

当前环境没有 Chromium 或 Firefox，未执行真实浏览器截图对比。需要人工检查手机端输入、周六 `1.5x` 尺寸、红色未完成状态和桌面宽度布局。

## 测试流程变更

后续普通增量改动不重复运行完整测试。测试文件继续保留和补充，未执行状态记录在 `docs/testing/STATUS.md` 和当次交接中。大进展节点和完整任务需求结束时再执行完整验证。

## 未完成

- 日/周/年双指缩放切换。
- 翻页动画。
- JSON 数据导入导出与迁移。
- 400 条正式每日一句。
- PWA 和离线能力。
- 用户可配置模板与周期预设管理界面。

## 下一步

下一阶段可处理导入导出与备份迁移，或继续完成日/周/年缩放手势。当前 store 已有版本号和备份契约，可以在不改变页面组件的情况下扩展。
