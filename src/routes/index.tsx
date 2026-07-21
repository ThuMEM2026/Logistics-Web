import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Sparkles, GraduationCap, UserCog, ArrowRight, Calendar, Boxes, Users, Rocket } from "lucide-react";
import { setState, type Role } from "@/lib/demo-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI+ 物流网络规划课程平台" },
      { name: "description", content: "清华 MEM × 蔡临宁老师 共创的本科《物流网络规划》课程平台：教学周历驱动 + Vibe Coding 共创工坊。" },
    ],
  }),
  component: Entry,
});

function Entry() {
  const router = useRouter();
  const enter = (role: Role) => {
    setState({ role, username: role === "teacher" ? "王老师" : "李同学" });
    router.navigate({ to: role === "teacher" ? "/teacher" : "/student" });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/70 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "var(--gradient-hero)" }}>
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            AI+ 物流网络规划课程平台
          </div>
          <div className="text-xs text-muted-foreground">清华 MEM · 蔡临宁老师 · 课程共创版本</div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-2xl border bg-card p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> 教学周驱动 · Vibe Coding 共创
              </div>
              <h1 className="mt-3 text-2xl font-bold leading-tight md:text-3xl">
                面向本科生的《物流网络规划》课程平台
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                本平台围绕 Wafia Bakery 案例，按 14 个教学周组织内容；当前重点为 <b className="text-foreground">仓内分拣方向</b>，并保留与物流配送方向的衔接，最终在 Week 12–14 形成分拣配送一体化综合练习。
              </p>
            </div>
            <div className="flex gap-2">
              <a
                href="/v2"
                className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:border-primary"
              >
                <Rocket className="h-4 w-4" /> v2 新需求 Demo
              </a>
              <button onClick={() => enter("student")} className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-primary-foreground" style={{ background: "var(--gradient-hero)" }}>
                <GraduationCap className="h-4 w-4" /> 学生入口 <ArrowRight className="h-4 w-4" />
              </button>
              <button onClick={() => enter("teacher")} className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:border-primary">
                <UserCog className="h-4 w-4" /> 教师入口
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { Icon: Calendar, t: "课程周历", d: "14 个教学周卡片，状态可视；首页直接进入「当前周」开展学习。" },
            { Icon: Boxes, t: "Week 8 重点周", d: "仓内分拣专项练习：文件预检 · 在线仿真 · AI 批改 · 共创推荐。" },
            { Icon: Users, t: "Vibe Coding 共创工坊", d: "学生上传自制教学动画、训练工具与 Prompt，教师审核后回流到课程周。" },
          ].map(({ Icon, t, d }) => (
            <div key={t} className="rounded-2xl border bg-card p-5">
              <Icon className="h-5 w-5 text-primary" />
              <div className="mt-2 text-sm font-semibold">{t}</div>
              <div className="mt-1 text-xs leading-relaxed text-muted-foreground">{d}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">项目背景</div>
            <p className="mt-2 text-sm leading-relaxed">
              清华 MEM 硕士项目组与<b>蔡临宁老师</b>共同围绕本科《物流网络规划》课程开展共创优化。课程聚焦 <b>Wafia Bakery</b> 案例，结合 AI 与 Vibe Coding 教学，包含
              <b className="text-primary"> 仓内分拣 </b>与<b className="text-chart-2"> 物流配送 </b>两个相互衔接的子方向；本组当前重点聚焦仓内分拣方向。
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">本 Demo 状态约定</div>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>• 当前进度：Week 8（仓内分拣专项练习）</li>
              <li>• 已完成：Week 1–7；可回顾</li>
              <li>• 未开放：Week 9–14，可预览课程结构</li>
              <li>• 所有数据均为前端模拟，不依赖真实后端</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
