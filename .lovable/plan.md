# 改版方案：教学周驱动 + Vibe Coding 共创课程平台

## 总体思路

把当前「功能菜单式 Demo」重构为「按 14 个教学周组织的课程平台」，同时新增「Vibe Coding 共创工坊」一级模块。原有功能（概念学习、方案提交、AI 批改、在线仿真、教师看板等）不删除，而是作为 Week 详情页内的功能区或教师端入口被复用。

## 一、信息架构调整

**学生端导航（替换原 5 项菜单）**
- 课程周历（首页）→ `/student` （14 个 Week 卡片）
- 共创工坊 → `/student/workshop`
- 案例库 → `/student/cases`（原 student.index 迁移）
- 我的提交 → `/student/submissions`（聚合提交+AI 批改）

**教师端导航（在原基础上新增 1 项）**
- 学情看板 / 案例管理 / 变量注入 / AI 复核 / 评分规则
- 新增：共创审核 → `/teacher/workshop-review`

**首页 `/`**：不再是营销 Hero，改为「课程平台入口」——只保留一段简短介绍 + 学生/教师入口卡片，加一段「项目背景：清华 MEM × 蔡临宁老师 × Wafia Bakery」说明。

## 二、Week 周历（学生端首页）

`/student` 改为周历布局：
- 顶部：课程概览条（当前进行至 Week 8 · 总进度条 · 仓内分拣重点标识）
- 4 列网格 × 14 个 Week 卡片
- 卡片状态：未开放（灰）/ 当前进行（高亮发光）/ 已完成（绿勾）/ 可回顾（次级）
- 卡片内容：周次 + 标题 + 学习目标一句话 + 任务类型标签 + 进入按钮
- 颜色区分方向：仓内分拣（Week 6-9 主色）、配送（Week 10-11 次色）、综合（Week 12-14 强调色）

14 周内容按需求文档给出的结构填充，Week 8 标注「★ 重点周」。

## 三、Week 详情页

统一路由 `/student/week/$weekId`，单一模板按 weekId 渲染不同内容区块。模板包含 7 个区域：
1. 本周学习目标（要点列表）
2. 核心概念卡片（复用 KNOWLEDGE 数据）
3. 学习材料（PDF/视频占位）
4. 练习任务（链接到训练任务）
5. 作业/文件提交（Week 8 时嵌入完整提交模块）
6. AI 反馈 / 规则提示
7. 推荐共创模块（2-3 张共创卡片）

**Week 8 特殊处理**——做成"完整周次样板"：
- 必交文件清单 + 文件预检（复用现有 submit 逻辑）
- sorting wave 上限提示卡
- 仿真结果样例展示
- AI 批改反馈（复用 result 页内容）
- 修改建议
- 3 个推荐共创模块（sorting wave 动画、wave 上限检查器、笼车装载挑战）

**Week 10-11**：轻量展示，嵌入现有 DeliveryGame 作为衔接预览。
**Week 12-14**：综合周，链接到原综合提交流程。

其他周：占位为「学习材料 + 核心概念 + 一个练习入口」。

## 四、Vibe Coding 共创工坊

**列表页 `/student/workshop`**
- 顶部：标题 + 简介 + 「上传共创模块」按钮
- 筛选条：教学周 / 模块类型（动画、工具、闯关 Demo、Prompt）/ 教师状态（待审核、已推荐、已纳入）/ 排序（热度、最新）
- 模块卡片网格：标题、作者小组、类型 Badge、适用 Week Badge、解决痛点、简介、占位封面图、👍 数、💬 数、教师状态徽标、查看详情按钮

**详情页 `/student/workshop/$moduleId`**
- 标题、作者、Week、类型、痛点
- 模块说明（多段文字）
- 演示截图/视频占位区
- "进入 Demo" 按钮（mock 跳转）
- 点赞/投票按钮（本地 state）
- 评论区（mock 数据 + 输入框）
- 教师审核状态卡 + 教师点评
- "推荐到本周课程资源"状态

**上传弹窗**：在列表页通过 Dialog 实现，包含所有字段，提交后 toast「等待教师审核」并 append 到本地 list。

**Mock 数据**：在 demo-store 中加入 8-10 个共创模块，覆盖 4 种类型、多个 Week，含不同审核状态。

## 五、教师端共创审核

`/teacher/workshop-review`：
- 列表展示所有学生模块，操作按钮：标记已推荐 / 纳入课程资源 / 需要修改 / 添加点评 / 查看投票评论。
- 状态变化直接更新 demo-store，列表和学生侧 Week 详情同步反映。

## 六、共创模块挂载机制

在 demo-store 的 module 数据上加 `week: number` 和 `teacherStatus: "pending" | "recommended" | "adopted" | "needs_revision"` 字段。Week 详情页通过 `modules.filter(m => m.week === weekId && (m.teacherStatus === "recommended" || m.teacherStatus === "adopted"))` 渲染推荐共创区，体现「教师审核 → 自动出现在 Week 页」的联动。

## 七、视觉风格

- 保持现有 design tokens（gradient-hero / gradient-card / shadow-soft）
- 加 1-2 个状态色：locked（灰）、current（primary 发光）、completed（success）
- 周卡片：圆角 2xl + 顶部色条标识方向（分拣/配送/综合）
- 整体减少营销感，更像 LMS（学习管理系统）

## 八、技术实现清单

**新建文件**
- `src/routes/student.index.tsx` → 重写为周历（保留旧文件内容迁移到 cases）
- `src/routes/student.cases.tsx` → 原案例库
- `src/routes/student.week.$weekId.tsx` → Week 详情页（动态路由）
- `src/routes/student.workshop.tsx` → 共创列表
- `src/routes/student.workshop.$moduleId.tsx` → 共创详情
- `src/routes/student.submissions.tsx` → 聚合提交记录
- `src/routes/teacher.workshop-review.tsx` → 教师审核
- `src/routes/index.tsx` → 简化为入口选择页

**修改文件**
- `src/lib/demo-store.ts` → 新增 `WEEKS` / `WORKSHOP_MODULES` 数据 + 操作函数（点赞、上传、审核状态变更）
- `src/routes/student.tsx` → 更新导航
- `src/routes/teacher.tsx` → 新增"共创审核"导航
- 保留 `student.learn / map / submit / result` 路由作为 Week 详情内引用的子页面（也可在 Week 详情内直接嵌入组件）

**Mock 数据规模**
- 14 个 Week 对象
- 10 个共创模块（含截图占位 emoji/渐变色块）
- 5-8 条评论 mock

## 九、Demo 状态约定

- 当前进度 = Week 8 进行中，Week 1-7 已完成，Week 9-14 未开放（可点击预览）
- 共创工坊有 10 个模块，3 个已推荐、2 个已纳入、4 个待审核、1 个需修改

完成后用户能在首页直接看到课程周历，点击 Week 8 看到完整仓内分拣专项练习闭环，并能在共创工坊浏览/上传模块，教师端能审核并联动到 Week 页。