import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Edit3 } from "lucide-react";

export const Route = createFileRoute("/teacher/review")({ component: Review });

interface Row { id: string; name: string; code: number; format: number; sim: number; coord: number; total: number; confirmed: boolean; }
const initial: Row[] = [
  { id: "S101", name: "张子涵", code: 28, format: 19, sim: 18, coord: 27, total: 92, confirmed: false },
  { id: "S102", name: "李梓萱", code: 26, format: 18, sim: 16, coord: 26, total: 86, confirmed: false },
  { id: "S103", name: "王梓豪", code: 24, format: 17, sim: 14, coord: 23, total: 78, confirmed: false },
  { id: "S104", name: "陈思远", code: 20, format: 13, sim: 12, coord: 20, total: 65, confirmed: false },
  { id: "S105", name: "刘嘉怡", code: 18, format: 12, sim: 11, coord: 17, total: 58, confirmed: false },
];

function Review() {
  const [rows, setRows] = useState(initial);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<string | null>(null);

  const toggle = (id: string) => {
    setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const confirmBatch = () => {
    setRows((rs) => rs.map((r) => selected.has(r.id) ? { ...r, confirmed: true } : r));
    setSelected(new Set());
  };
  const updateScore = (id: string, key: keyof Row, val: number) => {
    setRows((rs) => rs.map((r) => {
      if (r.id !== id) return r;
      const next = { ...r, [key]: val } as Row;
      next.total = next.code + next.format + next.sim + next.coord;
      return next;
    }));
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI 复核</h1>
          <p className="mt-1 text-muted-foreground">查看 AI 自动评分、调整可疑维度、批量确认。</p>
        </div>
        <button
          disabled={selected.size === 0}
          onClick={confirmBatch}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          <Check className="h-4 w-4" /> 批量确认 ({selected.size})
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="w-10 px-4 py-3"><input type="checkbox" onChange={(e) => setSelected(e.target.checked ? new Set(rows.map((r) => r.id)) : new Set())} /></th>
              <th className="px-4 py-3">学生</th>
              <th className="px-4 py-3">代码</th>
              <th className="px-4 py-3">格式</th>
              <th className="px-4 py-3">仿真</th>
              <th className="px-4 py-3">协调</th>
              <th className="px-4 py-3">总分</th>
              <th className="px-4 py-3">状态</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-3"><input type="checkbox" checked={selected.has(r.id)} onChange={() => toggle(r.id)} /></td>
                <td className="px-4 py-3">
                  <div className="font-medium">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.id}</div>
                </td>
                {(["code", "format", "sim", "coord"] as const).map((k) => (
                  <td key={k} className="px-4 py-3">
                    {editing === r.id ? (
                      <input type="number" value={r[k] as number} onChange={(e) => updateScore(r.id, k, Number(e.target.value))} className="w-16 rounded border bg-background px-2 py-1 text-sm" />
                    ) : (
                      <span>{r[k]}</span>
                    )}
                  </td>
                ))}
                <td className="px-4 py-3 font-semibold text-primary">{r.total}</td>
                <td className="px-4 py-3">
                  {r.confirmed ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs text-success"><Check className="h-3 w-3" /> 已确认</span>
                  ) : (
                    <span className="rounded-full bg-warning/20 px-2 py-0.5 text-xs text-warning-foreground">待确认</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => setEditing(editing === r.id ? null : r.id)} className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground">
                    <Edit3 className="h-3.5 w-3.5" /> {editing === r.id ? "完成" : "修改"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
