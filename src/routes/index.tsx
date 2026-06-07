import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, GraduationCap, UserCog, ArrowRight } from "lucide-react";
import { setState, type Role } from "@/lib/demo-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI 配送管理教学平台" },
      { name: "description", content: "学—练—战—评—改 一站式智能教学闭环" },
    ],
  }),
  component: Login,
});

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
      <div className="relative mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center gap-12 px-6 py-16 lg:grid-cols-2">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            清华 MEM · TRAE AI 出品
          </div>
          <h1 className="text-5xl font-bold leading-tight tracking-tight">
            基于人工智能的<br />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-hero)" }}>
              配送管理闯关式
            </span><br />教学平台
          </h1>
          <p className="mt-6 max-w-md text-lg text-muted-foreground">
            从「学—练—战—评—改」到 AI 私人订制讲解，一站式打通项目式学习的智能教学闭环。
          </p>
          <div className="mt-8 grid max-w-md grid-cols-2 gap-4 text-sm">
            {[
              ["三关闯关", "概念→设计→实战"],
              ["四维评分", "代码·格式·仿真·协调"],
              ["AI 视频", "v1 通用 + v2 定制"],
              ["教师看板", "学情·复核·变量注入"],
            ].map(([t, d]) => (
              <div key={t} className="rounded-lg border bg-card p-3">
                <div className="text-sm font-semibold">{t}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{d}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-8 shadow-xl" style={{ boxShadow: "var(--shadow-soft)" }}>
          <h2 className="text-xl font-semibold">登录平台</h2>
          <p className="mt-1 text-sm text-muted-foreground">选择角色，立即进入演示</p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {([
              { v: "student", icon: GraduationCap, label: "学生", desc: "学习与闯关" },
              { v: "teacher", icon: UserCog, label: "教师", desc: "管理与复核" },
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
    </div>
  );
}
