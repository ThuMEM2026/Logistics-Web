import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Circle, Play, BookOpen } from "lucide-react";
import { useStore } from "@/lib/demo-store";

export const Route = createFileRoute("/student/")({ component: CasesPage });

const statusMap = {
  not_started: { label: "未开始", color: "text-muted-foreground", icon: Circle },
  in_progress: { label: "进行中", color: "text-primary", icon: Play },
  completed: { label: "已完成", color: "text-success", icon: CheckCircle2 },
} as const;

function CasesPage() {
  const cases = useStore((s) => s.cases);
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">学习案例</h1>
        <p className="mt-1 text-muted-foreground">从下面任选一个案例开始你的闯关之旅。</p>
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {cases.map((c) => {
          const s = statusMap[c.status];
          const Icon = s.icon;
          return (
            <div key={c.id} className="group rounded-2xl border bg-card p-6 transition-all hover:shadow-lg" style={{ boxShadow: "var(--shadow-soft)" }}>
              <div className="flex items-start justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl text-3xl" style={{ background: "var(--gradient-card)" }}>
                  {c.cover}
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs ${s.color}`}>
                  <Icon className="h-3.5 w-3.5" /> {s.label}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-semibold">{c.name}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="rounded-md bg-accent px-2 py-0.5 text-xs text-accent-foreground">{c.difficulty}</span>
                <Link to="/student/learn" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                  <BookOpen className="h-4 w-4" /> 进入学习
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
