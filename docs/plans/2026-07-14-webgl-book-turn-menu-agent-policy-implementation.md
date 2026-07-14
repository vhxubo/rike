# Rike WebGL 真实书页与菜单调整实现计划

## 目标

依据 `docs/superpowers/specs/2026-07-14-webgl-book-turn-menu-agent-policy-design.md`，将视图入口移入菜单、修复今日根页面返回逻辑，并使用左侧固定书脊的 WebGL 曲面替换 CSS 折痕。

## 实施顺序

1. 写入根目录 `AGENTS.md` 并删除已过时测试。
2. 菜单增加日视图，header 右侧移除日/周/月；返回上下文显示返回与菜单。
3. 今天日视图清理返回快照，成为无返回按钮的根页面。
4. 引入 `html2canvas`，建立 DOM 页面纹理捕获与三页缓存。
5. 建立左书脊固定的 WebGL 网格、shader、正反面和主题光照。
6. 将下一页实现为右自由边向左卷曲，将上一页实现为同一几何严格逆过程。
7. 把 WebGL renderer 接入 `PageTurn` 状态机，处理准备、拖动、完成、回弹和失败降级。
8. 删除旧 CSS 折痕、阴影和纯运动模型。
9. 更新需求记录、测试状态和交接文档，明确本轮未执行验证。

## 实施限制

- 不新增或修改测试文件。
- 删除 `page-turn-motion.test.ts` 与过时的 `daily-plan-page.test.tsx`。
- 不运行测试、类型检查、Lint、构建、预览、开发服务器、截图或人工验收。
- 不声称实现已通过验证。
