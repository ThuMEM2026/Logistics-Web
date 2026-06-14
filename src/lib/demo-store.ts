// Simple in-memory demo state with subscriber pattern.
import { useEffect, useState } from "react";

export type Role = "student" | "teacher";

export interface CaseItem {
  id: string;
  name: string;
  description: string;
  status: "not_started" | "in_progress" | "completed";
  difficulty: "入门" | "进阶" | "高阶";
  cover: string;
}

export type FileStatus = "pending" | "uploaded" | "passed" | "failed" | "risk" | "queued";

export interface UploadedFile {
  key: string;
  name: string;
  size: string;
  type: string;
  status: FileStatus;
  message?: string;
}

export type SimStatus = "idle" | "queued" | "running" | "success" | "error" | "input_error";

export interface HardConstraint {
  rule: string;
  result: "pass" | "risk" | "fail";
  detail: string;
}

export interface AIScore {
  total: number;
  grade: "A" | "B";
  format: number; sim: number; vrp: number; coord: number;
  summary: string;
  constraints: HardConstraint[];
  evidence: string[];
  problems: { title: string; location: string; judge: string; impact: string }[];
  suggestions: string[];
  recommend: string[];
}

export type WeekStatus = "locked" | "current" | "completed" | "review";
export type WeekTrack = "intro" | "fundamentals" | "sorting" | "delivery" | "integrated" | "review";

export interface WeekItem {
  id: number;
  title: string;
  goal: string;
  track: WeekTrack;
  taskTypes: string[];
  status: WeekStatus;
  highlight?: boolean;
  concepts: string[];
  materials: { type: "PDF" | "视频" | "案例" | "代码" | "数据"; name: string }[];
  practice: { title: string; desc: string; href?: string }[];
  rules?: string[];
}

export type ModuleType = "animation" | "tool" | "challenge" | "prompt";
export type TeacherStatus = "pending" | "recommended" | "adopted" | "needs_revision";

export interface WorkshopComment { author: string; text: string; at: string; }
export interface WorkshopModule {
  id: string;
  title: string;
  author: string;
  group: string;
  type: ModuleType;
  week: number;
  painPoint: string;
  intro: string;
  detail: string;
  cover: string; // emoji or short label
  gradient: string; // CSS gradient
  likes: number;
  liked?: boolean;
  comments: WorkshopComment[];
  status: TeacherStatus;
  teacherNote?: string;
  demoUrl: string;
  usage?: string;
  createdAt: string;
}

export interface State {
  role: Role | null;
  username: string;
  currentCase: string;
  learnProgress: Record<string, number>;
  passedQuiz: Record<string, boolean>;
  unlockedLevel: number;
  hintsUsed: { type: string; penalty: number }[];
  uploadedFiles: UploadedFile[];
  simStatus: SimStatus;
  simResult: null | {
    taskId: string; totalTime: string; maxCarts: number;
    overLimit: boolean; startTime: string; usable: boolean;
  };
  lastScore: null | AIScore;
  variables: { demandDelta: number; storeCount: number; vehicleCap: number };
  cases: CaseItem[];
  resubmit: null | { reasons: string[] };
  workshop: WorkshopModule[];
}

export const TRACK_META: Record<WeekTrack, { label: string; color: string; bar: string }> = {
  intro:        { label: "课程导入", color: "text-muted-foreground", bar: "bg-muted-foreground/60" },
  fundamentals: { label: "基础概念", color: "text-chart-5",          bar: "bg-chart-5" },
  sorting:      { label: "仓内分拣", color: "text-primary",           bar: "bg-primary" },
  delivery:     { label: "物流配送", color: "text-chart-2",           bar: "bg-chart-2" },
  integrated:   { label: "综合协同", color: "text-chart-3",           bar: "bg-chart-3" },
  review:       { label: "复盘汇报", color: "text-chart-4",           bar: "bg-chart-4" },
};

export const WEEKS: WeekItem[] = [
  { id: 1, title: "课程导入与 AI 学习方式", track: "intro", status: "completed",
    goal: "理解《物流网络规划》课程定位、Wafia Bakery 案例和 AI/Vibe Coding 学习方式。",
    taskTypes: ["课程导论", "案例预览"],
    concepts: ["课程目标", "AI 协同学习", "Vibe Coding"],
    materials: [{ type: "PDF", name: "课程导论 Slides.pdf" }, { type: "视频", name: "Wafia 案例 5 分钟概览.mp4" }],
    practice: [{ title: "课程导览", desc: "浏览平台与教学周历结构" }],
  },
  { id: 2, title: "物流网络规划基础", track: "fundamentals", status: "completed",
    goal: "掌握物流网络、门店需求、成本结构与服务约束的基本表达。",
    taskTypes: ["概念学习", "随堂练习"],
    concepts: ["网络节点", "需求/成本", "服务约束"],
    materials: [{ type: "PDF", name: "物流网络规划基础.pdf" }],
    practice: [{ title: "随堂练习", desc: "识别 Wafia 网络中的节点与约束" }],
  },
  { id: 3, title: "Wafia Bakery 案例理解", track: "fundamentals", status: "completed",
    goal: "理解 Wafia 工厂、门店、订单、笼车、配送目标之间的关系。",
    taskTypes: ["案例学习"],
    concepts: ["工厂-门店", "订单与笼车", "配送目标"],
    materials: [{ type: "案例", name: "Wafia Bakery 案例册.pdf" }, { type: "数据", name: "门店与订单样本.xlsx" }],
    practice: [{ title: "案例阅读", desc: "完成 3 个案例理解小题", href: "/student/cases" }],
  },
  { id: 4, title: "核心概念训练", track: "fundamentals", status: "completed", highlight: false,
    goal: "训练对 logistics cage cart / sorting wave / time window 等关键概念的辨识。",
    taskTypes: ["概念学习", "卡片练习"],
    concepts: ["logistics cage cart", "sorting wave", "logistics wave", "time window"],
    materials: [{ type: "PDF", name: "核心概念图谱.pdf" }],
    practice: [{ title: "概念学习", desc: "进入概念卡片与小测", href: "/student/learn" }],
  },
  { id: 5, title: "数据与模板训练", track: "fundamentals", status: "completed",
    goal: "熟悉课程统一的 Excel 模板、字段定义与文件命名规范。",
    taskTypes: ["数据练习"],
    concepts: ["Excel 模板", "字段规范", "文件命名"],
    materials: [{ type: "数据", name: "课程统一模板包 v1.4.zip" }],
    practice: [{ title: "模板填写", desc: "按模板填入样例订单数据" }],
  },
  { id: 6, title: "仓内分拣基础", track: "sorting", status: "completed",
    goal: "掌握 sorting wave 划分原则与笼车数量上限的硬约束。",
    taskTypes: ["概念学习", "训练任务"],
    concepts: ["sorting wave", "拣选顺序", "笼车数量限制"],
    materials: [{ type: "PDF", name: "Sorting Wave 设计要点.pdf" }],
    practice: [{ title: "Wave 上限训练", desc: "练习识别超 80 carts 的方案", href: "/student/map" }],
    rules: ["每个 sorting wave 中笼车数量 ≤ 80"],
  },
  { id: 7, title: "仓内分拣仿真", track: "sorting", status: "completed",
    goal: "理解仿真输入文件、运行流程与分拣完成时间的输出。",
    taskTypes: ["仿真实验"],
    concepts: ["仿真输入", "总分拣时间", "Wave 完成时间"],
    materials: [{ type: "代码", name: "sorting_sim_demo.py（占位）" }],
    practice: [{ title: "仿真演示", desc: "查看一次完整的分拣仿真过程" }],
  },
  { id: 8, title: "仓内分拣专项练习", track: "sorting", status: "current", highlight: true,
    goal: "独立完成一次仓内分拣方案的设计、文件提交、仿真与 AI 反馈闭环。",
    taskTypes: ["综合练习", "文件提交", "AI 批改"],
    concepts: ["sorting wave 上限", "笼车装载", "分拣成本"],
    materials: [
      { type: "PDF", name: "Week 8 任务书.pdf" },
      { type: "数据", name: "订单信息_week14.xlsx" },
      { type: "数据", name: "课程统一模板.zip" },
    ],
    practice: [
      { title: "训练任务", desc: "分拣传送带 / Wave 上限专项训练", href: "/student/map" },
      { title: "提交分拣方案", desc: "上传 Excel、报告并运行在线仿真", href: "/student/submit" },
      { title: "查看 AI 批改", desc: "查看本次方案的 AI 反馈与修改建议", href: "/student/result" },
    ],
    rules: [
      "Excel 字段使用班级共享模板，禁止增删列",
      "每个 sorting wave ≤ 80 carts",
      "总分拣时间向上取整后计算人力成本",
    ],
  },
  { id: 9, title: "仓内分拣优化与复盘", track: "sorting", status: "locked",
    goal: "复盘分拣成本与效率，总结典型错误与优秀方案。",
    taskTypes: ["复盘", "优秀案例"],
    concepts: ["分拣成本", "分拣效率", "典型错误"],
    materials: [{ type: "PDF", name: "优秀分拣方案集（占位）.pdf" }],
    practice: [{ title: "方案对比", desc: "对比 A/B 等级方案差异" }],
  },
  { id: 10, title: "物流配送概念衔接", track: "delivery", status: "locked",
    goal: "认识车辆路径、距离矩阵与配送时间窗等配送方向核心概念。",
    taskTypes: ["概念学习", "衔接演示"],
    concepts: ["距离矩阵", "车辆路线", "配送时间窗"],
    materials: [{ type: "PDF", name: "配送方向概念地图.pdf" }],
    practice: [{ title: "配送演示", desc: "体验配送路径游戏 Demo", href: "/student/map" }],
  },
  { id: 11, title: "配送管理专项练习", track: "delivery", status: "locked",
    goal: "在样例数据上设计配送路线，理解车辆工时与配送成本。",
    taskTypes: ["训练任务"],
    concepts: ["车辆路线", "车辆工时", "配送成本"],
    materials: [{ type: "数据", name: "配送样例数据集.xlsx" }],
    practice: [{ title: "路径设计", desc: "完成一次简化 VRP 设计", href: "/student/map" }],
  },
  { id: 12, title: "分拣与配送衔接", track: "integrated", status: "locked",
    goal: "理解分拣完成 → 货物释放 → 车辆发车的协同时间链路。",
    taskTypes: ["协同练习"],
    concepts: ["分拣完成时间", "货物释放", "车辆发车"],
    materials: [{ type: "PDF", name: "分拣-配送协同图.pdf" }],
    practice: [{ title: "时间链路检查", desc: "判断车辆是否在分拣完成后发车" }],
  },
  { id: 13, title: "综合方案调整", track: "integrated", status: "locked",
    goal: "在综合方案中权衡时间缓冲、车辆复用与稳健性。",
    taskTypes: ["综合练习"],
    concepts: ["时间缓冲", "车辆复用", "成本与稳健性"],
    materials: [{ type: "PDF", name: "综合方案对比模板.pdf" }],
    practice: [{ title: "方案对比", desc: "提交两版综合方案对比分析" }],
  },
  { id: 14, title: "结业汇报与课程沉淀", track: "review", status: "locked",
    goal: "完成 Wafia Bakery 综合方案的提交、汇报与课程沉淀。",
    taskTypes: ["结业汇报", "综合提交"],
    concepts: ["综合方案", "教师评分", "典型错误库"],
    materials: [{ type: "PDF", name: "结业汇报模板.pdf" }],
    practice: [
      { title: "综合方案提交", desc: "提交 Week 14 综合作业", href: "/student/submit" },
      { title: "教师评分查看", desc: "查看 AI + 教师双重批改结果", href: "/student/result" },
    ],
  },
];

export const MODULE_TYPE_META: Record<ModuleType, { label: string; cls: string }> = {
  animation: { label: "教学动画", cls: "bg-chart-5/15 text-chart-5" },
  tool:      { label: "训练工具", cls: "bg-primary/15 text-primary" },
  challenge: { label: "闯关 Demo", cls: "bg-chart-3/20 text-warning-foreground" },
  prompt:    { label: "Prompt / Agent", cls: "bg-chart-2/15 text-chart-2" },
};

export const TEACHER_STATUS_META: Record<TeacherStatus, { label: string; cls: string }> = {
  pending:         { label: "待审核", cls: "bg-secondary text-muted-foreground" },
  recommended:     { label: "已推荐", cls: "bg-success/15 text-success" },
  adopted:         { label: "已纳入课程资源", cls: "bg-primary/15 text-primary" },
  needs_revision:  { label: "需要修改", cls: "bg-destructive/15 text-destructive" },
};

const G = (a: string, b: string) => `linear-gradient(135deg, ${a}, ${b})`;

const WORKSHOP_SEED: WorkshopModule[] = [
  { id: "m1", title: "Sorting Wave 可视化动画", author: "陈一鸣", group: "Group 3", type: "animation", week: 8,
    painPoint: "学生难以想象多个 wave 在仓库里同时流转的过程", cover: "🌊",
    gradient: G("oklch(0.78 0.12 200)", "oklch(0.55 0.20 265)"),
    intro: "用动画演示订单进入 → 分配波次 → 笼车出库的完整过程。",
    detail: "动画支持调节 wave 数与 carts 数，自动高亮超 80 carts 的波次。可配合 Week 8 课件讲解。",
    likes: 24, comments: [
      { author: "王老师", text: "推荐在 Week 8 作为开篇动画使用。", at: "2026-06-10" },
      { author: "周同学", text: "拖动 wave 数那个交互特别直观。", at: "2026-06-09" },
    ],
    status: "recommended", teacherNote: "可作为 Week 8 课堂导入资源。",
    demoUrl: "#demo-m1", usage: "建议用于 Week 8 的开场 5 分钟。", createdAt: "2026-06-08" },

  { id: "m2", title: "Wave 上限检查器", author: "刘子琪", group: "Group 1", type: "tool", week: 8,
    painPoint: "学生提交前不知道自己 Wave 是否超过 80 carts", cover: "🧮",
    gradient: G("oklch(0.85 0.10 150)", "oklch(0.55 0.18 200)"),
    intro: "粘贴 Excel 数据即可一键检查每个 sorting wave 的 carts 数。",
    detail: "支持 Excel 复制粘贴，自动按 wave 聚合 carts 数，超限的行高亮提示并给出修改建议。",
    likes: 41, comments: [
      { author: "蔡老师", text: "非常实用，作业提交前必查。", at: "2026-06-09" },
    ],
    status: "adopted", teacherNote: "已纳入 Week 8 推荐工具，建议作业前自检。",
    demoUrl: "#demo-m2", usage: "Week 8 / Week 14 作业自检", createdAt: "2026-06-05" },

  { id: "m3", title: "笼车装载挑战（闯关版）", author: "高远帆", group: "Group 6", type: "challenge", week: 8,
    painPoint: "学生缺乏对笼车装载策略的直观体验", cover: "📦",
    gradient: G("oklch(0.82 0.14 75)", "oklch(0.60 0.22 25)"),
    intro: "拖动订单进笼车，挑战在不超 80 carts 的前提下最快完成所有订单。",
    detail: "5 个关卡，难度递进；每关结束给出装载效率、超限提示与 AI 反馈。",
    likes: 33, comments: [],
    status: "recommended", teacherNote: "适合作为 Week 8 课堂热身。",
    demoUrl: "#demo-m3", usage: "Week 8 课堂前 10 分钟", createdAt: "2026-06-07" },

  { id: "m4", title: "分拣成本计算器", author: "孟雪", group: "Group 4", type: "tool", week: 9,
    painPoint: "学生在向上取整与 worker-hours 换算时常算错", cover: "🧾",
    gradient: G("oklch(0.88 0.06 250)", "oklch(0.55 0.20 265)"),
    intro: "输入总分拣时间，自动得到向上取整后的成本与工时。",
    detail: "支持自定义单位人工成本，输出 worker-hours、daily sorting employee cost 等关键字段。",
    likes: 18, comments: [], status: "pending",
    demoUrl: "#demo-m4", createdAt: "2026-06-11" },

  { id: "m5", title: "Total Time 甘特图生成器", author: "韩泽宇", group: "Group 8", type: "tool", week: 12,
    painPoint: "Total Time 表只看数字难发现协同冲突", cover: "📊",
    gradient: G("oklch(0.85 0.10 200)", "oklch(0.50 0.20 265)"),
    intro: "上传 Total Time.xlsx 直接生成可视化甘特图。",
    detail: "在甘特图上标识 wave 完成时间与车辆发车时间，红色提示协同冲突。",
    likes: 27, comments: [{ author: "教师助理", text: "建议下学期纳入正式教学资源。", at: "2026-06-10" }],
    status: "pending", demoUrl: "#demo-m5", createdAt: "2026-06-10" },

  { id: "m6", title: "解释 logistics cage cart 的 Agent", author: "苏婧", group: "Group 2", type: "prompt", week: 4,
    painPoint: "学生对 logistics cage cart 与普通容器的差异理解模糊", cover: "🤖",
    gradient: G("oklch(0.85 0.08 150)", "oklch(0.60 0.20 200)"),
    intro: "一个可直接复制的 Prompt，让 LLM 用学生熟悉的语言解释概念。",
    detail: "Prompt 内嵌教学目标、举例风格与误区检查问题，可用于课前自学与课后答疑。",
    likes: 12, comments: [], status: "needs_revision",
    teacherNote: "Prompt 过长，需精简到 200 字以内并加入示例输出。",
    demoUrl: "#demo-m6", createdAt: "2026-06-04" },

  { id: "m7", title: "分拣方案检查 Prompt", author: "周一然", group: "Group 7", type: "prompt", week: 8,
    painPoint: "提交前缺一个统一的自检 Prompt", cover: "✅",
    gradient: G("oklch(0.92 0.04 260)", "oklch(0.55 0.18 265)"),
    intro: "覆盖 wave 上限、笼车装载、成本计算的自检 Prompt 模板。",
    detail: "包含 7 项检查清单与 3 个常见误区追问，可直接粘贴到任意 LLM。",
    likes: 22, comments: [], status: "recommended",
    teacherNote: "建议 Week 8 提交前每位同学使用一次。",
    demoUrl: "#demo-m7", createdAt: "2026-06-06" },

  { id: "m8", title: "仓内分拣流程动画", author: "吴航", group: "Group 5", type: "animation", week: 7,
    painPoint: "对照课件难以理解仿真运行机制", cover: "🎬",
    gradient: G("oklch(0.80 0.14 75)", "oklch(0.55 0.20 265)"),
    intro: "30 秒动画演示订单 → 拣选 → 笼车 → 完成时间输出的完整链路。",
    detail: "动画分 5 个步骤，每步可暂停查看说明文字。",
    likes: 16, comments: [], status: "pending",
    demoUrl: "#demo-m8", createdAt: "2026-06-11" },

  { id: "m9", title: "配送路径排序挑战", author: "林楠", group: "Group 6", type: "challenge", week: 11,
    painPoint: "学生对路径顺序与总时间的关系缺乏直觉", cover: "🚚",
    gradient: G("oklch(0.85 0.10 150)", "oklch(0.60 0.20 25)"),
    intro: "拖动门店重排路径，实时显示总耗时与成本变化。",
    detail: "内置 8 家门店样例数据，鼓励学生在 3 分钟内找到 Top-3 路线。",
    likes: 19, comments: [], status: "pending",
    demoUrl: "#demo-m9", createdAt: "2026-06-09" },

  { id: "m10", title: "生成分拣报告 Prompt", author: "郑昊", group: "Group 1", type: "prompt", week: 9,
    painPoint: "写报告时缺统一结构，每组风格差异大", cover: "📝",
    gradient: G("oklch(0.90 0.05 200)", "oklch(0.55 0.18 265)"),
    intro: "标准化输出 5 段式分拣方案报告。",
    detail: "Prompt 输出包含：方案概述、关键参数、硬约束检查、问题清单、改进建议。",
    likes: 14, comments: [], status: "adopted",
    teacherNote: "已纳入 Week 9 复盘资源。",
    demoUrl: "#demo-m10", createdAt: "2026-06-03" },
];

const initial: State = {
  role: null,
  username: "",
  currentCase: "wafia",
  learnProgress: {},
  passedQuiz: {},
  unlockedLevel: 1,
  hintsUsed: [],
  uploadedFiles: [],
  simStatus: "idle",
  simResult: null,
  lastScore: null,
  variables: { demandDelta: 0, storeCount: 57, vehicleCap: 80 },
  resubmit: null,
  cases: [
    { id: "wafia", name: "Wafia Bakery 分拣配送综合优化", description: "围绕连锁烘焙门店每日配送场景，学生需要完成仓内分拣、笼车装载、车辆路径与协同时间的设计。", status: "in_progress", difficulty: "进阶", cover: "🥐" },
    { id: "freshmart", name: "FreshMart 生鲜冷链（扩展案例）", description: "面向 30 家生鲜门店的冷链配送，受温控与时间窗双重约束。", status: "not_started", difficulty: "高阶", cover: "🥬" },
    { id: "bookhub", name: "BookHub 图书仓储分拣（扩展案例）", description: "处理 5000+ SKU 的图书分拣与笼车装载，重视拣货效率。", status: "completed", difficulty: "入门", cover: "📚" },
  ],
  workshop: WORKSHOP_SEED,
};

let state: State = { ...initial };
const listeners = new Set<() => void>();

export function getState() { return state; }
export function setState(patch: Partial<State> | ((s: State) => Partial<State>)) {
  const p = typeof patch === "function" ? patch(state) : patch;
  state = { ...state, ...p };
  listeners.forEach((l) => l());
}
export function resetState() { state = { ...initial }; listeners.forEach((l) => l()); }

export function useStore<T>(selector: (s: State) => T): T {
  const [, setTick] = useState(0);
  useEffect(() => {
    const fn = () => setTick((t) => t + 1);
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);
  return selector(state);
}

// ============ Workshop helpers ============
export function toggleLike(id: string) {
  setState((s) => ({
    workshop: s.workshop.map((m) => m.id === id
      ? { ...m, liked: !m.liked, likes: m.liked ? m.likes - 1 : m.likes + 1 }
      : m),
  }));
}
export function addComment(id: string, author: string, text: string) {
  setState((s) => ({
    workshop: s.workshop.map((m) => m.id === id
      ? { ...m, comments: [...m.comments, { author, text, at: new Date().toISOString().slice(0, 10) }] }
      : m),
  }));
}
export function addWorkshopModule(m: Omit<WorkshopModule, "id" | "likes" | "comments" | "status" | "createdAt" | "gradient">) {
  const id = `m${Date.now()}`;
  setState((s) => ({
    workshop: [{
      ...m, id, likes: 0, comments: [], status: "pending",
      createdAt: new Date().toISOString().slice(0, 10),
      gradient: G("oklch(0.90 0.05 260)", "oklch(0.55 0.18 265)"),
    }, ...s.workshop],
  }));
  return id;
}
export function updateModuleStatus(id: string, status: TeacherStatus, note?: string) {
  setState((s) => ({
    workshop: s.workshop.map((m) => m.id === id
      ? { ...m, status, teacherNote: note ?? m.teacherNote }
      : m),
  }));
}

// ============ Knowledge ============
export interface Knowledge {
  id: string; name: string; desc: string; embodiment: string; mistake: string;
}
export const KNOWLEDGE: Knowledge[] = [
  { id: "wave", name: "Logistics Wave", desc: "解释配送或分拣为什么要按波次组织，平衡产能与时效。",
    embodiment: "Wafia Bakery 中每日订单被分为多个 sorting wave，决定拣选顺序。",
    mistake: "把所有订单放在同一波次，导致拣选队列堆积、超时。" },
  { id: "cage", name: "Logistics Cage Cart", desc: "物流笼车是分拣、装载和配送的最小搬运单元。",
    embodiment: "每个 wave 的笼车数量直接决定该 wave 的处理能力。",
    mistake: "未按重量/体积合理装载，导致笼车浪费或超载。" },
  { id: "wave_limit", name: "Sorting Wave 限制", desc: "每个 sorting wave 中物流笼车数量不能超过 80。",
    embodiment: "Wave 1 设计为 90 carts 的方案会被判为无效。",
    mistake: "Wave 1 设为 90 carts，虽然报告完整，仍违反硬约束。" },
  { id: "vrp", name: "VRP 路径规划", desc: "车辆路线、门店顺序、距离矩阵与到达时间的组合优化。",
    embodiment: "57 家 Wafia 门店需要由若干辆车在工时内全部覆盖。",
    mistake: "路线遗漏门店或重复访问，属重大错误。" },
  { id: "tw", name: "Time Window & 工时", desc: "配送必须在规定时间前完成，司机工时不能超过限制。",
    embodiment: "Truck 3 单日工时 ≤ 8 小时；门店配送截止 07:00。",
    mistake: "Truck 3 工作时长 8h 12m，违反工时上限。" },
  { id: "joint", name: "Sorting-Delivery Coordination", desc: "Week 14 的核心：车辆发车时间必须晚于对应货物分拣完成时间。",
    embodiment: "Route 2 含 Store 18，属 Wave 4，Wave 4 完成 18:42，发车不得早于 18:42。",
    mistake: "学生填写发车 18:30，导致协同失败。" },
];

export const REQUIRED_FILES = [
  { key: "orders", label: "分拣订单与波次 Excel", ext: ".xlsx", required: true, sample: "订单信息_week14.xlsx" },
  { key: "sortCost", label: "分拣成本 Excel", ext: ".xlsx", required: true, sample: "sorting_cost_week14.xlsx" },
  { key: "vrp", label: "配送路径 Excel", ext: ".xlsx", required: true, sample: "第14周作业_VRP第二轮解法.xlsx" },
  { key: "total", label: "总时间汇总 Excel", ext: ".xlsx", required: true, sample: "Total_Time.xlsx" },
  { key: "report", label: "方案说明文档", ext: ".docx", required: true, sample: "Group_Report.docx" },
  { key: "py", label: "Python 逻辑文件（选交）", ext: ".py", required: false, sample: "sorting_logic.py" },
] as const;

export const GROUPS = [
  { id: "G1", name: "Group 1", grade: "A" as const, total: 88, format: 19, sim: 24, vrp: 22, coord: 23, sim_status: "运行成功", review: "待复核", issues: 1, main: "成本计算存在轻微误差" },
  { id: "G2", name: "Group 2", grade: "A" as const, total: 85, format: 19, sim: 22, vrp: 22, coord: 22, sim_status: "运行成功", review: "待复核", issues: 1, main: "部分配送到达时间需复核" },
  { id: "G3", name: "Group 3", grade: "B" as const, total: 62, format: 15, sim: 8, vrp: 21, coord: 18, sim_status: "无法导入", review: "待复核", issues: 3, main: "Wave 1 包含 90 carts" },
  { id: "G4", name: "Group 4", grade: "A" as const, total: 82, format: 18, sim: 21, vrp: 21, coord: 22, sim_status: "运行成功", review: "已确认", issues: 1, main: "仿真时间与成本表不一致" },
  { id: "G5", name: "Group 5", grade: "B" as const, total: 55, format: 14, sim: 6, vrp: 18, coord: 17, sim_status: "运行异常", review: "待复核", issues: 4, main: "仿真进入 next-day loop" },
  { id: "G6", name: "Group 6", grade: "A" as const, total: 90, format: 20, sim: 24, vrp: 24, coord: 22, sim_status: "运行成功", review: "已确认", issues: 0, main: "仅 1 秒仿真时间误差" },
  { id: "G7", name: "Group 7", grade: "B" as const, total: 60, format: 16, sim: 10, vrp: 19, coord: 15, sim_status: "运行成功", review: "待复核", issues: 2, main: "Wave 1 有 81 carts，违反容量限制" },
  { id: "G8", name: "Group 8", grade: "A" as const, total: 86, format: 19, sim: 23, vrp: 22, coord: 22, sim_status: "运行成功", review: "已确认", issues: 1, main: "分拣成本计算有误" },
];

export const COMMON_ERRORS = [
  { name: "分拣成本计算错误", count: 5 },
  { name: "仿真时间与报告不一致", count: 4 },
  { name: "Excel 字段或格式问题", count: 3 },
  { name: "Sorting wave 超过 80 carts", count: 2 },
  { name: "配送发车早于分拣完成", count: 2 },
];

export function makeMockScore(): AIScore {
  const format = 18, sim = 23, vrp = 23, coord = 22;
  return {
    total: format + sim + vrp + coord,
    grade: "A",
    format, sim, vrp, coord,
    summary: "方案基本有效，可参与 Ranking；主要问题：成本计算存在偏差，Total Time 表中部分发车时间与分拣完成时间未对齐。",
    constraints: [
      { rule: "每个 sorting wave ≤ 80 carts", result: "pass", detail: "最大 wave 为 79 carts" },
      { rule: "Excel 模板字段完整", result: "pass", detail: "未发现字段缺失" },
      { rule: "分拣仿真可运行", result: "pass", detail: "仿真总时间 14h 05m 47s" },
      { rule: "配送路线覆盖所有门店", result: "pass", detail: "57 个门店均已覆盖" },
      { rule: "司机工时 ≤ 8 小时", result: "risk", detail: "Truck 3 工作时长 8h 12m" },
      { rule: "配送发车晚于分拣完成", result: "fail", detail: "Route 2 发车早于 Wave 4 完成时间" },
    ],
    evidence: [
      "读取文件：订单信息_week14.xlsx、sorting_cost_week14.xlsx、VRP第二轮解法.xlsx、Total Time.xlsx",
      "在线仿真任务 ID：SIM-WAFIA-20260610-001",
      "仿真总分拣时间：14h 05m 47s",
      "最大 wave carts：79",
      "系统复核配送路线数量：8 条",
      "系统复核门店数量：57 个",
    ],
    problems: [
      { title: "Route 2 发车时间早于对应分拣波次完成时间",
        location: "Total Time.xlsx / Route 2 / Departure Time",
        judge: "Route 2 包含的 Store 18 属于 Wave 4，Wave 4 完成时间 18:42，但车辆发车时间填写为 18:30。",
        impact: "车辆不能在货物未完成分拣时发车，该问题会影响综合协同评分。" },
      { title: "分拣成本计算未按规则向上取整",
        location: "sorting_cost_week14.xlsx / Working Hours",
        judge: "仿真总时间为 14h 05m 47s，应按规则计为 15 小时，但表格填写为 14.1 小时。",
        impact: "人工成本被低估。" },
    ],
    suggestions: [
      "建议 1：请将 Route 2 的 Departure Time 调整为不早于 18:42，并同步更新后续门店到达时间。",
      "建议 2：请按照向上取整后的 15 小时重新计算 worker-hours 和 daily sorting employee cost。",
    ],
    recommend: ["Sorting-Delivery Coordination", "Sorting Cost 计算规则"],
  };
}
