import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bot,
  CheckCircle2,
  Code2,
  FileQuestion,
  GraduationCap,
  Lightbulb,
  MessageSquareText,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { DemoBoundaryNote, V2Shell, v2Nav } from "@/components/V2Shell";

export const Route = createFileRoute("/v2/student/assistant")({
  head: () => ({
    meta: [
      { title: "v2 AI 提问教练 · 分拣 PBL" },
      { name: "description", content: "训练学生把业务背景、目标、约束和已有尝试组织成高质量 AI 提问。" },
    ],
  }),
  component: V2AssistantPage,
});

type Mode = "ask" | "coach" | "rules" | "qa" | "vibe";
type Message = { role: "assistant" | "user"; text: string };

const modes: Record<Mode, { label: string; desc: string; icon: typeof Bot }> = {
  ask: { label: "提问教练", desc: "把模糊问题改写成可问 AI 的清楚问题", icon: FileQuestion },
  coach: { label: "任务教练", desc: "拆解分拣任务步骤，不直接代写方案", icon: Lightbulb },
  rules: { label: "规则解释", desc: "解释 wave、笼车、错分、配送缓冲等规则", icon: ShieldCheck },
  qa: { label: "课程问答", desc: "解释物流概念和课程知识点", icon: GraduationCap },
  vibe: { label: "Vibe Coding", desc: "把学习痛点转成可实现的小工具", icon: Code2 },
};

function V2AssistantPage() {
  const [mode, setMode] = useState<Mode>("ask");
  const [input, setInput] = useState("为什么我这个分拣方案不太好？");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text:
        "我是 v2 的 AI 提问教练。这里不会直接替你写最终答案，而是帮你把业务背景、目标、约束、已有尝试和具体请求说清楚。",
    },
  ]);

  const suggestions = useMemo(() => buildSuggestions(mode), [mode]);
  const quality = scoreQuestion(input);

  const send = (text = input) => {
    const q = text.trim();
    if (!q) return;
    setMessages((prev) => [...prev, { role: "user", text: q }, { role: "assistant", text: makeAnswer(q, mode) }]);
    setInput("");
  };

  const optimizedPrompt = optimizePrompt(input);

  return (
    <V2Shell role="student" nav={v2Nav}>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[330px_1fr_340px]">
        <aside className="space-y-4">
          <div className="rounded-3xl border bg-card p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Bot className="h-4 w-4 text-primary" /> AI 助教模式
            </div>
            <div className="mt-4 space-y-2">
              {(Object.keys(modes) as Mode[]).map((key) => {
                const item = modes[key];
                const Icon = item.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setMode(key)}
                    className={`w-full rounded-2xl border p-3 text-left transition-all ${
                      mode === key ? "border-primary bg-accent" : "bg-background/40 hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Icon className="h-4 w-4 text-primary" /> {item.label}
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border bg-card p-5">
            <div className="text-sm font-semibold">当前上下文</div>
            <div className="mt-3 rounded-2xl bg-secondary p-3 text-sm">
              <div className="font-semibold">面包工坊开业夜 · 分拣 PBL</div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                任务涉及订单高峰、sorting wave、80 carts 上限、分拣人手、错分率、人工成本和配送缓冲。
              </p>
            </div>
          </div>

          <DemoBoundaryNote />
        </aside>

        <main className="space-y-4">
          <section className="rounded-3xl border bg-card p-6" style={{ boxShadow: "var(--shadow-soft)" }}>
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <Sparkles className="h-4 w-4" /> 对应蔡老师考试改革：先拆题，再问 AI
            </div>
            <h1 className="mt-3 text-3xl font-bold">AI 提问教练</h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              学生可以使用大模型，但不能把题目或任务直接“丢给 AI”。这里训练的是：
              自己先读题、拆解业务、压缩上下文，再向 AI 提出一个可判断、可改进的问题。
            </p>
          </section>

          <section className="rounded-3xl border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <MessageSquareText className="h-4 w-4 text-primary" /> 推荐问题
              </div>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">{modes[mode].label}</span>
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {suggestions.map((item) => (
                <button
                  key={item}
                  onClick={() => send(item)}
                  className="rounded-2xl border bg-background/40 p-3 text-left text-sm leading-relaxed transition-all hover:border-primary hover:bg-accent"
                >
                  {item}
                </button>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-3xl border bg-card">
            <div className="border-b bg-secondary/60 px-5 py-3 text-sm font-semibold">多轮问答 · 提问训练</div>
            <div className="max-h-[460px] space-y-4 overflow-y-auto p-5">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[84%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t p-4">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") send();
                  }}
                  placeholder="试着描述你的问题：背景、目标、约束、已有尝试、希望 AI 帮什么"
                  className="min-w-0 flex-1 rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <button
                  onClick={() => send()}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground"
                  style={{ background: "var(--gradient-hero)" }}
                >
                  <Send className="h-4 w-4" /> 发送
                </button>
              </div>
            </div>
          </section>
        </main>

        <aside className="space-y-4">
          <div className="rounded-3xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">问题质量分</div>
              <div className="text-2xl font-bold text-primary">{quality.total}/5</div>
            </div>
            <div className="mt-4 space-y-2">
              {quality.items.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-xl bg-secondary/60 px-3 py-2 text-sm">
                  <span>{item.label}</span>
                  {item.ok ? <CheckCircle2 className="h-4 w-4 text-success" /> : <span className="text-xs text-muted-foreground">待补</span>}
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              这个分数不是正式成绩，只用于提醒学生：好问题应该包含背景、目标、约束、已有尝试和具体请求。
            </p>
          </div>

          <div className="rounded-3xl border bg-card p-5">
            <div className="text-sm font-semibold">把你的问题改写成这样</div>
            <div className="mt-3 rounded-2xl border bg-secondary/50 p-3 text-sm leading-relaxed text-muted-foreground">
              {optimizedPrompt}
            </div>
            <button
              onClick={() => setInput(optimizedPrompt)}
              className="mt-3 w-full rounded-xl border px-3 py-2 text-sm font-semibold hover:border-primary"
            >
              使用这个提问模板
            </button>
          </div>

          <div className="rounded-3xl border bg-card p-5">
            <div className="text-sm font-semibold">教师端会看到什么</div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>• 学生是否先描述了业务背景</li>
              <li>• 是否明确目标和约束</li>
              <li>• 是否说明已有尝试</li>
              <li>• 是否能判断 AI 输出，而不是照抄</li>
            </ul>
          </div>
        </aside>
      </div>
    </V2Shell>
  );
}

function buildSuggestions(mode: Mode) {
  if (mode === "ask") {
    return [
      "我只知道方案不好，但不知道怎么向 AI 描述，请帮我改写问题。",
      "给我一个包含背景、目标、约束、已有尝试的分拣提问模板。",
      "如果考试题是 160 家洗衣门店集中分配，我第一步应该问哪些问题？",
      "如何判断 AI 给出的分拣方案是否可靠？",
    ];
  }
  if (mode === "coach") {
    return [
      "我应该先看订单、wave，还是先看人手配置？",
      "我的目标是准时率优先，应该如何调整分拣策略？",
      "配送缓冲不足时，我该先改分拣还是配送？",
      "如何从小游戏结果过渡到正式分拣任务？",
    ];
  }
  if (mode === "rules") {
    return [
      "为什么 sorting wave 不能超过 80 carts？",
      "错分率和漏件分别反映什么运营问题？",
      "人工成本和分拣完成时间怎么权衡？",
      "分拣完成时间为什么会影响配送发车？",
    ];
  }
  if (mode === "vibe") {
    return [
      "我能用 AI 做一个 wave 上限检查器吗？",
      "如何做一个笼车装载可视化小工具？",
      "怎样把真实洗衣门店案例做成课堂小游戏？",
      "共创工坊提交一个小工具需要说明什么？",
    ];
  }
  return [
    "Wafia Bakery 案例里，分拣和配送为什么要联动考虑？",
    "什么是 PBL 学习？为什么要先做再学？",
    "AI 助教和 AI 批改有什么区别？",
    "真实企业案例进入课程时为什么要先脱敏？",
  ];
}

function scoreQuestion(input: string) {
  const text = input.toLowerCase();
  const items = [
    { label: "背景", ok: /面包|工坊|门店|订单|洗衣|企业|业务|场景/.test(text) },
    { label: "目标", ok: /目标|准时|成本|效率|降低|提高|优化/.test(text) },
    { label: "约束", ok: /约束|80|wave|carts|人手|时间窗|缓冲|资源/.test(text) },
    { label: "已有尝试", ok: /我已|已经|尝试|配置|选择|方案|当前/.test(text) },
    { label: "具体请求", ok: /请|帮我|如何|为什么|判断|改写|解释/.test(text) },
  ];
  return { items, total: items.filter((item) => item.ok).length };
}

function optimizePrompt(input: string) {
  const base = input.trim() || "我的分拣方案不太好";
  return `背景：我正在做面包工坊开业夜的分拣任务，需要把多门店订单按 sorting wave 和笼车约束处理。\n目标：我希望在保证准时率的同时控制人工成本和错分率。\n约束：每个 sorting wave 不能超过 80 carts，人手有限，分拣完成时间会影响配送缓冲。\n已有尝试：${base}。\n请求：请先指出我可能忽略的约束，再给出 2-3 个修改方向，并说明如何判断修改后是否更合理。`;
}

function makeAnswer(question: string, mode: Mode) {
  if (mode === "ask") {
    return `可以。你现在的问题还偏模糊，建议补四类信息：业务背景、优化目标、硬约束、已有尝试。改写后不要问“答案是什么”，而要问“我可能忽略了哪些约束、如何判断方案更合理”。`;
  }
  if (/80|wave|carts/i.test(question)) {
    return "80 carts 是硬约束，首要任务是保证每个 wave 不超限；如果超限，后面的成本、准时率再好也不能算有效方案。你可以先拆 wave，再看人手和配送缓冲。";
  }
  if (/洗衣|160|门店/.test(question)) {
    return "这个真实案例适合做作业或考试题。第一步不是直接让 AI 设计方案，而是先问：门店位置、日均订单、收发频次、厂房布局、分拣规则、配送时间窗、当前瓶颈和可脱敏边界。";
  }
  if (mode === "vibe") {
    return "可以先做最小工具：输入每个 wave 的 carts 数，自动高亮超过 80 的波次；再加成本估算和配送缓冲提醒。这样既能服务学习，也能作为共创工坊提交物。";
  }
  return "建议按三步处理：先列硬约束，再看运营指标，最后决定修改优先级。不要只追求一个分数，而要能解释为什么这个方案更稳、更便宜或更准时。";
}
