import { ReactNode, useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Bot, GraduationCap, LayoutDashboard, LogOut, Sparkles, UserCog } from "lucide-react";
import { setState, type Role } from "@/lib/demo-store";

type V2NavItem = {
  to: string;
  label: string;
};

export function V2Shell({
  children,
  role,
  nav,
}: {
  children: ReactNode;
  role?: Role;
  nav?: V2NavItem[];
}) {
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (role) {
      setState({ role, username: role === "teacher" ? "蔡老师" : "本科体验学生" });
    }
  }, [role]);

  const displayRole = role === "teacher" ? "教师端" : role === "student" ? "学生端" : "新版 Demo";
  const RoleIcon = role === "teacher" ? UserCog : role === "student" ? GraduationCap : Sparkles;

  const items =
    nav ??
    [
      { to: "/v2", label: "v2 首页" },
      { to: "/v2/student", label: "学生体验" },
      { to: "/v2/student/assistant", label: "AI 提问教练" },
      { to: "/v2/teacher", label: "教师过程证据" },
    ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-card/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-5 px-6">
          <Link to="/v2" className="flex items-center gap-2 font-semibold">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "var(--gradient-hero)" }}>
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="text-base leading-none">智慧物流 v2</div>
              <div className="mt-1 text-[11px] font-normal text-muted-foreground">分拣 PBL 学习样板</div>
            </div>
          </Link>

          <nav className="flex flex-1 items-center gap-1">
            {items.map((item) => {
              const active = path === item.to;
              return (
                <a
                  key={item.to}
                  href={item.to}
                  className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                    active ? "bg-accent font-medium text-accent-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 rounded-full border bg-secondary px-3 py-1.5 text-sm md:flex">
            <RoleIcon className="h-4 w-4 text-primary" />
            <span className="font-medium">{displayRole}</span>
          </div>
          <a
            href="/"
            className="hidden items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground md:flex"
          >
            <LogOut className="h-4 w-4" /> 返回 v1
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}

export const v2Nav = [
  { to: "/v2", label: "v2 首页" },
  { to: "/v2/student", label: "开业夜指挥台" },
  { to: "/v2/student/assistant", label: "AI 提问教练" },
  { to: "/v2/teacher", label: "教师过程证据" },
];

export function DemoBoundaryNote() {
  return (
    <div className="rounded-2xl border border-dashed bg-secondary/40 p-4 text-sm leading-relaxed text-muted-foreground">
      <div className="mb-1 flex items-center gap-2 font-semibold text-foreground">
        <Bot className="h-4 w-4 text-primary" /> 当前展示范围
      </div>
      当前 v2 聚焦展示蔡老师最新方向下的教学闭环：学生先做运营决策，再通过 AI 提问、方案修改和教师复核形成过程证据。
      大模型知识库、仿真服务、账号权限和数据持久化可在下一阶段接入。
    </div>
  );
}
