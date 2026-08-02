# 002 · 移除 V2 展示 Demo

> 状态：Implemented · 用户于 2026-07-21 明确要求删除 V2；游戏后续作为独立平台处理。Lint 验收待处理既有格式化基线。

## 目标

从 Logistics_MEM 中移除不再使用的 V2 展示代码，收敛仓库为 V1 教学平台。

## 范围

- 删除所有 `src/routes/v2*.tsx` 路由；
- 删除 `V2Shell.tsx`、`v2-demo-data.ts`；
- 删除仅服务 V2 的 `OpeningNightCommandGame.tsx`；
- 删除 V1 入口页中前往 `/v2` 的入口；
- 重新生成 TanStack 路由树并验证 V1 构建。

## 范围外

- `SortingGame.tsx` 与 `DeliveryGame.tsx` 仍被 V1 的 Week 8/12 使用，本次保留；未来拆分游戏为独立平台时另建规格。
- 不改变 V1 课程、提交、仿真、批改和教师端行为。

## 验收条件

- 源码中不再存在 V2 路由、V2 shell、V2 数据或 `OpeningNightCommandGame` 的引用。
- `/` 不再展示 V2 入口。
- 路由树不包含 `/v2`。
- `npm run lint` 与 `npm run build` 通过。
