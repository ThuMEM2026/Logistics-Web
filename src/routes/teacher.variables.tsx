import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RotateCcw, Wand2 } from "lucide-react";
import { setState, useStore } from "@/lib/demo-store";

export const Route = createFileRoute("/teacher/variables")({ component: Variables });

interface LogItem { time: string; text: string; }

function Variables() {
  const vars = useStore((s) => s.variables);
  const [log, setLog] = useState<LogItem[]>([
    { time: "10:21", text: "需求量 +10% 已应用到 Wafia Bakery" },
    { time: "09:45", text: "门店数量 24 → 28" },
  ]);
  const [draft, setDraft] = useState(vars);

  const apply = () => {
    setState({ variables: draft });
    setLog((l) => [{ time: new Date().toLocaleTimeString().slice(0, 5), text: `已应用：需求 ${draft.demandDelta >= 0 ? "+" : ""}${draft.demandDelta}%、门店 ${draft.storeCount}、车容 ${draft.vehicleCap}` }, ...l]);
  };
  const reset = () => { const d = { demandDelta: 0, storeCount: 24, vehicleCap: 100 }; setDraft(d); setState({ variables: d }); setLog((l) => [{ time: new Date().toLocaleTimeString().slice(0, 5), text: "参数已重置为默认值" }, ...l]); };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">变量注入</h1>
        <p className="mt-1 text-muted-foreground">动态调整案例参数，模拟突发场景以挑战学生方案。</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border bg-card p-6">
          <h3 className="font-semibold">案例：Wafia Bakery</h3>
          <div className="mt-6 space-y-6">
            <Slider label="需求量变化" unit="%" min={-30} max={50} value={draft.demandDelta} onChange={(v) => setDraft({ ...draft, demandDelta: v })} />
            <Slider label="门店数量" unit="家" min={10} max={60} value={draft.storeCount} onChange={(v) => setDraft({ ...draft, storeCount: v })} />
            <Slider label="单车载重上限" unit="kg" min={50} max={200} value={draft.vehicleCap} onChange={(v) => setDraft({ ...draft, vehicleCap: v })} />
          </div>
          <div className="mt-8 flex gap-3">
            <button onClick={apply} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
              <Wand2 className="h-4 w-4" /> 应用变更
            </button>
            <button onClick={reset} className="inline-flex items-center gap-1.5 rounded-md border bg-card px-4 py-2 text-sm">
              <RotateCcw className="h-4 w-4" /> 一键重置
            </button>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6">
          <h3 className="font-semibold">变更历史</h3>
          <ul className="mt-4 space-y-2">
            {log.map((l, i) => (
              <li key={i} className="flex gap-3 rounded-lg bg-secondary p-3 text-sm">
                <span className="font-mono text-xs text-muted-foreground">{l.time}</span>
                <span className="flex-1">{l.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Slider({ label, unit, min, max, value, onChange }: { label: string; unit: string; min: number; max: number; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="rounded bg-accent px-2 py-0.5 text-sm font-semibold text-primary">{value > 0 && unit === "%" ? "+" : ""}{value} {unit}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[oklch(0.55_0.20_265)]" />
      <div className="mt-1 flex justify-between text-xs text-muted-foreground"><span>{min}</span><span>{max}</span></div>
    </div>
  );
}
