import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Circle, Play, BookOpen } from "lucide-react";
import { useStore } from "@/lib/demo-store";

export const Route = createFileRoute("/student/cases")({ component: CasesPage });

const statusMap = {
  not_started: { label: "未开始", color: "text-muted-foreground", icon: Circle },
  in_progress: { label: "进行中", color: "text-primary", icon: Play },
  completed:   { label: "已完成", color: "text-success", icon: CheckCircle2 },
} as const;

function CasesPage() {
  const cases = useStore((s) => s.cases);
  const main = cases.find((c) => c.id === "wafia")!;
  const others = cases.filter((c) => c.id !== "wafia");
  const s = statusMap[main.status];
  const Icon = s.icon;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">案例库</h1>
        <p className="mt-1 text-sm text-muted-foreground">主案例：Wafia Bakery 分拣配送综合优化；扩展案例可作为练习与拓展阅读。</p>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card" style={{ boxShadow: "var(--shadow-soft)" }}>
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr]">
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl" style={{ background: "var(--gradient-card)" }}>{main.cover}</div>
              <span className={`inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs ${s.color}`}>
                <Icon className="h-3.5 w-3.5" /> {s.label}
              </span>
              <span className="rounded-md bg-accent px-2 py-0.5 text-xs text-accent-foreground">主案例</span>
            </div>
            <h2 className="mt-3 text-xl font-bold">{main.name}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{main.description}</p>
            <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
              {["仓内分拣", "VRP", "笼车", "在线仿真", "AI 批改"].map((t) => (
                <span key={t} className="rounded-full bg-secondary px-2 py-0.5">{t}</span>
              ))}
            </div>
            <Link to="/student/week/$weekId" params={{ weekId: "8" }}
              className="mt-5 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-primary-foreground"
              style={{ background: "var(--gradient-hero)" }}>
              进入 Week 8 仓内分拣专项
            </Link>
          </div>
          <div className="border-t bg-background/40 p-6 lg:border-l lg:border-t-0">
            <div className="text-sm font-semibold">案例覆盖的教学周</div>
            <ul className="mt-3 space-y-2 text-sm">
              {[["Week 3", "案例理解"], ["Week 6–9", "仓内分拣"], ["Week 10–11", "配送衔接"], ["Week 12–14", "综合方案"]].map(([w, t]) => (
                <li key={w} className="flex items-center justify-between rounded-lg border bg-card px-3 py-2">
                  <span className="font-medium">{w}</span>
                  <span className="text-xs text-muted-foreground">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 mb-3 text-sm font-semibold text-muted-foreground">扩展案例</div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {others.map((c) => {
          const ss = statusMap[c.status];
          const IIcon = ss.icon;
          return (
            <div key={c.id} className="rounded-2xl border bg-card p-5">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl" style={{ background: "var(--gradient-card)" }}>{c.cover}</div>
                <span className={`inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs ${ss.color}`}>
                  <IIcon className="h-3.5 w-3.5" /> {ss.label}
                </span>
              </div>
              <h3 className="mt-3 text-base font-semibold">{c.name}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
              <div className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground">
                <BookOpen className="h-3.5 w-3.5" /> 暂未开放具体周次
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
