import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Circle, Play, ArrowRight, BookOpen } from "lucide-react";
import { useStore } from "@/lib/demo-store";

export const Route = createFileRoute("/student/")({ component: CasesPage });

const statusMap = {
  not_started: { label: "未开始", color: "text-muted-foreground", icon: Circle },
  in_progress: { label: "进行中", color: "text-primary", icon: Play },
  completed: { label: "已完成", color: "text-success", icon: CheckCircle2 },
} as const;

const TASKS = [
  { w: "Week 12", t: "分拣作业" },
  { w: "Week 13", t: "配送路径作业" },
  { w: "Week 14", t: "分拣配送综合作业" },
];

function CasesPage() {
  const cases = useStore((s) => s.cases);
  const main = cases.find((c) => c.id === "wafia")!;
  const others = cases.filter((c) => c.id !== "wafia");
  const s = statusMap[main.status];
  const Icon = s.icon;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">课程案例</h1>
        <p className="mt-1 text-muted-foreground">本课主案例：Wafia Bakery 分拣配送综合优化</p>
      </div>

      {/* Main Wafia card */}
      <div className="overflow-hidden rounded-2xl border bg-card shadow-xl" style={{ boxShadow: "var(--shadow-soft)" }}>
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr]">
          <div className="p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl text-3xl" style={{ background: "var(--gradient-card)" }}>{main.cover}</div>
              <span className={`inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs ${s.color}`}>
                <Icon className="h-3.5 w-3.5" /> {s.label}
              </span>
              <span className="rounded-md bg-accent px-2 py-0.5 text-xs text-accent-foreground">主案例</span>
            </div>
            <h2 className="mt-4 text-2xl font-bold">{main.name}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{main.description}</p>
            <div className="mt-4 flex flex-wrap gap-1.5 text-xs">
              {["仓内分拣", "VRP", "物流笼车", "在线仿真", "AI 批改"].map((t) => (
                <span key={t} className="rounded-full bg-secondary px-2 py-0.5">{t}</span>
              ))}
            </div>
            <Link
              to="/student/learn"
              className="mt-6 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-primary-foreground"
              style={{ background: "var(--gradient-hero)" }}
            >
              进入 Wafia Bakery 任务 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="border-t bg-background/40 p-8 lg:border-l lg:border-t-0">
            <div className="text-sm font-semibold">课程任务结构</div>
            <div className="mt-4 space-y-2">
              {TASKS.map((t, i) => (
                <div key={t.w} className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5 text-sm">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</span>
                  <div>
                    <div className="font-medium">{t.w}</div>
                    <div className="text-xs text-muted-foreground">{t.t}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Extended cases */}
      <div className="mt-8 mb-3 text-sm font-semibold text-muted-foreground">扩展案例</div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {others.map((c) => {
          const ss = statusMap[c.status];
          const IIcon = ss.icon;
          return (
            <div key={c.id} className="rounded-2xl border bg-card p-5 opacity-90 transition-all hover:opacity-100">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl" style={{ background: "var(--gradient-card)" }}>{c.cover}</div>
                <span className={`inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs ${ss.color}`}>
                  <IIcon className="h-3.5 w-3.5" /> {ss.label}
                </span>
              </div>
              <h3 className="mt-3 text-base font-semibold">{c.name}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
              <Link to="/student/learn" className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline">
                <BookOpen className="h-4 w-4" /> 查看
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
