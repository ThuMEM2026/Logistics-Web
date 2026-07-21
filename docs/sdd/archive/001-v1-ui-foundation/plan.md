# 实施计划 · 001

> 仅在 `spec.md` 获确认后执行。

## 文件级计划

| 顺序 | 文件 | 修改内容 |
| --- | --- | --- |
| 1 | `src/styles.css` | 用清透紫 token 替换蓝紫渐变与高饱和图表色；定义表面、状态、阴影与 focus 规则。 |
| 2 | `src/components/AppShell.tsx` | 统一学生/教师壳层、导航活跃态、身份信息与响应式折叠。 |
| 3 | `src/routes/index.tsx` | 将主展示名称改为“智慧物流系统设计”；分层说明课程基础、项目来源与 Wafia 专题；保留身份与当前任务入口。 |
| 4 | `src/routes/student.index.tsx` | 重排课程周历：当前 Week 8 的“先尝试”主任务、学期进度、周次历程和课程专题说明。 |
| 5 | `src/routes/student.week.$weekId.tsx` | 将 Week 8 的内容按“尝试 → 提问 → 学习 → 验证 → 修改”排序，并压低资料/推荐资源的视觉权重。 |
| 6 | `src/routes/student.assistant.tsx` | 强化任务上下文、提问框架与引导式建议，避免视觉和文案暗示 AI 可直接代做方案。 |
| 7 | `src/routes/student.submit.tsx` | 将预检、仿真、AI 批改组织为状态阶梯；展示已有过程记录，保持原 handlers 与 store 行为。 |
| 8 | `src/routes/student.result.tsx` | 重排报告为结论、硬约束、证据、修改建议。 |
| 9 | `src/routes/teacher.index.tsx` | 对齐 KPI、错误图表与表格状态样式；突出已存在的提交、仿真和复核证据。 |
| 10 | `src/routes/student.cases.tsx`、`student.workshop.tsx`、`student.map.tsx`、`student.submissions.tsx` | 不改变布局结构；验证全局 token 在这些页面上的可读性、状态可辨性与导航可用性。 |

## 验证

- `npm run build`；`npm run lint` 不新增超出已记录 Prettier 基线的问题；
- 学生：入口 → 周历 → Week 8 → 提交 → 仿真 → AI 报告；
- 教师：入口 → 学情看板 → 选中小组；
- 旁路学生页：AI 助教、案例库、共创工坊、闯关地图、我的提交；
- 响应式：375px、768px、桌面；
- 可访问性：检查正文对比度、键盘 focus 与非颜色状态标识；
- 对照本规格的验收条件人工检查。

## 风险

- Tailwind CSS 4 token 改动会影响所有 V1 路由，须先集中定义、后逐页校正。
- 导航项较多，移动端不能保留横向拥挤布局。
- Demo store 是内存状态，刷新会重置；视觉流程不能假设持久化状态。
- 当前 lint 有既有 Prettier 基线问题；本规格不通过格式化全仓库掩盖功能性变更，需单独记录并处理。
