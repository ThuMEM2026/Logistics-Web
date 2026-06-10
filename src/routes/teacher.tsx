import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/teacher")({ component: TeacherLayout });

function TeacherLayout() {
  return (
    <AppShell
      nav={[
        { to: "/teacher", label: "学情看板" },
        { to: "/teacher/cases", label: "案例管理" },
        { to: "/teacher/variables", label: "变量注入" },
        { to: "/teacher/review", label: "AI 复核" },
        { to: "/teacher/rules", label: "评分规则" },
      ]}
    >
      <Outlet />
    </AppShell>
  );
}
