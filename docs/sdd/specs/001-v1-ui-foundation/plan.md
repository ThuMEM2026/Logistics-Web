# 实施计划 · 001

> 仅在 `spec.md` 获确认后执行。

## 文件级计划

| 顺序 | 文件 | 修改内容 |
| --- | --- | --- |
| 1 | `src/styles.css` | 保留根级既有 token；新增 `[data-ui="v1"]` 范围内的清透紫 token、表面、状态、阴影与 focus 规则。 |
| 2 | `src/components/AppShell.tsx` | 在 V1 壳层声明 `data-ui="v1"`；统一学生/教师壳层、导航活跃态、身份信息与响应式折叠。 |
| 3 | `src/routes/index.tsx` | 在 V1 入口声明 `data-ui="v1"`；保留身份入口，突出当前教学任务；V2 不在 V1 的主视觉中出现。 |
| 4 | `src/routes/student.index.tsx` | 重排课程周历：当前 Week 8 主任务、学期进度、周次历程和课程方向说明。 |
| 5 | `src/routes/student.week.$weekId.tsx` | 将 Week 8 的内容按任务闭环排序，并压低资料/推荐资源的视觉权重。 |
| 6 | `src/routes/student.submit.tsx` | 将预检、仿真、AI 批改组织为状态阶梯；保持原 handlers 与 store 行为。 |
| 7 | `src/routes/student.result.tsx` | 重排报告为结论、硬约束、证据、修改建议。 |
| 8 | `src/routes/teacher.index.tsx` | 对齐 KPI、错误图表与表格状态样式。 |

## 验证

- `npm run lint`、`npm run build`；
- 学生：入口 → 周历 → Week 8 → 提交 → 仿真 → AI 报告；
- 教师：入口 → 学情看板 → 选中小组；
- 回归：打开 `/v2`，确认其背景、主按钮与导航没有因 V1 token 改动而变化；
- 响应式：375px、768px、桌面；
- 可访问性：检查正文对比度、键盘 focus 与非颜色状态标识；
- 对照本规格的验收条件人工检查。

## 风险

- V1/V2 共用 Tailwind token；必须通过 `data-ui="v1"` 限定 V1 变量覆盖，否则会影响 V2。
- 导航项较多，移动端不能保留横向拥挤布局。
- Demo store 是内存状态，刷新会重置；视觉流程不能假设持久化状态。
