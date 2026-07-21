export const bakeryStores = [
  { id: "S01", name: "紫荆书院店", area: "校内北区", orders: 142, promisedAt: "07:20", priority: "高", temp: "常温" },
  { id: "S02", name: "新雅书院店", area: "校内南区", orders: 96, promisedAt: "07:35", priority: "中", temp: "常温" },
  { id: "S03", name: "经管学院店", area: "东门", orders: 118, promisedAt: "07:25", priority: "高", temp: "冷链" },
  { id: "S04", name: "五道口店", area: "校外商圈", orders: 188, promisedAt: "08:00", priority: "高", temp: "常温" },
  { id: "S05", name: "双清公寓店", area: "西区", orders: 74, promisedAt: "07:50", priority: "中", temp: "常温" },
  { id: "S06", name: "金融街快闪点", area: "城市店", orders: 212, promisedAt: "08:20", priority: "高", temp: "冷链" },
] as const;

export const v2FinalDemoState = {
  student: {
    name: "李同学",
    cohort: "清华书院本科体验班",
    mission: "面包工坊开业夜分拣任务",
    currentStage: "已完成冷启动挑战，进入正式 Week 8 分拣方案修改",
    ability: [
      { label: "约束识别", value: 86, note: "第二轮已主动修正 80 carts 超限问题" },
      { label: "系统联动", value: 74, note: "能解释分拣完成时间如何影响配送缓冲" },
      { label: "AI 提问", value: 92, note: "提问包含背景、目标、约束、已有尝试" },
      { label: "方案迭代", value: 81, note: "根据反馈完成 3 次修改" },
    ],
  },
  finalMetrics: {
    onTime: 91,
    accuracy: 96.4,
    maxWaveCarts: 78,
    deliveryBuffer: 46,
    laborCost: 1480,
    questionQuality: 5,
  },
  processLog: [
    { time: "00:00", event: "进入 v2 开业夜指挥台", evidence: "选择“稳健优先”作为运营目标" },
    { time: "02:18", event: "第一次仿真失败", evidence: "最大 wave carts = 86，触发硬约束预警" },
    { time: "03:41", event: "向 AI 提问教练求助", evidence: "补充背景、目标、80 carts 约束与已有配置" },
    { time: "06:05", event: "第二轮修改", evidence: "拆分高峰波次，增加异常件复核岗" },
    { time: "08:12", event: "形成正式提交草案", evidence: "准时率 91%，错分率 3.6%，配送缓冲 46 分钟" },
  ],
  aiTranscript: [
    {
      role: "student",
      text: "我在面包工坊开业夜任务里，目标是稳健优先。当前最大 wave carts 是 86，人手 9 人，配送缓冲只有 28 分钟。请先帮我判断硬约束风险，再给 2 个修改方向。",
    },
    {
      role: "assistant",
      text: "你的问题已经包含背景、目标、约束和已有尝试。优先修正 80 carts 硬约束；其次把异常件从主波次拆出，增加复核岗，避免准时率看似提高但错分率上升。",
    },
  ],
  teacherSummary: {
    started: 42,
    completed: 36,
    askedAi: 31,
    revised: 27,
    secondVisit: 24,
    avgQuestionQuality: 3.8,
  },
  heatmap: [
    { label: "第一次忽略 80 carts 上限", count: 18, advice: "推送 wave 拆分动画" },
    { label: "只优化成本，不看配送缓冲", count: 14, advice: "推送分拣-配送接口案例" },
    { label: "AI 提问缺少业务目标", count: 20, advice: "推送提问模板" },
    { label: "异常件未单独处理", count: 11, advice: "推送异常件复核规则" },
    { label: "修改后没有解释原因", count: 9, advice: "要求补充方案说明" },
  ],
  studentRecords: [
    {
      name: "李同学",
      firstTry: "最大 wave carts 86，配送缓冲 28 分钟",
      finalState: "拆分波次 + 增加异常件复核岗",
      questionScore: 5,
      revisions: 3,
      result: "可复核优秀样例",
    },
    {
      name: "王同学",
      firstTry: "成本优先，人手压到 6 人",
      finalState: "补充 2 名高峰临时岗",
      questionScore: 3,
      revisions: 2,
      result: "仍需解释成本权衡",
    },
    {
      name: "赵同学",
      firstTry: "准时率高但错分率 9.8%",
      finalState: "增加扫码复核，降低错分",
      questionScore: 4,
      revisions: 2,
      result: "达成有效方案",
    },
    {
      name: "陈同学",
      firstTry: "未考虑冷链门店优先级",
      finalState: "冷链订单提前波次处理",
      questionScore: 4,
      revisions: 3,
      result: "建议进入真实案例扩展",
    },
  ],
};

export type OpeningNightResult = {
  score: number;
  onTime: number;
  accuracy: number;
  cost: number;
  buffer: number;
  maxWave: number;
  questionQuality: number;
  bottleneck: string;
  profile: Array<{ label: string; value: number; note: string }>;
};
