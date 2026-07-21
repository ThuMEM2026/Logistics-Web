import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FileText,
  GraduationCap,
  MessageSquareText,
  PackageCheck,
  Sparkles,
  Truck,
  WalletCards,
} from "lucide-react";
import { OpeningNightCommandGame } from "@/components/OpeningNightCommandGame";
import { DemoBoundaryNote, V2Shell, v2Nav } from "@/components/V2Shell";
import { bakeryStores, v2FinalDemoState, type OpeningNightResult } from "@/lib/v2-demo-data";

export const Route = createFileRoute("/v2/student")({
  head: () => ({
    meta: [
      { title: "v2 学生端 · 开业夜分拣运营指挥台" },
      { name: "description", content: "学生先完成开业夜分拣运营决策，系统反馈准时率、准确率、wave 约束、配送缓冲和提问质量，再进入 AI 提问训练。" },
    ],
  }),
  component: V2StudentPage,
});

function V2StudentPage() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [latestResult, setLatestResult] = useState<OpeningNightResult | null>(null);

  if (path !== "/v2/student") {
    return <Outlet />;
  }

  const shownMetrics = latestResult
    ? {
        onTime: latestResult.onTime,
        accuracy: latestResult.accuracy,
        maxWaveCarts: latestResult.maxWave,
        deliveryBuffer: latestResult.buffer,
        laborCost: latestResult.cost,
        questionQuality: latestResult.questionQuality,
      }
    : v2FinalDemoState.finalMetrics;

  const profile = latestResult?.profile ?? v2FinalDemoState.student.ability;

  return (
    <V2Shell role="student" nav={v2Nav}>
      <div className="space-y-6">
        <section className="rounded-3xl border bg-card p-6" style={{ boxShadow: "var(--shadow-soft)" }}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" /> v2 新需求展示版 · 学生端效果
              </div>
              <h1 className="mt-3 text-3xl font-bold">开业夜分拣运营指挥台：先做一轮，再理解物流系统设计</h1>
              <p className="mt-2 max-w-4xl text-sm leading-relaxed text-muted-foreground">
                用一个轻量但完整的分拣指挥游戏，把运营目标、人手配置、wave carts、识别方式、异常件旁路、发车策略和突发订单放进同一个可视化沙盘。
                学生先看到自己的方案结果，再带着具体问题进入 AI 提问训练。
              </p>
            </div>
            <a
              href="/v2/student/assistant"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground"
              style={{ background: "var(--gradient-hero)" }}
            >
              进入 AI 提问教练 <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-6">
          <MetricCard icon={PackageCheck} label="准时率" value={`${shownMetrics.onTime}%`} />
          <MetricCard icon={CheckCircle2} label="准确率" value={`${shownMetrics.accuracy}%`} />
          <MetricCard icon={ClipboardList} label="最大 wave" value={`${shownMetrics.maxWaveCarts}`} sub="carts" />
          <MetricCard icon={Truck} label="配送缓冲" value={`${shownMetrics.deliveryBuffer}`} sub="分钟" />
          <MetricCard icon={WalletCards} label="运营成本" value={`¥${shownMetrics.laborCost}`} />
          <MetricCard icon={Bot} label="提问质量" value={`${shownMetrics.questionQuality}/5`} />
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
          <main className="space-y-6">
            <OpeningNightCommandGame onResult={setLatestResult} />

            <section className="rounded-3xl border bg-card p-6">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <FileText className="h-4 w-4 text-primary" /> 正式任务衔接：游戏结束后学生看到什么
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                {[
                  ["进入正式分拣任务", "把游戏中的目标、人手、wave、复核和发车选择迁移到正式 PBL 方案。"],
                  ["查看推荐知识点", "根据瓶颈推荐 wave 约束、资源配置、异常件处理、配送缓冲等内容。"],
                  ["带配置问 AI", "把本轮分拣配置和最大风险转成有背景、有目标、有约束的高质量问题。"],
                ].map(([title, text]) => (
                  <div key={title} className="rounded-2xl border bg-background/40 p-4">
                    <div className="text-sm font-semibold">{title}</div>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{text}</p>
                  </div>
                ))}
              </div>
            </section>
          </main>

          <aside className="space-y-4">
            <div className="rounded-3xl border bg-card p-5">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <BrainCircuit className="h-4 w-4 text-primary" /> 学生能力画像
              </div>
              <div className="mt-4 space-y-3">
                {profile.map((item) => (
                  <div key={item.label} className="rounded-2xl border bg-background/40 p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold">{item.label}</span>
                      <span className="font-mono text-primary">{item.value}</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${item.value}%` }} />
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{item.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border bg-card p-5">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <MessageSquareText className="h-4 w-4 text-primary" /> AI 提问记录样例
              </div>
              <div className="mt-4 space-y-3">
                {v2FinalDemoState.aiTranscript.map((message) => (
                  <div
                    key={message.text}
                    className={`rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                      message.role === "student" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                    }`}
                  >
                    {message.text}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border bg-card p-5">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Clock3 className="h-4 w-4 text-primary" /> 过程日志
              </div>
              <div className="mt-4 space-y-3">
                {v2FinalDemoState.processLog.map((log) => (
                  <div key={log.time} className="rounded-2xl border bg-background/40 p-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-primary">{log.time}</span>
                      <span className="font-semibold">{log.event}</span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{log.evidence}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border bg-card p-5">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <GraduationCap className="h-4 w-4 text-primary" /> 真实订单池
              </div>
              <div className="mt-4 space-y-2">
                {bakeryStores.map((store) => (
                  <div key={store.id} className="rounded-2xl bg-secondary/60 p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{store.name}</span>
                      <span className="font-mono text-primary">{store.orders} 单</span>
                    </div>
                    <div className="mt-1 text-muted-foreground">
                      {store.area} · 承诺 {store.promisedAt} · {store.temp}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DemoBoundaryNote />
          </aside>
        </section>
      </div>
    </V2Shell>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof Bot;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-bold">{value}</span>
        {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
      </div>
    </div>
  );
}
