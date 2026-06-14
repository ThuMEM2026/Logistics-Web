import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { ReactNode, useEffect } from "react";
import { GraduationCap, LogOut, Sparkles, UserCog } from "lucide-react";
import { resetState, setState, useStore, type Role } from "@/lib/demo-store";

export function AppShell({ children, nav, role: layoutRole }: { children: ReactNode; nav: { to: string; label: string }[]; role: Role }) {
  const role = useStore((s) => s.role);
  const username = useStore((s) => s.username);
  const router = useRouter();
  const path = useRouterState({ select: (s) => s.location.pathname });

  // Ensure identity matches the current layout (handles direct nav or stale state)
  useEffect(() => {
    if (role !== layoutRole) {
      setState({ role: layoutRole, username: layoutRole === "teacher" ? "王老师" : "李同学" });
    }
  }, [layoutRole, role]);

  const displayRole = layoutRole;
  const displayName = role === layoutRole && username ? username : layoutRole === "teacher" ? "王老师" : "李同学";
  const RoleIcon = displayRole === "teacher" ? UserCog : GraduationCap;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: "var(--gradient-hero)" }}>
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-base">物流网络规划 · 课程平台</span>
          </Link>
          <nav className="flex flex-1 items-center gap-1">
            {nav.map((n) => {
              const active = path === n.to || (n.to !== "/" && path.startsWith(n.to));
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`rounded-md px-3 py-1.5 text-sm transition-colors ${active ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5">
              <RoleIcon className="h-4 w-4 text-primary" />
              <span className="font-medium">{displayName}</span>
              <span className="text-xs text-muted-foreground">{displayRole === "teacher" ? "教师" : "学生"}</span>
            </div>
            <button
              onClick={() => { resetState(); router.navigate({ to: "/" }); }}
              className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <LogOut className="h-4 w-4" /> 退出
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
