import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, GraduationCap, UserCog, ArrowRight } from "lucide-react";
import { setState, type Role } from "@/lib/demo-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI 辅助物流配送教学平台" },
      { name: "description", content: "面向 Wafia Bakery 案例，整合仓内分拣、配送路径规划、在线仿真验证与 AI 智能批改的教学 Demo" },
    ],
  }),
  component: Login,
});

const FLOW = [
  { t: "案例学习", d: "理解 Wafia Bakery 门店、订单和配送业务背景" },
  { t: "分拣任务", d: "设计 sorting wave、笼车分配和拣选人员安排" },
  { t: "配送路径", d: "设计车辆路线、到达时间和配送成本" },
  { t: "综合协同", d: "判断配送车辆是否能在对应货物分拣完成后发车" },
  { t: "文件提交", d: "上传 Excel、Python、报告与成本表" },
  { t: "在线仿真", d: "调用 BS 架构仿真能力验证分拣方案" },
  { t: "AI 批改", d: "自动识别格式、规则、仿真和成本问题" },
  { t: "教师复核", d: "教师确认评分、查看共性错误调整教学" },
];

function Login() {
  const [role, setRole] = useState<Role>("student");
  const [username, setUsername] = useState("");
  const router = useRouter();

  const enter = () => {
    setState({ role, username: username || (role === "teacher" ? "王老师" : "李同学") });
    router.navigate({ to: role === "teacher" ? "/teacher" : "/student" });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(ellipse at top, var(--primary-glow), transparent 60%)" }} />
      <div className="relative mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              清华 MEM · Wafia Bakery 课程 Demo
            </div>
            <h1 className="text-5xl font-bold leading-tight tracking-tight">
              AI 辅助<br />
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-hero)" }}>
                物流配送教学平台
              </span>
            </h1>
            <p className="mt-6 max-w-md text-base text-muted-foreground">
              面向 Wafia Bakery 案例，整合仓内分拣、配送路径规划、在线仿真验证与 AI 智能批改的教学 Demo。
            </p>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              学生在平台完成案例学习、任务设计、文件提交与在线仿真；教师查看班级表现、复核 AI 批改结果，基于真实错误调整教学重点。
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-8 shadow-xl" style={{ boxShadow: "var(--shadow-soft)" }}>
            <h2 className="text-xl font-semibold">登录平台</h2>
            <p className="mt-1 text-sm text-muted-foreground">选择角色，立即进入演示</p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {([
                { v: "student", icon: GraduationCap, label: "学生", desc: "学习与任务" },
                { v: "teacher", icon: UserCog, label: "教师", desc: "看板与复核" },
              ] as const).map((opt) => {
                const Icon = opt.icon;
                const active = role === opt.v;
                return (
                  <button
                    key={opt.v}
                    onClick={() => setRole(opt.v)}
                    className={`rounded-xl border p-4 text-left transition-all ${active ? "border-primary bg-accent" : "hover:border-primary/40"}`}
                  >
                    <Icon className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                    <div className="mt-2 font-medium">{opt.label}</div>
                    <div className="text-xs text-muted-foreground">{opt.desc}</div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 space-y-3">
              <label className="block">
                <span className="text-sm font-medium">姓名 / 账号</span>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={role === "teacher" ? "如：王老师" : "如：李同学"}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium">密码</span>
                <input type="password" placeholder="演示环境任意输入" className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
              </label>
            </div>

            <button
              onClick={enter}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium text-primary-foreground transition-all hover:opacity-90"
              style={{ background: "var(--gradient-hero)" }}
            >
              进入平台 <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Process flow */}
        <div className="mt-16 rounded-2xl border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">核心流程</h3>
            <span className="text-xs text-muted-foreground">学生路径 · 教师路径在最后一步</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {FLOW.map((s, i) => (
              <div key={s.t} className="rounded-xl border bg-background/50 p-3">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{i + 1}</span>
                  步骤
                </div>
                <div className="mt-1 text-sm font-semibold">{s.t}</div>
                <div className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
