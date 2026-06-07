import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/student")({ component: StudentLayout });

function StudentLayout() {
  return (
    <AppShell
      nav={[
        { to: "/student", label: "案例" },
        { to: "/student/learn", label: "概念学习" },
        { to: "/student/map", label: "闯关地图" },
        { to: "/student/submit", label: "方案提交" },
        { to: "/student/result", label: "AI 批改" },
      ]}
    >
      <Outlet />
    </AppShell>
  );
}
