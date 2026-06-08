import { useEffect, useMemo, useRef, useState } from "react";
import { Truck, MapPin, Play, RotateCcw, Trophy, Lightbulb, Route as RouteIcon } from "lucide-react";

// ---------- Types ----------
type Pt = { id: string; name: string; x: number; y: number; demand: number; tw: [number, number] };

// Depot + 8 stops. Coordinates in a 100x60 logical grid (km-ish).
const DEPOT: Pt = { id: "D", name: "配送中心", x: 50, y: 30, demand: 0, tw: [0, 480] };
const STOPS: Pt[] = [
  { id: "A", name: "学府路店", x: 18, y: 12, demand: 12, tw: [60, 180] },
  { id: "B", name: "中关村店", x: 32, y: 46, demand: 8, tw: [30, 240] },
  { id: "C", name: "望京店",   x: 78, y: 14, demand: 15, tw: [90, 210] },
  { id: "E", name: "国贸店",   x: 84, y: 38, demand: 10, tw: [60, 300] },
  { id: "F", name: "三里屯店", x: 66, y: 52, demand: 14, tw: [120, 270] },
  { id: "G", name: "西单店",   x: 40, y: 22, demand: 7,  tw: [30, 200] },
  { id: "H", name: "亦庄店",   x: 70, y: 8,  demand: 11, tw: [90, 240] },
  { id: "I", name: "通州店",   x: 12, y: 40, demand: 9,  tw: [60, 260] },
];
const VEHICLE_CAP = 60;       // 装载上限
const SPEED = 0.9;            // 单位/分钟 (动画快慢) — 1 distance unit ≈ 1.2 分钟
const SERVICE = 6;            // 每店服务时长 分钟
const UNIT_MIN = 1.2;         // 一个单位距离 = 1.2 分钟实际时间

const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);

function routeMetrics(order: Pt[]) {
  const seq = [DEPOT, ...order, DEPOT];
  let d = 0;
  for (let i = 1; i < seq.length; i++) d += dist(seq[i - 1], seq[i]);
  const time = d * UNIT_MIN + order.length * SERVICE;
  const load = order.reduce((s, p) => s + p.demand, 0);
  return { d, time, load, seq };
}

// Nearest-neighbor baseline as "推荐参考方案"
function nearestNeighbor(pool: Pt[]): Pt[] {
  const remain = [...pool];
  const out: Pt[] = [];
  let cur: Pt = DEPOT;
  while (remain.length) {
    remain.sort((a, b) => dist(cur, a) - dist(cur, b));
    cur = remain.shift()!;
    out.push(cur);
  }
  return out;
}

export function DeliveryGame() {
  const [picked, setPicked] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1 along full path
  const [result, setResult] = useState<null | { time: number; d: number; score: number; better: boolean }>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  const pickedPts = useMemo(
    () => picked.map((id) => STOPS.find((s) => s.id === id)!).filter(Boolean),
    [picked]
  );
  const allSelected = picked.length === STOPS.length;
  const totalLoad = pickedPts.reduce((s, p) => s + p.demand, 0);
  const overCap = totalLoad > VEHICLE_CAP;

  const my = useMemo(() => routeMetrics(pickedPts), [pickedPts]);
  const best = useMemo(() => routeMetrics(nearestNeighbor(STOPS)), []);

  const togglePick = (id: string) => {
    if (running) return;
    setResult(null);
    setPicked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const reset = () => {
    setPicked([]);
    setRunning(false);
    setProgress(0);
    setResult(null);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };

  const start = () => {
    if (!allSelected || overCap || running) return;
    setRunning(true);
    setProgress(0);
    startRef.current = performance.now();
    const duration = 5200; // ms for full animation
    const tick = (now: number) => {
      const t = Math.min(1, (now - startRef.current) / duration);
      setProgress(t);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else {
        setRunning(false);
        const better = my.time <= best.time + 1;
        // 评分: 以参考方案为基准, 100 分; 每多 1 分钟扣 2 分, 下限 40
        const diff = my.time - best.time;
        const score = Math.max(40, Math.min(100, Math.round(100 - diff * 2)));
        setResult({ time: my.time, d: my.d, score, better });
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  // Truck position along seq
  const truckPos = useMemo(() => {
    if (!running && progress === 0) return null;
    const segs = my.seq;
    const lens = [];
    let total = 0;
    for (let i = 1; i < segs.length; i++) {
      const L = dist(segs[i - 1], segs[i]);
      lens.push(L);
      total += L;
    }
    let target = progress * total;
    for (let i = 0; i < lens.length; i++) {
      if (target <= lens[i]) {
        const k = lens[i] === 0 ? 0 : target / lens[i];
        const a = segs[i], b = segs[i + 1];
        return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, idx: i };
      }
      target -= lens[i];
    }
    const last = segs[segs.length - 1];
    return { x: last.x, y: last.y, idx: segs.length - 2 };
  }, [progress, running, my.seq]);

  const suggest = () => {
    if (running) return;
    setResult(null);
    setPicked(nearestNeighbor(STOPS).map((p) => p.id));
  };

  // Build SVG path for chosen route (depot -> picks -> depot)
  const pathD = useMemo(() => {
    const seq = my.seq;
    return seq.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  }, [my.seq]);

  return (
    <section className="rounded-3xl border bg-card p-6" style={{ background: "var(--gradient-card)", boxShadow: "var(--shadow-soft)" }}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <RouteIcon className="h-3.5 w-3.5" /> 配送路径挑战 · VRP 入门
          </div>
          <h2 className="mt-2 text-2xl font-bold">规划最优配送路线</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            点击地图上的门店按顺序设置访问路径，所有门店访问完成后从配送中心出发，动画演示并计算总耗时。挑战目标：低于参考方案的总时间。
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={suggest} disabled={running}
            className="inline-flex items-center gap-1.5 rounded-md border bg-card px-3 py-2 text-sm hover:border-primary/50 disabled:opacity-40">
            <Lightbulb className="h-4 w-4 text-warning-foreground" /> 推荐顺序（最近邻）
          </button>
          <button onClick={reset} disabled={running}
            className="inline-flex items-center gap-1.5 rounded-md border bg-card px-3 py-2 text-sm hover:border-primary/50 disabled:opacity-40">
            <RotateCcw className="h-4 w-4" /> 重置
          </button>
          <button onClick={start} disabled={!allSelected || overCap || running}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 disabled:opacity-40">
            <Play className="h-4 w-4" /> {running ? "配送中..." : "开始配送"}
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="已选门店" value={`${picked.length} / ${STOPS.length}`} />
        <Stat label="车辆装载" value={`${totalLoad} / ${VEHICLE_CAP}`} warn={overCap} />
        <Stat label="规划里程" value={`${my.d.toFixed(1)} 单位`} />
        <Stat label="预计耗时" value={`${my.time.toFixed(0)} 分`} hint={`参考: ${best.time.toFixed(0)} 分`} />
      </div>

      {overCap && (
        <div className="mt-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          ⚠ 装载量已超出车辆上限，需删减门店或考虑多车次配送。
        </div>
      )}

      {/* Map */}
      <div className="mt-5 overflow-hidden rounded-2xl border bg-background">
        <svg viewBox="0 0 100 60" className="block h-[420px] w-full" style={{ background: "linear-gradient(180deg, oklch(0.97 0.01 240), oklch(0.99 0.005 240))" }}>
          {/* grid */}
          <g opacity="0.35">
            {Array.from({ length: 11 }).map((_, i) => (
              <line key={`vx${i}`} x1={i * 10} y1={0} x2={i * 10} y2={60} stroke="oklch(0.9 0.02 260)" strokeWidth="0.1" />
            ))}
            {Array.from({ length: 7 }).map((_, i) => (
              <line key={`hz${i}`} x1={0} y1={i * 10} x2={100} y2={i * 10} stroke="oklch(0.9 0.02 260)" strokeWidth="0.1" />
            ))}
          </g>

          {/* reference (best) route — faint */}
          <path
            d={best.seq.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")}
            fill="none" stroke="oklch(0.7 0.05 260)" strokeWidth="0.35" strokeDasharray="0.8 0.8" opacity="0.55"
          />

          {/* user route */}
          {pickedPts.length > 0 && (
            <path d={pathD} fill="none" stroke="oklch(0.55 0.2 285)" strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" />
          )}

          {/* stops */}
          {STOPS.map((s) => {
            const order = picked.indexOf(s.id);
            const isPicked = order >= 0;
            return (
              <g key={s.id} onClick={() => togglePick(s.id)} style={{ cursor: running ? "default" : "pointer" }}>
                <circle cx={s.x} cy={s.y} r={isPicked ? 2.2 : 1.8}
                  fill={isPicked ? "oklch(0.55 0.2 285)" : "oklch(1 0 0)"}
                  stroke={isPicked ? "oklch(0.55 0.2 285)" : "oklch(0.6 0.05 260)"} strokeWidth="0.3" />
                {isPicked && (
                  <text x={s.x} y={s.y + 0.7} textAnchor="middle" fontSize="1.8" fill="white" fontWeight="700">{order + 1}</text>
                )}
                <text x={s.x} y={s.y - 2.6} textAnchor="middle" fontSize="1.7" fill="oklch(0.3 0.04 260)">{s.name}</text>
                <text x={s.x} y={s.y + 4} textAnchor="middle" fontSize="1.4" fill="oklch(0.5 0.03 260)">需求 {s.demand}</text>
              </g>
            );
          })}

          {/* depot */}
          <g>
            <rect x={DEPOT.x - 2.4} y={DEPOT.y - 2.4} width="4.8" height="4.8" rx="0.8"
              fill="oklch(0.55 0.18 30)" stroke="oklch(0.4 0.18 30)" strokeWidth="0.3" />
            <text x={DEPOT.x} y={DEPOT.y + 0.7} textAnchor="middle" fontSize="2.2" fill="white" fontWeight="700">🏭</text>
            <text x={DEPOT.x} y={DEPOT.y - 3.4} textAnchor="middle" fontSize="1.8" fill="oklch(0.3 0.04 260)" fontWeight="600">配送中心</text>
          </g>

          {/* truck */}
          {truckPos && (
            <g transform={`translate(${truckPos.x}, ${truckPos.y})`}>
              <circle r="2.4" fill="oklch(0.95 0.05 60)" stroke="oklch(0.6 0.18 60)" strokeWidth="0.3" />
              <text textAnchor="middle" y="0.8" fontSize="2.6">🚚</text>
            </g>
          )}
        </svg>
      </div>

      {/* Order chips */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">访问顺序：</span>
        <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs">🏭 配送中心</span>
        {pickedPts.map((p, i) => (
          <span key={p.id} className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs text-primary">
            <span className="font-bold">{i + 1}</span> {p.name}
          </span>
        ))}
        {pickedPts.length > 0 && (
          <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs">🏭 返回</span>
        )}
        {picked.length === 0 && <span className="text-xs text-muted-foreground">（请点击地图上的门店按顺序选择）</span>}
      </div>

      {/* Tips */}
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <TipCard icon={<MapPin className="h-4 w-4" />} title="贪心策略" desc="每一步选择最近未访问门店，简单但易陷入次优。" />
        <TipCard icon={<Truck className="h-4 w-4" />} title="装载约束" desc="车辆容量上限决定单车次能否覆盖全部需求。" />
        <TipCard icon={<RouteIcon className="h-4 w-4" />} title="联合优化" desc="实际 VRP 还要考虑时间窗、左转限制、司机工时等。" />
      </div>

      {/* Result modal */}
      {result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" onClick={() => setResult(null)}>
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${result.score >= 85 ? "bg-success/20 text-success" : "bg-primary/15 text-primary"}`}>
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">配送完成</h3>
                <p className="text-xs text-muted-foreground">
                  {result.better ? "已达到/优于参考方案 🎉" : "可继续优化访问顺序"}
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <Metric label="总耗时" value={`${result.time.toFixed(0)} 分`} />
              <Metric label="总里程" value={`${result.d.toFixed(1)}`} />
              <Metric label="得分" value={`${result.score}`} accent />
            </div>
            <div className="mt-4 rounded-lg border bg-background p-3 text-xs text-muted-foreground">
              参考方案（最近邻启发式）：耗时 <b className="text-foreground">{best.time.toFixed(0)} 分</b>，里程 <b className="text-foreground">{best.d.toFixed(1)}</b>。
              你的方案与参考相差 <b className={result.time <= best.time ? "text-success" : "text-destructive"}>
                {(result.time - best.time >= 0 ? "+" : "")}{(result.time - best.time).toFixed(0)} 分
              </b>。
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={reset} className="rounded-md border bg-card px-3 py-1.5 text-sm">再试一次</button>
              <button onClick={() => setResult(null)} className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground">关闭</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Stat({ label, value, warn, hint }: { label: string; value: string; warn?: boolean; hint?: string }) {
  return (
    <div className={`rounded-xl border bg-background px-3 py-2 ${warn ? "border-destructive/50" : ""}`}>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`mt-0.5 text-lg font-semibold ${warn ? "text-destructive" : ""}`}>{value}</div>
      {hint && <div className="text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}
function TipCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-xl border bg-background p-3">
      <div className="flex items-center gap-2 text-sm font-medium"><span className="text-primary">{icon}</span>{title}</div>
      <div className="mt-1 text-xs text-muted-foreground">{desc}</div>
    </div>
  );
}
function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-lg border p-2 ${accent ? "border-primary/40 bg-primary/5" : "bg-background"}`}>
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className={`text-lg font-bold ${accent ? "text-primary" : ""}`}>{value}</div>
    </div>
  );
}
