import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Play, RotateCcw, Trophy, Zap, X, Package } from "lucide-react";
import { setState, useStore } from "@/lib/demo-store";

/**
 * Sorting Challenge mini-game.
 * - 4 conveyor lanes, each carrying packages of a specific TYPE
 * - 3 sorters (draggable) — assign each sorter to a lane
 * - A sorter standing at a lane sorts EVERY package in that lane
 * - Packages have a "correct destination"; if the sorter assigned to that lane
 *   matches the package's destination color, it counts as a correct sort.
 *   Otherwise it's a mis-sort. Lanes without a sorter → missed packages.
 * - 60s round, live KPIs, final score feeds back to the learning progress.
 */

type LaneId = 0 | 1 | 2 | 3;
const LANES: LaneId[] = [0, 1, 2, 3];

const DEST = [
  { id: "A", label: "A 区", emoji: "🥐", color: "oklch(0.62 0.18 265)" },
  { id: "B", label: "B 区", emoji: "🥬", color: "oklch(0.65 0.17 150)" },
  { id: "C", label: "C 区", emoji: "📚", color: "oklch(0.78 0.16 75)" },
  { id: "D", label: "D 区", emoji: "🧊", color: "oklch(0.62 0.18 200)" },
] as const;
type DestId = (typeof DEST)[number]["id"];

interface Pkg {
  id: number;
  lane: LaneId;
  dest: DestId;
  x: number; // 0..100 progress along the lane (left → right)
  state: "moving" | "sorted" | "miss" | "wrong";
}

interface Sorter {
  id: number;
  dest: DestId; // which destination this sorter handles
  lane: LaneId | null; // assigned lane, null = on the bench
}

const ROUND_SECONDS = 60;
const SPAWN_MS = 900; // base spawn rate
const SPEED = 28; // % per second along lane

export function SortingGame({ onFinish }: { onFinish?: (score: number) => void }) {
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [pkgs, setPkgs] = useState<Pkg[]>([]);
  const [sorters, setSorters] = useState<Sorter[]>([
    { id: 1, dest: "A", lane: 0 },
    { id: 2, dest: "B", lane: 1 },
    { id: 3, dest: "C", lane: 2 },
  ]);
  const [stats, setStats] = useState({ correct: 0, wrong: 0, missed: 0 });
  const [dragging, setDragging] = useState<number | null>(null);
  const [hoverLane, setHoverLane] = useState<LaneId | null>(null);
  const [finished, setFinished] = useState(false);
  const [flash, setFlash] = useState<{ lane: LaneId; kind: "correct" | "wrong" } | null>(null);

  const pkgIdRef = useRef(0);
  const sortersRef = useRef(sorters);
  sortersRef.current = sorters;

  const unlocked = useStore((s) => s.unlockedLevel);

  // animation loop
  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = performance.now();
    let acc = 0;

    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      acc += dt * 1000;

      // spawn
      if (acc > SPAWN_MS) {
        acc = 0;
        const lane = Math.floor(Math.random() * 4) as LaneId;
        const dest = DEST[Math.floor(Math.random() * DEST.length)].id;
        pkgIdRef.current += 1;
        setPkgs((prev) => [
          ...prev,
          { id: pkgIdRef.current, lane, dest, x: 0, state: "moving" },
        ]);
      }

      // advance
      setPkgs((prev) => {
        const next: Pkg[] = [];
        let dC = 0, dW = 0, dM = 0;
        for (const p of prev) {
          if (p.state !== "moving") {
            // fade-out window
            if (p.x < 130) next.push({ ...p, x: p.x + SPEED * dt * 1.6 });
            continue;
          }
          const nx = p.x + SPEED * dt;
          // sorter station sits around x = 78
          if (p.x < 78 && nx >= 78) {
            const s = sortersRef.current.find((s) => s.lane === p.lane);
            if (!s) {
              // no sorter on lane → continues to fall off the belt (miss at x=100)
              next.push({ ...p, x: nx });
            } else if (s.dest === p.dest) {
              dC += 1;
              setFlash({ lane: p.lane, kind: "correct" });
              next.push({ ...p, x: 78, state: "sorted" });
            } else {
              dW += 1;
              setFlash({ lane: p.lane, kind: "wrong" });
              next.push({ ...p, x: 78, state: "wrong" });
            }
          } else if (nx >= 100) {
            dM += 1;
            // dropped off end
          } else {
            next.push({ ...p, x: nx });
          }
        }
        if (dC || dW || dM) {
          setStats((s) => ({
            correct: s.correct + dC,
            wrong: s.wrong + dW,
            missed: s.missed + dM,
          }));
        }
        return next;
      });

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  // flash auto-clear
  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 220);
    return () => clearTimeout(t);
  }, [flash]);

  // countdown
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setTimeLeft((tl) => {
        if (tl <= 1) {
          clearInterval(t);
          setRunning(false);
          setFinished(true);
          return 0;
        }
        return tl - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running]);

  // score
  const score = useMemo(() => {
    const raw = stats.correct * 10 - stats.wrong * 6 - stats.missed * 3;
    return Math.max(0, raw);
  }, [stats]);

  // on finish → reward
  useEffect(() => {
    if (!finished) return;
    if (score >= 120 && unlocked < 2) {
      setState({ unlockedLevel: 2 });
    }
    onFinish?.(score);
  }, [finished]); // eslint-disable-line

  const start = useCallback(() => {
    setPkgs([]);
    setStats({ correct: 0, wrong: 0, missed: 0 });
    setTimeLeft(ROUND_SECONDS);
    setFinished(false);
    setRunning(true);
  }, []);

  const reset = useCallback(() => {
    setRunning(false);
    setPkgs([]);
    setStats({ correct: 0, wrong: 0, missed: 0 });
    setTimeLeft(ROUND_SECONDS);
    setFinished(false);
  }, []);

  // drag handlers
  const onDragStart = (id: number) => setDragging(id);
  const onDropLane = (lane: LaneId | null) => {
    if (dragging == null) return;
    setSorters((prev) => {
      // remove any other sorter on the target lane (swap to bench)
      const target = prev.find((s) => s.id === dragging)!;
      const prevLane = target.lane;
      return prev.map((s) => {
        if (s.id === dragging) return { ...s, lane };
        if (lane !== null && s.lane === lane) return { ...s, lane: prevLane };
        return s;
      });
    });
    setDragging(null);
    setHoverLane(null);
  };

  return (
    <div
      className="rounded-3xl border bg-card p-6 shadow-sm"
      style={{ background: "var(--gradient-card)", boxShadow: "var(--shadow-soft)" }}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-primary/10 p-1.5 text-primary"><Package className="h-4 w-4" /></div>
            <h2 className="text-xl font-bold">分拣挑战 · Sorting Sprint</h2>
            <span className="rounded-full bg-warning/20 px-2 py-0.5 text-xs font-medium text-warning-foreground">
              限时 60s
            </span>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            拖动右侧 3 名分拣员到 4 条传送带上。每个分拣员只负责一种目的地，分配正确即得分；漏件 / 错分会扣分。
            最终分数 ≥ <span className="font-semibold text-primary">120</span> 解锁第 2 关。
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-baseline gap-1 font-mono text-3xl font-bold tabular-nums">
            <span className={timeLeft <= 10 ? "text-destructive" : ""}>{String(timeLeft).padStart(2, "0")}</span>
            <span className="text-sm text-muted-foreground">s</span>
          </div>
          <div className="flex gap-2">
            {!running && !finished && (
              <button onClick={start} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90">
                <Play className="h-4 w-4" /> 开始
              </button>
            )}
            {(running || finished) && (
              <button onClick={reset} className="inline-flex items-center gap-1.5 rounded-md border bg-card px-3 py-1.5 text-sm hover:bg-secondary">
                <RotateCcw className="h-4 w-4" /> 重置
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="mb-4 grid grid-cols-4 gap-3 text-sm">
        <Kpi label="正确分拣" value={stats.correct} accent="success" />
        <Kpi label="错分" value={stats.wrong} accent="destructive" />
        <Kpi label="漏件" value={stats.missed} accent="warning" />
        <Kpi label="当前得分" value={score} accent="primary" icon={<Zap className="h-4 w-4" />} />
      </div>

      <div className="grid grid-cols-[1fr_180px] gap-4">
        {/* Conveyor area */}
        <div className="relative overflow-hidden rounded-2xl border bg-secondary/40 p-3">
          <div className="space-y-2">
            {LANES.map((lane) => {
              const assigned = sorters.find((s) => s.lane === lane);
              const isHover = hoverLane === lane;
              return (
                <div
                  key={lane}
                  onDragOver={(e) => { e.preventDefault(); setHoverLane(lane); }}
                  onDrop={() => onDropLane(lane)}
                  className={`relative h-16 rounded-lg border-2 border-dashed transition-colors ${
                    isHover ? "border-primary bg-primary/10" : "border-border bg-background"
                  }`}
                >
                  {/* belt stripes */}
                  <div
                    className="absolute inset-y-0 left-12 right-24 overflow-hidden rounded-md opacity-40"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(90deg, oklch(0.85 0.02 260) 0 14px, oklch(0.92 0.01 260) 14px 28px)",
                      animation: running ? "belt 1s linear infinite" : "none",
                    }}
                  />
                  {/* lane label */}
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 rounded-md bg-card px-2 py-1 text-xs font-medium text-muted-foreground">
                    L{lane + 1}
                  </div>
                  {/* sorter station */}
                  <div className="absolute right-3 top-1/2 z-10 -translate-y-1/2">
                    {assigned ? (
                      <div
                        draggable
                        onDragStart={() => onDragStart(assigned.id)}
                        className="flex h-12 w-12 cursor-grab items-center justify-center rounded-full border-2 text-xl shadow active:cursor-grabbing"
                        style={{
                          background: DEST.find((d) => d.id === assigned.dest)!.color,
                          borderColor: "white",
                          color: "white",
                        }}
                        title={`分拣员 · 负责 ${assigned.dest} 区`}
                      >
                        🧑‍🔧
                      </div>
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-border text-xs text-muted-foreground">
                        空位
                      </div>
                    )}
                  </div>
                  {/* flash feedback */}
                  {flash?.lane === lane && (
                    <div
                      className="pointer-events-none absolute inset-0 rounded-lg animate-fade-in"
                      style={{
                        background:
                          flash.kind === "correct"
                            ? "oklch(0.65 0.17 150 / 0.18)"
                            : "oklch(0.60 0.22 25 / 0.18)",
                      }}
                    />
                  )}
                  {/* packages */}
                  {pkgs
                    .filter((p) => p.lane === lane)
                    .map((p) => {
                      const d = DEST.find((x) => x.id === p.dest)!;
                      const opacity =
                        p.state === "sorted" || p.state === "wrong"
                          ? Math.max(0, 1 - (p.x - 78) / 30)
                          : 1;
                      return (
                        <div
                          key={p.id}
                          className="absolute top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md border-2 text-lg shadow-sm"
                          style={{
                            left: `calc(${Math.min(p.x, 78)}% + 0px)`,
                            background: "white",
                            borderColor: d.color,
                            opacity,
                            transform: `translate(-50%, -50%) ${
                              p.state === "sorted" ? "scale(0.6) rotate(15deg)" : p.state === "wrong" ? "scale(0.6) rotate(-15deg)" : ""
                            }`,
                            transition: "transform 240ms ease, opacity 240ms ease",
                          }}
                        >
                          {d.emoji}
                        </div>
                      );
                    })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bench + legend */}
        <div className="space-y-3">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDropLane(null)}
            className="rounded-xl border-2 border-dashed border-border bg-background p-3"
          >
            <div className="mb-2 text-xs font-medium text-muted-foreground">分拣员候补区</div>
            <div className="flex flex-wrap gap-2">
              {sorters.filter((s) => s.lane === null).length === 0 && (
                <div className="text-xs text-muted-foreground">（全部已上岗）</div>
              )}
              {sorters
                .filter((s) => s.lane === null)
                .map((s) => (
                  <div
                    key={s.id}
                    draggable
                    onDragStart={() => onDragStart(s.id)}
                    className="flex h-10 w-10 cursor-grab items-center justify-center rounded-full text-lg shadow active:cursor-grabbing"
                    style={{ background: DEST.find((d) => d.id === s.dest)!.color, color: "white" }}
                    title={`负责 ${s.dest} 区`}
                  >
                    🧑‍🔧
                  </div>
                ))}
            </div>
          </div>

          <div className="rounded-xl border bg-background p-3">
            <div className="mb-2 text-xs font-medium text-muted-foreground">目的地图例</div>
            <div className="space-y-1.5">
              {DEST.map((d) => (
                <div key={d.id} className="flex items-center gap-2 text-xs">
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded text-sm"
                    style={{ background: d.color, color: "white" }}
                  >
                    {d.emoji}
                  </span>
                  <span className="font-medium">{d.label}</span>
                  <span className="text-muted-foreground">{d.id}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Result modal */}
      {finished && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
          <div className="w-full max-w-md animate-scale-in rounded-2xl bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-6 w-6 text-warning-foreground" />
                <h3 className="text-lg font-semibold">挑战结束</h3>
              </div>
              <button onClick={() => setFinished(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-4 text-center">
              <div className="text-5xl font-bold text-primary">{score}</div>
              <div className="mt-1 text-sm text-muted-foreground">最终得分</div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
              <Stat label="正确" v={stats.correct} c="text-success" />
              <Stat label="错分" v={stats.wrong} c="text-destructive" />
              <Stat label="漏件" v={stats.missed} c="text-warning-foreground" />
            </div>
            <div className="mt-4 rounded-lg bg-secondary p-3 text-sm">
              {score >= 120 ? (
                <span>🎉 通过！第 1 关已解锁，已获得 <span className="font-semibold">+30 经验</span>。</span>
              ) : (
                <span>未达 120 分，请优化分拣员配置后再挑战一次。提示：常出现 <b>{topMiss(stats)}</b>。</span>
              )}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={reset} className="rounded-md border bg-card px-3 py-1.5 text-sm hover:bg-secondary">再来一次</button>
              <button onClick={() => setFinished(false)} className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90">关闭</button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes belt { from { background-position: 0 0; } to { background-position: 28px 0; } }`}</style>
    </div>
  );
}

function topMiss(s: { correct: number; wrong: number; missed: number }) {
  if (s.missed >= s.wrong) return "漏件（车道无分拣员）";
  return "错分（分拣员目的地与包裹不匹配）";
}

function Kpi({
  label, value, accent, icon,
}: { label: string; value: number; accent: "success" | "destructive" | "warning" | "primary"; icon?: React.ReactNode }) {
  const map = {
    success: "bg-success/10 text-success",
    destructive: "bg-destructive/10 text-destructive",
    warning: "bg-warning/20 text-warning-foreground",
    primary: "bg-primary/10 text-primary",
  } as const;
  return (
    <div className={`rounded-lg border p-3 ${map[accent]}`}>
      <div className="flex items-center justify-between text-xs opacity-80">
        <span>{label}</span>{icon}
      </div>
      <div className="mt-1 text-2xl font-bold tabular-nums">{value}</div>
    </div>
  );
}

function Stat({ label, v, c }: { label: string; v: number; c: string }) {
  return (
    <div className="rounded-md bg-secondary p-2">
      <div className={`text-xl font-bold ${c}`}>{v}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
