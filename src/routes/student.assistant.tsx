import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Bot,
  Code2,
  FileCheck2,
  GraduationCap,
  Lightbulb,
  MessageSquareText,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { KNOWLEDGE, WEEKS } from "@/lib/demo-store";

export const Route = createFileRoute("/student/assistant")({ component: AssistantPage });

type AgentMode = "qa" | "coach" | "rules" | "vibe";
type ChatMessage = { role: "assistant" | "user"; text: string };

const MODES: Record<AgentMode, { label: string; desc: string; icon: typeof Bot }> = {
  qa: { label: "课程问答", desc: "解释概念、案例和课堂材料", icon: GraduationCap },
  coach: { label: "任务教练", desc: "拆解作业步骤，不直接代写方案", icon: Lightbulb },
  rules: { label: "规则解释", desc: "说明预检、仿真和评分规则", icon: ShieldCheck },
  vibe: { label: "Vibe Coding 教练", desc: "把学习痛点拆成可共创的小工具", icon: Code2 },
};

function AssistantPage() {
  const search = Route.useSearch() as {
    mode?: AgentMode;
    from?: string;
    week?: string | number;
    concept?: string;
    focus?: string;
  };
  const initialMode = search.mode && MODES[search.mode] ? search.mode : "qa";
  const [mode, setMode] = useState<AgentMode>(initialMode);
  const context = useMemo(() => buildContext(search), [search.from, search.week, search.concept, search.focus]);
  const suggestions = useMemo(() => buildSuggestions(search, mode), [search.from, search.week, search.concept, search.focus, mode]);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: `我会结合${context.label}回答。首版为前端 Demo，会模拟课程助教的上下文问答；真实大模型、RAG 引用和教师配置会在后续接入。`,
    },
  ]);

  const send = (text: string) => {
    const q = text.trim();
    if (!q) return;
    setMessages((prev) => [
      ...prev,
      { role: "user", text: q },
      { role: "assistant", text: makeMockAnswer(q, mode, context) },
    ]);
    setInput("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Bot className="h-3.5 w-3.5" /> AI 助教 · 前端演示版
          </div>
          <h1 className="mt-3 text-3xl font-bold">课程助教 Agent</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            围绕 Wafia Bakery、仓内分拣、配送协同和 Vibe Coding 共创，帮助学生理解规则、拆解任务、定位问题。
          </p>
        </div>
        {context.backLink && (
          <Link
            to={context.backLink.to}
            params={context.backLink.params}
            search={context.backLink.search}
            className="inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm hover:border-primary"
          >
            返回上下文 <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="space-y-4">
          <div className="rounded-2xl border bg-card p-5">
            <div className="mb-3 text-sm font-semibold">助教模式</div>
            <div className="space-y-2">
              {(Object.keys(MODES) as AgentMode[]).map((key) => {
                const item = MODES[key];
                const Icon = item.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setMode(key)}
                    className={`w-full rounded-xl border p-3 text-left transition-all ${
                      mode === key ? "border-primary bg-accent" : "bg-background/40 hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Icon className="h-4 w-4 text-primary" /> {item.label}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{item.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <FileCheck2 className="h-4 w-4 text-primary" /> 当前上下文
            </div>
            <div className="mt-3 rounded-xl bg-secondary p-3 text-sm">
              <div className="font-medium">{context.label}</div>
              <div className="mt-1 text-xs leading-relaxed text-muted-foreground">{context.detail}</div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              AI 建议仅供学习，最终以教师要求、课程任务书和课堂说明为准。
            </p>
          </div>
        </aside>

        <main className="space-y-4">
          <div className="rounded-2xl border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="h-4 w-4 text-primary" /> 推荐问题
              </div>
              <span className="text-xs text-muted-foreground">{MODES[mode].label}</span>
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {suggestions.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="rounded-xl border bg-background/40 p-3 text-left text-sm transition-all hover:border-primary hover:bg-accent"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border bg-card" style={{ boxShadow: "var(--shadow-soft)" }}>
            <div className="border-b bg-secondary/70 px-5 py-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <MessageSquareText className="h-4 w-4 text-primary" /> 多轮问答
              </div>
            </div>
            <div className="max-h-[520px] space-y-4 overflow-y-auto p-5">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t p-4">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") send(input);
                  }}
                  placeholder="输入你的问题，例如：为什么 sorting wave 不能超过 80 个笼车？"
                  className="min-w-0 flex-1 rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <button
                  onClick={() => send(input)}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground"
                  style={{ background: "var(--gradient-hero)" }}
                >
                  <Send className="h-4 w-4" /> 发送
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <InfoCard icon={BookOpen} title="依据课程材料" text="后续接入课件、任务书、评分规则和典型错误库。" />
            <InfoCard icon={ShieldCheck} title="保留学习边界" text="帮助理解和修改，不直接生成完整作业答案。" />
            <InfoCard icon={Code2} title="连接共创" text="可把痛点转为动画、工具、小游戏或 Prompt/Agent 模块。" />
          </div>
        </main>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, title, text }: { icon: typeof Bot; title: string; text: string }) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <Icon className="h-5 w-5 text-primary" />
      <div className="mt-2 text-sm font-semibold">{title}</div>
      <div className="mt-1 text-xs leading-relaxed text-muted-foreground">{text}</div>
    </div>
  );
}

function buildContext(search: { from?: string; week?: string | number; concept?: string; focus?: string }) {
  const week = search.week ? WEEKS.find((w) => w.id === Number(search.week)) : null;
  const concept = search.concept ? KNOWLEDGE.find((k) => k.id === search.concept) : null;
  if (search.from === "learn" && concept) {
    return {
      label: `概念学习：${concept.name}`,
      detail: `${concept.desc}。当前问题会优先围绕视频知识点、案例体现和常见错误展开。`,
      backLink: { to: "/student/learn" as const, search: { concept: concept.id, fromWeek: search.week } },
    };
  }
  if (search.from === "submit") {
    return {
      label: "方案提交与文件预检",
      detail: "当前问题会优先围绕必交文件、字段结构、预检提示、在线仿真状态和重新提交建议展开。",
      backLink: { to: "/student/submit" as const },
    };
  }
  if (search.from === "result") {
    return {
      label: "AI 批改报告反馈",
      detail: "当前问题会优先围绕分项得分、硬约束、问题定位、证据引用和修改步骤展开。",
      backLink: { to: "/student/result" as const },
    };
  }
  if (week) {
    return {
      label: `Week ${week.id}：${week.title}`,
      detail: `${week.goal} 核心概念：${week.concepts.join("、")}。`,
      backLink: { to: "/student/week/$weekId" as const, params: { weekId: String(week.id) } },
    };
  }
  return {
    label: "全课程学习",
    detail: "当前问题会优先围绕 Wafia Bakery 案例、仓内分拣、配送协同、AI 批改和 Vibe Coding 共创展开。",
    backLink: null,
  };
}

function buildSuggestions(
  search: { from?: string; week?: string | number; concept?: string; focus?: string },
  mode: AgentMode,
) {
  if (mode === "vibe") {
    return [
      "我想用 Vibe Coding 做一个笼车装载动画，应该怎么拆模块？",
      "如何把 sorting wave 上限做成一个可交互训练工具？",
      "一个学生共创模块需要写清楚哪些使用说明？",
      "如何把我的学习痛点转成可上传到共创工坊的 Demo？",
    ];
  }
  if (search.from === "submit") {
    return [
      "这条预检提示说明我哪里需要改？",
      "为什么分拣成本表要等在线仿真之后再确认？",
      "提交前我应该检查哪些必交文件？",
      "仿真任务排队时，我还能先检查哪些规则？",
    ];
  }
  if (search.from === "result") {
    return [
      "为什么我的 Route 2 风险高？先解释原因，再给修改步骤。",
      "A/B 有效性判定主要看哪些证据？",
      "硬约束通过但分数不高，通常是什么原因？",
      "下一轮修改应该先改分拣还是配送？",
    ];
  }
  if (search.concept === "sorting_cost") {
    return [
      "分拣成本为什么和仿真完成时间相关？",
      "总分拣时间为什么要向上取整？",
      "分拣效率和人工成本之间怎么平衡？",
      "如何检查成本表里的 worker-hours 是否合理？",
    ];
  }
  if (Number(search.week) === 8) {
    return [
      "为什么 sorting wave 不能超过 80 个笼车？",
      "帮我拆解本周仓内分拣作业步骤。",
      "笼车装载不合理会影响哪些结果？",
      "Week 8 的文件提交和 AI 批改流程是什么？",
    ];
  }
  return [
    "Wafia Bakery 案例里，仓内分拣和配送为什么要联动考虑？",
    "如何判断一个方案是否只是可行但质量不高？",
    "课程里的 AI 批改报告应该怎么看？",
    "我应该怎样用 Vibe Coding 辅助本课程学习？",
  ];
}

function makeMockAnswer(question: string, mode: AgentMode, context: ReturnType<typeof buildContext>) {
  const prefix = {
    qa: "可以先把概念放回课程场景里看：",
    coach: "我会按“理解任务、检查约束、形成方案、验证修改”的顺序拆：",
    rules: "从规则校验角度看，关键是把硬约束和质量评价分开：",
    vibe: "如果把它做成 Vibe Coding 共创模块，可以这样拆：",
  }[mode];
  if (mode === "vibe") {
    return `${prefix}先定义一个最小可用版本，例如输入 wave 数和每个 wave 的 carts 数，页面实时高亮超过 80 的位置；再补动画、说明文案和示例数据；最后上传到共创工坊，标注适用 Week、痛点和使用方式。当前上下文是「${context.label}」。`;
  }
  if (/80|wave|笼车/.test(question)) {
    return `${prefix}sorting wave 的 80 carts 上限是硬约束，先保证每个 wave 不超限，再讨论效率和成本。你可以检查每个 wave 的 carts 汇总、异常峰值和是否有订单被错误合并。当前上下文是「${context.label}」。`;
  }
  if (/成本|时间|worker/i.test(question)) {
    return `${prefix}分拣成本不能只看 Excel 公式，还要看仿真输出的总分拣时间。课程规则里通常需要把总时间向上取整，再计算 worker-hours，所以仿真结果、成本表和说明文档要保持一致。`;
  }
  if (/Route|路线|配送|发车/.test(question)) {
    return `${prefix}配送问题要检查三件事：路线是否覆盖所有门店，发车时间是否晚于相关分拣完成时间，司机工时和时间窗是否满足要求。建议先定位风险路线，再调整发车或车辆复用。`;
  }
  return `${prefix}先确认当前任务目标，再列出必须满足的硬约束，最后用仿真结果和 AI 批改反馈判断修改优先级。当前上下文是「${context.label}」，你可以继续追问某一条规则、一个文件位置或一条修改建议。`;
}
