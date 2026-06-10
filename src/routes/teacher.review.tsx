import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, X, RotateCcw } from "lucide-react";
import { GROUPS } from "@/lib/demo-store";

export const Route = createFileRoute("/teacher/review")({ component: Review });

type Row = (typeof GROUPS)[number] & { confirmed?: boolean; adjustedScore?: number; adjustedGrade?: "A" | "B"; reason?: string };

function Review() {
  const [rows, setRows] = useState<Row[]>(GROUPS.map((g) => ({ ...g })));
  const [open, setOpen] = useState<Row | null>(null);
  const [form, setForm] = useState<{ grade: "A" | "B"; score: number; reason: string }>({ grade: "A", score: 0, reason: "" });

  const openDetail = (r: Row) => {
    setOpen(r);
    setForm({ grade: r.adjustedGrade ?? r.grade, score: r.adjustedScore ?? r.total, reason: r.reason ?? "" });
  };

  const save = (action: "confirm" | "adjust" | "return") => {
    if (!open) return;
    setRows((rs) => rs.map((r) => r.id === open.id ? ({
      ...r,
      confirmed: true,
      adjustedScore: action === "adjust" ? form.score : r.total,
      adjustedGrade: action === "adjust" ? form.grade : r.grade,
      reason: action === "return" ? "退回学生修改" : form.reason,
    }) : r));
    setOpen(null);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">AI 复核</h1>
        <p className="mt-1 text-muted-foreground">查看 AI 自动评分依据，确认、调整或退回学生修改</p>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">小组</th>
              <th className="px-4 py-3">AI 判定</th>
              <th className="px-4 py-3">主要问题</th>
              <th className="px-4 py-3">格式</th>
              <th className="px-4 py-3">仿真</th>
              <th className="px-4 py-3">路径</th>
              <th className="px-4 py-3">协同</th>
              <th className="px-4 py-3">总分</th>
              <th className="px-4 py-3">状态</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t hover:bg-accent/40">
                <td className="px-4 py-3 font-medium">{r.name}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${r.grade === "A" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                    {r.grade}，{r.grade === "A" ? "有效" : "无效"}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{r.main}</td>
                <td className="px-4 py-3">{r.format}/20</td>
                <td className="px-4 py-3">{r.sim}/25</td>
                <td className="px-4 py-3">{r.vrp}/25</td>
                <td className="px-4 py-3">{r.coord}/30</td>
                <td className="px-4 py-3 font-semibold text-primary">{r.adjustedScore ?? r.total}</td>
                <td className="px-4 py-3 text-xs">
                  {r.confirmed
                    ? <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-success"><Check className="h-3 w-3" /> 已确认</span>
                    : <span className="rounded-full bg-warning/20 px-2 py-0.5 text-warning-foreground">待教师确认</span>}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => openDetail(r)} className="rounded border px-2 py-1 text-xs hover:border-primary">详情</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" onClick={() => setOpen(null)}>
          <div className="w-full max-w-2xl rounded-2xl bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold">{open.name} · AI 复核</h3>
                <p className="text-sm text-muted-foreground">AI 判定：{open.grade}（{open.grade === "A" ? "有效方案" : "无效方案"}）</p>
              </div>
              <button onClick={() => setOpen(null)} className="text-muted-foreground"><X className="h-5 w-5" /></button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div className="rounded bg-secondary p-2"><div className="text-xs text-muted-foreground">文件格式</div><div className="font-semibold">{open.format}/20</div></div>
              <div className="rounded bg-secondary p-2"><div className="text-xs text-muted-foreground">分拣仿真</div><div className="font-semibold">{open.sim}/25</div></div>
              <div className="rounded bg-secondary p-2"><div className="text-xs text-muted-foreground">配送路径</div><div className="font-semibold">{open.vrp}/25</div></div>
              <div className="rounded bg-secondary p-2"><div className="text-xs text-muted-foreground">协同与成本</div><div className="font-semibold">{open.coord}/30</div></div>
            </div>

            <div className="mt-4 rounded-lg border p-3 text-sm">
              <div className="font-medium">主要问题</div>
              <p className="mt-1 text-muted-foreground">{open.main}</p>
            </div>
            <div className="mt-2 rounded-lg border p-3 text-sm">
              <div className="font-medium">仿真状态</div>
              <p className="mt-1 text-muted-foreground">{open.sim_status}</p>
            </div>

            {/* Teacher adjust */}
            <div className="mt-4 rounded-lg border bg-secondary/40 p-4">
              <div className="text-sm font-semibold">教师调整区</div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <label className="text-xs">
                  <div className="mb-1 text-muted-foreground">教师最终等级</div>
                  <select value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value as "A" | "B" })} className="w-full rounded-md border bg-background px-2 py-1.5 text-sm">
                    <option value="A">A</option>
                    <option value="B">B</option>
                  </select>
                </label>
                <label className="text-xs">
                  <div className="mb-1 text-muted-foreground">教师最终分数</div>
                  <input type="number" value={form.score} onChange={(e) => setForm({ ...form, score: Number(e.target.value) })} className="w-full rounded-md border bg-background px-2 py-1.5 text-sm" />
                </label>
              </div>
              <label className="mt-3 block text-xs">
                <div className="mb-1 text-muted-foreground">调整原因</div>
                <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={2} className="w-full rounded-md border bg-background px-2 py-1.5 text-sm" />
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => save("return")} className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10">
                <RotateCcw className="h-4 w-4" /> 退回学生修改
              </button>
              <button onClick={() => save("confirm")} className="rounded-md border px-3 py-1.5 text-sm hover:border-primary">确认 AI 评分</button>
              <button onClick={() => save("adjust")} className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground">保存调整</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
