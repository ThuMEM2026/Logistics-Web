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
  format: number;   // 20
  sim: number;      // 25
  vrp: number;      // 25
  coord: number;    // 30
  summary: string;
  constraints: HardConstraint[];
  evidence: string[];
  problems: { title: string; location: string; judge: string; impact: string }[];
  suggestions: string[];
  recommend: string[];
}

export interface State {
  role: Role | null;
  username: string;
  currentCase: string;
  learnProgress: Record<string, number>;
  passedQuiz: Record<string, boolean>;
  unlockedLevel: number; // 1..5
  hintsUsed: { type: string; penalty: number }[];
  uploadedFiles: UploadedFile[];
  simStatus: SimStatus;
  simResult: null | {
    taskId: string;
    totalTime: string;
    maxCarts: number;
    overLimit: boolean;
    startTime: string;
    usable: boolean;
  };
  lastScore: null | AIScore;
  variables: { demandDelta: number; storeCount: number; vehicleCap: number };
  cases: CaseItem[];
  resubmit: null | { reasons: string[] };
}

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
    { id: "wafia", name: "Wafia Bakery 分拣配送综合优化", description: "围绕连锁烘焙门店每日配送场景，学生需要根据订单数据完成仓内分拣、物流笼车装载、车辆路径规划、成本核算和总时间验证。", status: "in_progress", difficulty: "进阶", cover: "🥐" },
    { id: "freshmart", name: "FreshMart 生鲜冷链（扩展案例）", description: "面向 30 家生鲜门店的冷链配送，受温控与时间窗双重约束。", status: "not_started", difficulty: "高阶", cover: "🥬" },
    { id: "bookhub", name: "BookHub 图书仓储分拣（扩展案例）", description: "处理 5000+ SKU 的图书分拣与笼车装载，重视拣货效率。", status: "completed", difficulty: "入门", cover: "📚" },
  ],
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

export interface Knowledge {
  id: string;
  name: string;
  desc: string;
  embodiment: string;
  mistake: string;
}

export const KNOWLEDGE: Knowledge[] = [
  { id: "wave", name: "Logistics Wave", desc: "解释配送或分拣为什么要按波次组织，平衡产能与时效。",
    embodiment: "Wafia Bakery 中每日订单被分为多个 sorting wave，决定拣选顺序。",
    mistake: "把所有订单放在同一波次，导致拣选队列堆积、超时。" },
  { id: "cage", name: "Logistics Cage Cart", desc: "物流笼车是分拣、装载和配送的最小搬运单元。",
    embodiment: "每个 wave 的笼车数量直接决定该 wave 的处理能力。",
    mistake: "未按重量/体积合理装载，导致笼车浪费或超载。" },
  { id: "wave_limit", name: "Sorting Wave 限制", desc: "每个 sorting wave 中物流笼车数量不能超过 80。",
    embodiment: "Wave 1 设计为 90 个 carts，方案会被判为无效。",
    mistake: "某组将 Wave 1 设为 90 carts，虽然报告说明完整，仍违反硬约束。" },
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
      {
        title: "Route 2 发车时间早于对应分拣波次完成时间",
        location: "Total Time.xlsx / Route 2 / Departure Time",
        judge: "Route 2 包含的 Store 18 属于 Wave 4，Wave 4 完成时间 18:42，但车辆发车时间填写为 18:30。",
        impact: "车辆不能在货物未完成分拣时发车，该问题会影响综合协同评分。",
      },
      {
        title: "分拣成本计算未按规则向上取整",
        location: "sorting_cost_week14.xlsx / Working Hours",
        judge: "仿真总时间为 14h 05m 47s，应按规则计为 15 小时，但表格填写为 14.1 小时。",
        impact: "人工成本被低估。",
      },
    ],
    suggestions: [
      "建议 1：请将 Route 2 的 Departure Time 调整为不早于 18:42，并同步更新后续门店到达时间。",
      "建议 2：请按照向上取整后的 15 小时重新计算 worker-hours 和 daily sorting employee cost。",
    ],
    recommend: ["Sorting-Delivery Coordination", "Sorting Cost 计算规则"],
  };
}
