import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Sparkles, GraduationCap, UserCog, ArrowRight, Calendar, Boxes, Users } from "lucide-react";
import { setState, type Role } from "@/lib/demo-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "智慧物流系统设计 · AI 教学闭环平台" },
      {
        name: "description",
        content:
          "面向清华本科生的《智慧物流系统设计》教学平台：基于 Facilities Planning & Material Handling 课程基础，以 Wafia Bakery 仓内分拣为当前专题。",
      },
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
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: "var(--gradient-hero)" }}
            >
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            智慧物流系统设计
          </div>
          <div className="text-xs text-muted-foreground">AI+物流网络规划课程教学闭环平台</div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-2xl border bg-card p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> 当前专题 · Wafia Bakery 仓内分拣
              </div>
              <h1 className="mt-3 text-2xl font-bold leading-tight md:text-3xl">
                《智慧物流系统设计》：先完成一轮方案，再把问题问清楚
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                面向清华各书院本科生，以{" "}
                <b className="text-foreground">
                  Facilities Planning & Material Handling（设施规划与物料搬运）
                </b>{" "}
                为课程基础。平台围绕 Wafia Bakery 案例按 14
                周推进：先尝试、再提问、补充学习、验证并修改方案。
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => enter("student")}
                className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-primary-foreground"
                style={{ background: "var(--gradient-hero)" }}
              >
                <GraduationCap className="h-4 w-4" /> 学生入口 <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => enter("teacher")}
                className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:border-primary"
              >
                <UserCog className="h-4 w-4" /> 教师入口
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            {
              Icon: Calendar,
              t: "课程历程",
              d: "14 个教学周完整可访问；当前 Week 8 已进入真实任务。",
            },
            {
              Icon: Boxes,
              t: "先做一轮分拣方案",
              d: "从任务约束出发，再使用预检、仿真和 AI 反馈修正方案。",
            },
            { Icon: Users, t: "教师看过程", d: "学生的尝试、仿真和复盘构成可讨论的学习证据。" },
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
              清华 MEM 项目组与<b>蔡临宁老师</b>
              围绕本科《智慧物流系统设计》开展共创优化；该课程建立在 <b>设施规划与物料搬运</b>{" "}
              的知识基础上。当前以 <b>Wafia Bakery</b> 的<b className="text-primary"> 仓内分拣 </b>
              为专题，并与后续物流配送综合练习衔接。
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              本 Demo 状态约定
            </div>
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
