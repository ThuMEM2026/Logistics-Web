import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ClipboardList,
  Gamepad2,
  GraduationCap,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { DemoBoundaryNote, V2Shell, v2Nav } from "@/components/V2Shell";

export const Route = createFileRoute("/v2/")({
  head: () => ({
    meta: [
      { title: "智慧物流 v2 · 分拣 PBL 学习样板" },
      {
        name: "description",
        content:
          "面包工坊分拣 PBL 样板 Demo：先做任务、暴露问题、AI 提问训练、补知识、改方案、教师复核。",
      },
    ],
  }),
  component: V2Home,
});

function V2Home() {
  return (
    <V2Shell nav={v2Nav}>
      <section className="overflow-hidden rounded-3xl border bg-card" style={{ boxShadow: "var(--shadow-soft)" }}>
        <div className="grid grid-cols-1 gap-8 p-8 lg:grid-cols-[1.15fr_0.85fr] lg:p-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> 新需求展示版 · 不影响旧版 Demo
            </div>
            <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-tight md:text-5xl">
              不是重做课程网站，而是展示 AI 时代的分拣 PBL 学习闭环
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
              v2 聚焦面包工坊销售物流中的分拣模块。学生前两周先通过轻量互动进入真实任务，再由系统反馈暴露问题，
              AI 助教训练提问与上下文表达，最后进入正式方案修改和教师过程复核。
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="/v2/student"
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground"
                style={{ background: "var(--gradient-hero)" }}
              >
                进入学生端开业夜 <ArrowRight className="h-4 w-4" />
              </a>
              <a href="/v2/teacher" className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold hover:border-primary">
                查看教师过程证据 <LayoutDashboard className="h-4 w-4" />
              </a>
              <a href="/" className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
                回到 v1 旧版 Demo
              </a>
            </div>
          </div>

          <div className="rounded-3xl border bg-secondary/50 p-5">
            <div className="text-sm font-semibold">v1 / v2 关系</div>
            <div className="mt-4 space-y-3">
              {[
                ["v1 保留", "继续展示课程周历、Week 8、提交预检、AI 批改、教师复核。"],
                ["v2 新增", "专门展示“先做 - 反馈 - AI 提问 - 改方案”的新教学逻辑。"],
                ["边界清楚", "首版只承诺前端 Demo，不承诺真实后端、完整 RAG 或完整配送主体。"],
              ].map(([title, text]) => (
                <div key={title} className="rounded-2xl border bg-card p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <CheckCircle2 className="h-4 w-4 text-success" /> {title}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          { icon: Gamepad2, title: "前两周冷启动", text: "用开业夜分拣运营指挥台降低门槛，让本科生先觉得能上手。" },
          { icon: ClipboardList, title: "真实分拣任务", text: "围绕订单、波次、笼车、人手和配送缓冲做决策。" },
          { icon: Bot, title: "AI 提问教练", text: "训练学生补充背景、目标、约束、已有尝试，而不是直接要答案。" },
          { icon: ShieldCheck, title: "过程性评价", text: "教师端看尝试、错误、提问、修改和提交，不只看最终答案。" },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-2xl border bg-card p-5">
            <Icon className="h-5 w-5 text-primary" />
            <div className="mt-3 text-sm font-semibold">{title}</div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{text}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border bg-card p-6">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <GraduationCap className="h-4 w-4 text-primary" /> v2 最小演示闭环
          </div>
          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
            {[
              "学生进入“面包工坊开业夜分拣指挥台”",
              "先配置目标、人手、wave、识别方式、异常件旁路和发车策略",
              "系统反馈准时率、人工成本、准确率、wave carts、配送缓冲",
              "AI 助教引导学生把问题问清楚",
              "学生根据反馈修改方案，教师查看过程证据",
            ].map((item, index) => (
              <div key={item} className="flex gap-3 rounded-xl bg-secondary/50 p-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {index + 1}
                </div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
        <DemoBoundaryNote />
      </section>
    </V2Shell>
  );
}
