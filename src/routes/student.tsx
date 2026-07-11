import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/student")({ component: StudentLayout });

function StudentLayout() {
  return (
    <AppShell
      role="student"
      nav={[
        { to: "/student", label: "课程周历" },
        { to: "/student/assistant", label: "AI 助教" },
        { to: "/student/workshop", label: "共创工坊" },
        { to: "/student/cases", label: "案例库" },
        { to: "/student/submissions", label: "我的提交" },
      ]}
    >
      <Outlet />
    </AppShell>
  );
}
