# 技术架构 · V1 事实基线

## 运行时

- TanStack Start + TanStack Router + React 19 + TypeScript。
- Tailwind CSS 4 负责样式；全局 token 在 `src/styles.css`。
- Demo 数据与可变状态位于 `src/lib/demo-store.ts`，通过订阅式内存 store 驱动。
- 关键交互组件包括 `SortingGame.tsx` 与 `DeliveryGame.tsx`；其他游戏能力后续作为独立平台处理。

## 路由结构

```text
/                         身份入口（学生 / 教师）
/student                  学生壳层
  /                       课程周历
  /week/:weekId           教学周详情
  /learn                  概念学习
  /map                    闯关与交互练习
  /submit                 文件预检、仿真与 AI 批改入口
  /result                 AI 批改报告
  /assistant              AI 助教
  /workshop               共创工坊及详情
  /cases /submissions     案例库、提交记录
/teacher                  教师壳层
  /                       学情看板
  /cases /variables       案例与变量
  /review /workshop-review /rules
```

## UI 边界

- `src/components/AppShell.tsx`：学生、教师共用的应用壳层。
- `src/styles.css`：全局颜色、圆角、阴影、基础字体与 motion token。
- 每个路由页面自身负责页面内容与局部交互，不应把跨页面 token 写死在路由中。

## 当前风险

- 主题同时使用蓝紫渐变和多种 chart 色，视觉角色不够收敛。
- 多数页面采用同构卡片堆叠，导致当前任务与次要信息权重接近。
- `demo-store` 是前端模拟状态；UI 优化不得假设存在后端持久化或真实上传。
- Tailwind CSS 4 token 位于全局 CSS；视觉改造应集中定义、再逐页校正，避免路由内硬编码。
