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

export interface State {
  role: Role | null;
  username: string;
  currentCase: string;
  learnProgress: Record<string, number>; // knowledge id -> 0-100
  passedQuiz: Record<string, boolean>;
  unlockedLevel: number; // 1..3
  hintsUsed: { type: string; penalty: number }[];
  uploadedFiles: { name: string; size: string; type: string }[];
  lastScore: null | {
    total: number;
    code: number;
    format: number;
    sim: number;
    coord: number;
    issues: { severity: "high" | "mid" | "low"; title: string; reason: string; suggest: string; deduct: number }[];
  };
  variables: { demandDelta: number; storeCount: number; vehicleCap: number };
  cases: CaseItem[];
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
  lastScore: null,
  variables: { demandDelta: 0, storeCount: 24, vehicleCap: 100 },
  cases: [
    { id: "wafia", name: "Wafia Bakery 配送优化", description: "为连锁烘焙门店设计波次分拣与车辆路径方案，提升配送时效。", status: "in_progress", difficulty: "进阶", cover: "🥐" },
    { id: "freshmart", name: "FreshMart 生鲜冷链", description: "面向 30 家生鲜门店的冷链配送，受温控与时间窗双重约束。", status: "not_started", difficulty: "高阶", cover: "🥬" },
    { id: "bookhub", name: "BookHub 图书仓储分拣", description: "处理 5000+ SKU 的图书分拣与笼车装载，重视拣货效率。", status: "completed", difficulty: "入门", cover: "📚" },
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

export const KNOWLEDGE = [
  { id: "wave", name: "波次划分", desc: "如何将订单划分到不同发货波次以平衡产能与时效。" },
  { id: "cage", name: "笼车装载", desc: "结合体积、重量、商品属性进行笼车合理装载。" },
  { id: "vrp", name: "VRP 路径规划", desc: "Vehicle Routing Problem 经典模型与启发式求解。" },
  { id: "joint", name: "联合优化", desc: "波次—笼车—路径的联合协调，避免局部最优陷阱。" },
];

export function makeMockScore(): State["lastScore"] {
  const code = 26;
  const format = 18;
  const sim = 15;
  const coord = 23;
  return {
    total: code + format + sim + coord,
    code, format, sim, coord,
    issues: [
      { severity: "high", title: "波次 3 笼车超载 15%", reason: "导致仿真中分拣队列堆积，整体完成时间超出 SLA 12 分钟。", suggest: "将 SKU#3201 拆分到波次 4，或启用第 2 号笼车并补充配重。", deduct: 8 },
      { severity: "mid", title: "VRP 路径未考虑左转限制", reason: "路径 R2 在仿真中实际行驶时间比规划多 7 分钟。", suggest: "在距离矩阵中加入左转惩罚，或改用 OR-Tools 的 turn penalty 参数。", deduct: 5 },
      { severity: "low", title: "Excel 模板缺少 SKU 校验公式", reason: "影响数据完整性自动校验，未影响最终得分。", suggest: "在 D 列加入 =COUNTIF 去重校验。", deduct: 2 },
    ],
  };
}
