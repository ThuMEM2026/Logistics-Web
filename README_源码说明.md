# Web Demo 源码说明

## 项目位置

```text
/Users/eric/Desktop/任务书/Logistics_MEM
```

这是当前 Web 端 Demo 的源码目录。

## 运行方式

```bash
npm run dev
```

常见本地地址：

```text
http://localhost:8080
```

构建检查：

```bash
npm run build
```

## 关键源码文件

| 文件 | 作用 |
|---|---|
| `src/lib/demo-store.ts` | Demo 的核心 mock 数据，包括 Week、知识点、案例、共创模块等 |
| `src/routes/student.index.tsx` | 学生端课程周历首页 |
| `src/routes/student.week.$weekId.tsx` | 教学周详情页 |
| `src/routes/student.learn.tsx` | AI 教学视频 / 概念学习页 |
| `src/routes/student.cases.tsx` | 学生端案例库 |
| `src/routes/student.workshop.tsx` | 学生共创工坊列表 |
| `src/routes/student.workshop.$moduleId.tsx` | 学生共创模块详情 |
| `src/routes/student.submit.tsx` | 学生端作业提交 |
| `src/routes/student.result.tsx` | AI 批改结果页 |
| `src/routes/teacher.index.tsx` | 教师端学情看板 |
| `src/routes/teacher.review.tsx` | 教师端 AI 复核 |
| `src/routes/teacher.workshop-review.tsx` | 教师端共创审核 |
| `src/components/AppShell.tsx` | 学生端 / 教师端通用页面框架 |
| `src/components/SortingGame.tsx` | 仓内分拣练习组件 |
| `src/components/DeliveryGame.tsx` | 配送路径练习组件 |

## Lovable 相关

| 文件 | 作用 |
|---|---|
| `.lovable/plan.md` | Lovable 生成 / 改版计划 |
| `.lovable/project.json` | Lovable 项目配置 |

## 注意事项

- `src/routeTree.gen.ts` 是 TanStack Router 自动生成文件，本地 dev/build 可能自动修改。
- `node_modules/` 和 `dist/` 不需要手动编辑。
- 当前目录是独立 git 仓库，提交源码改动时应在本目录内执行 git 命令。
