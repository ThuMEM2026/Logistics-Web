import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Lock, Play, RotateCcw, Sparkles, ArrowRight, BookOpen, Boxes, Truck, Network, Award } from "lucide-react";
import { TRACK_META, WEEKS, useStore, type WeekItem, type WeekStatus } from "@/lib/demo-store";

export const Route = createFileRoute("/student/")({ component: WeekCalendar });

const STATUS_META: Record<WeekStatus, { label: string; ring: string; badge: string; Icon: typeof Play }> = {
  locked:    { label: "未开放", ring: "border-border opacity-70", badge: "bg-secondary text-muted-foreground", Icon: Lock },
  current:   { label: "进行中", ring: "border-primary shadow-[var(--shadow-glow)]", badge: "bg-primary text-primary-foreground", Icon: Play },
  completed: { label: "已完成", ring: "border-success/40", badge: "bg-success/15 text-success", Icon: CheckCircle2 },
  review:    { label: "可回顾", ring: "border-border", badge: "bg-accent text-accent-foreground", Icon: RotateCcw },
};

const TRACK_ICON = { intro: Sparkles, fundamentals: BookOpen, sorting: Boxes, delivery: Truck, integrated: Network, review: Award } as const;

function WeekCalendar() {
  const weeks = WEEKS;
  const username = useStore((s) => s.username);
  const completed = weeks.filter((w) => w.status === "completed").length;
  const total = weeks.length;
  const current = weeks.find((w) => w.status === "current");

  return (
    <div>
      {/* Top overview */}
      <div className="overflow-hidden rounded-2xl border bg-card" style={{ boxShadow: "var(--shadow-soft)" }}>
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr]">
          <div className="p-6">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">{username || "李同学"} · 本学期</div>
            <h1 className="mt-1 text-2xl font-bold">物流网络规划 · 课程周历</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              围绕 Wafia Bakery 案例，按 14 周推进；当前重点为 <b className="text-primary">仓内分拣</b>，与 <b className="text-chart-2">物流配送</b> 衔接，最终形成综合练习。
            </p>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">学期总进度</span>
                <span className="font-semibold">{completed} / {total}</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full" style={{ width: `${(completed / total) * 100}%`, background: "var(--gradient-hero)" }} />
              </div>
            </div>
          </div>
          {current && (
            <div className="border-t bg-background/40 p-6 lg:border-l lg:border-t-0">
              <div className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground animate-pulse-glow">
                <Play className="h-3 w-3" /> 本周进行中
              </div>
              <div className="mt-2 text-xs text-muted-foreground">Week {current.id} · {TRACK_META[current.track].label}</div>
              <div className="mt-1 text-lg font-semibold">{current.title}</div>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{current.goal}</p>
              <Link to="/student/week/$weekId" params={{ weekId: String(current.id) }}
                className="mt-3 inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-primary-foreground"
                style={{ background: "var(--gradient-hero)" }}>
                进入本周学习 <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Track legend */}
      <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-muted-foreground">教学方向：</span>
        {(Object.keys(TRACK_META) as (keyof typeof TRACK_META)[]).map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5 rounded-full border bg-card px-2 py-0.5">
            <span className={`h-2 w-2 rounded-full ${TRACK_META[k].bar}`} />
            {TRACK_META[k].label}
          </span>
        ))}
      </div>

      {/* Week grid */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {weeks.map((w) => <WeekCard key={w.id} w={w} />)}
      </div>
    </div>
  );
}

function WeekCard({ w }: { w: WeekItem }) {
  const sm = STATUS_META[w.status];
  const tm = TRACK_META[w.track];
  const TIcon = TRACK_ICON[w.track];
  const SIcon = sm.Icon;
  const interactive = w.status !== "locked";

  const inner = (
    <div className={`group relative h-full overflow-hidden rounded-2xl border-2 bg-card p-5 transition-all ${sm.ring} ${interactive ? "hover:-translate-y-0.5 hover:shadow-lg" : ""}`}>
      <div className={`absolute inset-x-0 top-0 h-1 ${tm.bar}`} />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-secondary ${tm.color}`}>
            <TIcon className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Week {w.id}</div>
            <div className={`text-[11px] ${tm.color}`}>{tm.label}</div>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${sm.badge}`}>
          <SIcon className="h-3 w-3" /> {sm.label}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-1.5">
        {w.highlight && <span className="rounded bg-warning/20 px-1.5 py-0.5 text-[10px] font-semibold text-warning-foreground">★ 重点周</span>}
        <h3 className="text-sm font-semibold leading-snug">{w.title}</h3>
      </div>
      <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{w.goal}</p>

      <div className="mt-3 flex flex-wrap gap-1">
        {w.taskTypes.map((t) => <span key={t} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">{t}</span>)}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-[11px] text-muted-foreground">{w.concepts.length} 个核心概念</div>
        {interactive ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
            进入 <ArrowRight className="h-3.5 w-3.5" />
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">尚未解锁</span>
        )}
      </div>
    </div>
  );

  return interactive
    ? <Link to="/student/week/$weekId" params={{ weekId: String(w.id) }}>{inner}</Link>
    : <div title="尚未解锁" className="cursor-not-allowed">{inner}</div>;
}
