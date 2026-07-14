# Rike 第二阶段实现计划

## 目标

依据 `docs/superpowers/specs/2026-07-14-date-templates-design.md`，完成日期模板、状态权限、周六自由列表、周日统计、日期切换和本地持久化。

## 步骤

1. 安装 `date-fns`，建立本地日期格式与周起止工具。
2. 用纯配置实现五天工作日模板，固定科目和编辑模式。
3. 用纯函数实现日期权限、显示状态、当天状态切换和字数统计。
4. 用纯函数实现周日统计，并为边界条件添加测试。
5. 建立 Zustand store、localForage storage 和版本化持久化。
6. 实现 `PlanItemRow`、`WeekdayPlan`、`SaturdayPlan`、`SundaySummary`。
7. 用 Motion 实现日期按钮和非交互区域左右滑动。
8. 把首页切换到真实日计划页面，保留组件陈列页作为开发参考。
9. 覆盖状态、权限、列表键盘交互、统计和恢复测试。
10. 执行工程验证并编写第二阶段交接文档。

## 风险控制

- 日期字符串统一使用本地 `yyyy-MM-dd`，解析统一走 `date-fns/parseISO`。
- 固定模板和用户记录分离，历史数据不复制模板文本。
- 状态显示由日期和 resolution 派生，组件不自行判断过期。
- store action 再次校验日期权限，不能只依赖按钮禁用。
- 周六空白行和工作日空白第 6 项在统计入口统一过滤。
- localForage 恢复失败时不写回默认值，避免覆盖原数据。

## 验收命令

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```
