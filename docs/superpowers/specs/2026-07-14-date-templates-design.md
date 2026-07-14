# Rike 日期模板与周统计设计

## 1. 范围

本阶段把第一阶段的组件陈列首页替换为可使用的日计划页面，完成：

- 周一至周五固定模板。
- 周六自由编号计划。
- 周日周统计。
- 日期按钮与左右滑动切换。
- 计划状态与日期权限。
- Zustand + localForage 本地持久化。

日/周/年缩放切换、翻页动画、备份文件导入导出、PWA 和 400 条正式每日一句不属于本阶段。

## 2. 页面架构

### 2.1 功能模块

```text
src/features/plans/
  templates/       固定模板配置与按日期生成模板
  store/           Zustand 状态、action 与 localForage 持久化
  status/          日期权限和显示状态派生
  statistics/      周统计纯函数
  components/      日期计划领域组件
```

### 2.2 页面组合

- `DailyPlanPage`：日期导航、滑动容器和页面类型分发。
- `WeekdayPlan`：周一至周五固定模板与日结。
- `SaturdayPlan`：周六大号自由编号计划。
- `SundaySummary`：周日统计。
- `PlanItemRow`：统一呈现待处理、已完成、未完成和未来未开始状态。
- `DateNavigator`：日期标题与前后日期按钮。

首页直接进入 `DailyPlanPage`。第一阶段组件陈列页保留为开发参考，但不再作为首屏。

## 3. 日期类型

```ts
type DayKind = 'weekday' | 'saturday' | 'sunday'
```

- 周一至周五使用固定模板。
- 周六使用自由编号列表。
- 周日只显示本周统计。

一周以周一为起点，周日为终点。日期计算使用 `date-fns`，不手写周起止和星期偏移。

## 4. 工作日模板

### 4.1 模板项字段

```ts
type Subject = '语文' | '英语' | '数学' | '化学' | '生物' | '物理'

interface PlanTemplateItem {
  id: string
  order: number
  subject: Subject | null
  prefix: string
  suffix?: string
  editableMode: 'none' | 'suffix-input' | 'full-input' | 'middle-input'
}
```

`subject` 是统计的唯一科目来源。统计层不得通过显示文字猜测科目。

### 4.2 周一、周三、周五

1. 语文点线面
2. 化学错题/知识点收集整理
3. 数学错题深研
4. 生物 + 输入区
5. 物理错题/知识点收集整理
6. 整行输入区
7. 生物课本 + 输入区 + 阅读研习
8. 物理错题深研

### 4.3 周二、周四

1. 英语教材深研
2. 数学错题/知识点收集整理
3. 化学错题深研
4. 生物 + 输入区
5. 物理错题/知识点收集整理
6. 整行输入区
7. 生物课本 + 输入区 + 阅读研习
8. 物理错题深研

第 2 和第 5 项中的“错题/知识点”是完整固定文案，不是二选一。

### 4.4 编辑规则

- 第 4 项只编辑“生物”后的输入区。
- 第 6 项编辑整行内容。
- 第 7 项只编辑“生物课本”和“阅读研习”之间的输入区，界面不显示下划线占位符。
- 其他固定模板文字不可编辑。

## 5. 周六模板

- 页面中央显示大标题“今日总目标”。
- 初始显示 `1.` 输入行。
- 在输入行按 Enter 新建下一行并自动聚焦。
- 空行按 Backspace 删除当前行，显示序号自动重排。
- 每行保存稳定 ID；删除和重排不得改变其他条目的 ID。
- 每个非空条目独立支持完成与未完成状态。
- 空白条目不计入计划总数，也不能调整状态。
- 周六不显示日结或日记区。
- 周六条目的字体、间距、轮廓、图标和状态背景均使用工作日条目的 `1.5x` 尺寸变体。

## 6. 周日统计

周日不显示计划输入和日记，只显示当前周周一至周六的数据统计：

- 计划输入字数。
- 日结/日记字数。
- 有效计划总数。
- 完成项数量。
- 未完成项数量。
- 六科未完成项分布。

六科分布使用模板 `subject` 字段。工作日第 6 项和全部周六条目的 `subject` 为 `null`，计入总数、完成数和未完成数，但不进入六科分布。

## 7. 状态模型

### 7.1 存储状态

```ts
type ItemResolution = 'completed' | 'missed' | null
```

- `null`：没有主动结论。
- `completed`：已完成。
- `missed`：当天主动取消完成，标记为未完成。

### 7.2 显示状态

```ts
type ItemDisplayStatus = 'upcoming' | 'pending' | 'completed' | 'missed'
```

显示状态由所选日期、今天和 `resolution` 派生：

- 未来日期且 `resolution` 为 `null`：`upcoming`。
- 当天且 `resolution` 为 `null`：`pending`。
- 任意日期且 `resolution` 为 `completed`：`completed`。
- 任意日期且 `resolution` 为 `missed`：`missed`。
- 过去日期且 `resolution` 为 `null`：派生为 `missed`。

### 7.3 当天切换

状态按钮仅在所选日期等于今天时可用：

```text
pending -> completed
completed -> missed
missed -> completed
```

状态一旦从初始待处理进入已完成或未完成，后续不再回到待处理。

### 7.4 日期权限

- 过去日期：所有文字和状态只读。
- 当天：可编辑计划、日结和状态。
- 未来日期：可提前编辑计划输入，不可写日结，不可调整状态。
- 日期过去后，状态和内容自动锁定。

## 8. 状态视觉

- `upcoming`：中性灰状态按钮，内容保持清晰，按钮禁用。
- `pending`：普通纸面与空心圆按钮。
- `completed`：勾选图标、整段删除线和降低透明度。
- `missed`：浅红整行背景、朱砂边线、黄色感叹号警报图标。
- 过去已完成和过去未完成的状态按钮均锁定。

所有状态不能只依赖颜色表达；必须同时使用图标、文字装饰和可访问名称。

## 9. 日期导航与动效

- 顶部日期两侧提供前一天和后一天按钮。
- 在页面非交互区域横向滑动切换日期。
- 输入框、按钮和可滚动区域不得触发日期滑动。
- 页面按滑动方向横向进入和退出。
- `prefers-reduced-motion` 下取消位移动画，直接切换内容。
- 日/周/年双指缩放和翻页动画不在本阶段实现。

## 10. 用户数据结构

```ts
interface WeekdayDayRecord {
  date: string
  inputs: Record<string, string>
  resolutions: Record<string, ItemResolution>
  journal: string
}

interface SaturdayItemRecord {
  id: string
  text: string
  subject: null
  resolution: ItemResolution
}

interface SaturdayDayRecord {
  date: string
  items: SaturdayItemRecord[]
}
```

固定模板文本不写入用户记录。数据只保存输入值、状态、日结和周六自由条目，防止模板文案重复和历史数据膨胀。

## 11. 有效计划与统计口径

### 11.1 有效计划

- 工作日第 1–5、7、8 项始终是有效计划。
- 工作日第 6 项去除空白后非空才是有效计划。
- 周六条目去除空白后非空才是有效计划。

第 4 和第 7 项即使输入区为空，固定模板仍构成有效计划。

### 11.2 完成与未完成

- `completed` 计入完成数。
- `missed` 计入未完成数。
- 已经过期且 `resolution` 为 `null` 的有效条目派生为未完成。
- 空白第 6 项和空白周六行不进入任何计划数量统计。

### 11.3 字数

计划字数只统计：

- 工作日第 4 项输入。
- 工作日第 6 项输入。
- 工作日第 7 项输入。
- 周六自由计划文本。

固定模板文字不计入计划字数。日结字数统计周一至周五日结全文。字数计算去除空格和换行，标点计入。

### 11.4 科目分布

- 只统计未完成的有效条目。
- 只统计 `subject` 非空的工作日模板项。
- 第 6 项和周六自由条目不进入科目分布。

## 12. 持久化

- Zustand 负责领域状态和 action。
- localForage 负责异步本地存储。
- 每次计划输入、日结输入、状态切换、周六增删行后写入本地。
- 存储数据包含版本号，为后续备份和迁移保留升级路径。
- hydration 完成前显示稳定加载状态，避免默认模板闪烁后被本地数据替换。
- hydration 失败时保留内存可用状态并显示非阻塞提示，不覆盖无法解析的原数据。

## 13. 测试

测试至少覆盖：

- 周一/三/五与周二/四的模板映射。
- 模板项科目字段和可编辑模式。
- 第 2、5 项完整保留“错题/知识点”。
- 当天 `pending -> completed -> missed -> completed`。
- 过去和未来日期禁止调整状态。
- 过去内容只读，未来日结禁用。
- 周六 Enter 新增、空行 Backspace 删除和稳定 ID。
- 空白第 6 项、空白周六行不计数。
- 计划字数、日结字数、完成/未完成和六科分布。
- localForage hydration 与保存。
- 日期按钮与滑动切换。
- 减少动态效果设置下的降级。

交付前必须通过 `pnpm typecheck`、`pnpm lint`、`pnpm test` 和 `pnpm build`。

## 14. 完成标准

- 首页按真实日期显示正确的工作日、周六或周日页面。
- 工作日 8 项模板、编辑范围和日期映射准确。
- 周六动态列表和 `1.5x` 视觉变体可用。
- 周日统计符合已确认口径。
- 日期权限和状态视觉准确。
- 刷新后用户输入、状态和日结恢复。
- 日期按钮与左右滑动可用。
- 第二阶段交接文档已写入 `docs/handoffs/`。

