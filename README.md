# 日课 Rike

一款移动端优先的学习计划应用，用于记录每日任务、完成情况、日记与阶段统计。

在线访问：[https://vhxubo.github.io/rike/](https://vhxubo.github.io/rike/)

## 功能

- 日、周、月日历视图
- 工作日计划、周六目标与周总结
- 任务完成状态和未完成分布统计
- 每日赞语及收藏
- 摸鱼大转盘与中奖统计
- 日间、夜间和跟随系统主题

## 本地开发

环境要求：Node.js 24、pnpm 11。

```bash
pnpm install
pnpm dev
```

生产构建：

```bash
pnpm build
```

## 部署

推送到 `main` 分支后，GitHub Actions 会自动构建并部署 `dist` 到 GitHub Pages。

仓库的 `Settings → Pages → Source` 需要设置为 `GitHub Actions`。

## 数据

计划、设置、收藏和抽奖记录保存在当前浏览器本地，不会自动同步到其他设备或浏览器。

## 技术栈

React、TypeScript、Vite、Tailwind CSS、Zustand。
