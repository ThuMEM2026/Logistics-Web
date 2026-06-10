import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Lock, Lightbulb, Search, BookOpen, FastForward, Sparkles } from "lucide-react";
import { setState, useStore } from "@/lib/demo-store";
import { SortingGame } from "@/components/SortingGame";
import { DeliveryGame } from "@/components/DeliveryGame";

export const Route = createFileRoute("/student/map")({ component: MapPage });

const LEVELS = [
  { n: 1, name: "案例理解", desc: "理解 Wafia Bakery 的门店、订单和配送背景。", reward: "完成概念学习" },
  { n: 2, name: "仓内分拣挑战", desc: "设计 sorting wave，满足每波次不超过 80 carts。", reward: "通过分拣规则测验" },
  { n: 3, name: "配送路径挑战", desc: "设计车辆路线，满足距离、时间窗和司机工时限制。", reward: "完成分拣挑战" },
  { n: 4, name: "分拣配送协同", desc: "判断每条配送线路是否可以在分拣完成后发车。", reward: "完成配送路径挑战" },
  { n: 5, name: "方案提交与 AI 批改", desc: "上传作业文件，查看校验、仿真和 AI 反馈。", reward: "完成综合协同任务" },
];

const HINTS = [
  { k: "tip", label: "提示锦囊", desc: "给出方向性提示", penalty: 10, icon: Lightbulb },
  { k: "check", label: "检查锦囊", desc: "帮你检查当前方案的错误", penalty: 15, icon: Search },
  { k: "demo", label: "示范锦囊", desc: "展示标准解法片段", penalty: 20, icon: BookOpen },
  { k: "skip", label: "跳过锦囊", desc: "直接进入下一关", penalty: 50, icon: FastForward },
];

function MapPage() {
  const unlocked = useStore((s) => s.unlockedLevel);
  const hints = useStore((s) => s.hintsUsed);
  const [open, setOpen] = useState<number | null>(null);
  const router = useRouter();

  const useHint = (level: number, h: typeof HINTS[number]) => {
    setState((s) => ({ hintsUsed: [...s.hintsUsed, { type: `L${level}-${h.label}`, penalty: h.penalty }] }));
    setOpen(null);
    if (h.k === "skip" && unlocked === level) {
      setState({ unlockedLevel: Math.min(5, level + 1) });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold">闯关地图</h1>
          <p className="mt-1 text-muted-foreground">5 关递进 · 当前最高解锁：第 {unlocked} 关</p>
        </div>
        {hints.length > 0 && (
          <div className="rounded-lg border bg-card px-4 py-2 text-sm">
            <span className="text-muted-foreground">锦囊已用：</span>
            <span className="font-medium text-warning-foreground">-{hints.reduce((a, b) => a + b.penalty, 0)}%</span>
          </div>
        )}
      </div>

      {/* Gamified Sorting Challenge — gateway to Level 1 */}
      <SortingGame />

      {/* Delivery Routing Challenge */}
      <DeliveryGame />


      <div className="relative rounded-3xl border bg-card p-10" style={{ background: "var(--gradient-card)", boxShadow: "var(--shadow-soft)" }}>
        <svg className="absolute left-0 top-1/2 h-2 w-full -translate-y-1/2" preserveAspectRatio="none" viewBox="0 0 100 2">
          <line x1="10" y1="1" x2="90" y2="1" stroke="oklch(0.85 0.04 260)" strokeWidth="0.4" strokeDasharray="2 1.5" />
        </svg>
        <div className="relative grid grid-cols-3 gap-6">
          {LEVELS.map((l) => {
            const status = l.n < unlocked ? "done" : l.n === unlocked ? "current" : "locked";
            return (
              <div key={l.n} className="flex flex-col items-center text-center">
                <div
                  className={`flex h-24 w-24 items-center justify-center rounded-full border-4 text-2xl font-bold ${
                    status === "done" ? "border-success bg-success text-success-foreground" :
                    status === "current" ? "border-primary bg-card text-primary animate-pulse-glow" :
                    "border-border bg-secondary text-muted-foreground"
                  }`}
                >
                  {status === "done" ? <Check className="h-10 w-10" /> : status === "locked" ? <Lock className="h-8 w-8" /> : l.n}
                </div>
                <div className="mt-4 text-lg font-semibold">第 {l.n} 关 · {l.name}</div>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">{l.desc}</p>
                <div className="mt-2 text-xs text-warning-foreground">{l.reward}</div>

                <div className="mt-5 flex gap-2">
                  <button
                    onClick={() => setOpen(l.n)}
                    disabled={status === "locked"}
                    className="inline-flex items-center gap-1 rounded-md border bg-card px-3 py-1.5 text-xs text-warning-foreground disabled:opacity-40"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> 锦囊
                  </button>
                  {status === "current" && (
                    <button
                      onClick={() => {
                        if (l.n === 1) { setState({ unlockedLevel: 2 }); }
                        else if (l.n === 2) router.navigate({ to: "/student/submit" });
                        else router.navigate({ to: "/student/result" });
                      }}
                      className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                    >
                      {l.n === 1 ? "通过测验" : l.n === 2 ? "提交方案" : "查看仿真"}
                    </button>
                  )}
                  {status === "done" && (
                    <Link to={l.n === 2 ? "/student/submit" : "/student/result"} className="rounded-md bg-secondary px-3 py-1.5 text-xs">回看</Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {open !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" onClick={() => setOpen(null)}>
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold">第 {open} 关 · 选择锦囊</h3>
            <p className="mt-1 text-sm text-muted-foreground">使用锦囊会扣除对应分数百分比，请谨慎使用。</p>
            <div className="mt-4 space-y-2">
              {HINTS.map((h) => {
                const Icon = h.icon;
                return (
                  <button key={h.k} onClick={() => useHint(open, h)} className="flex w-full items-center gap-3 rounded-lg border p-3 text-left hover:border-primary/50">
                    <Icon className="h-5 w-5 text-warning-foreground" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{h.label}</div>
                      <div className="text-xs text-muted-foreground">{h.desc}</div>
                    </div>
                    <span className="text-sm font-semibold text-destructive">-{h.penalty}%</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
