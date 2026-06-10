import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { Users, FileCheck2, TrendingUp, AlertTriangle, X } from "lucide-react";
import { GROUPS, COMMON_ERRORS } from "@/lib/demo-store";

export const Route = createFileRoute("/teacher/")({ component: Dashboard });

function Dashboard() {
  const [selected, setSelected] = useState<typeof GROUPS[number] | null>(null);

  const submitted = GROUPS.length;
  const aCount = GROUPS.filter((g) => g.grade === "A").length;
  const bCount = GROUPS.filter((g) => g.grade === "B").length;
  const avg = (GROUPS.reduce((a, b) => a + b.total, 0) / GROUPS.length).toFixed(1);

  const kpis = [
    { label: "已提交小组", value: `${submitted} / 8`, icon: Users, color: "text-primary" },
    { label: "A 类有效方案", value: aCount, icon: FileCheck2, color: "text-success" },
    { label: "B 类无效方案", value: bCount, icon: AlertTriangle, color: "text-destructive" },
    { label: "平均总分", value: avg, icon: TrendingUp, color: "text-warning-foreground" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">学情看板</h1>
        <p className="mt-1 text-muted-foreground">Wafia Bakery · Week 14 分拣配送综合作业</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="rounded-2xl border bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{k.label}</span>
                <Icon className={`h-5 w-5 ${k.color}`} />
              </div>
              <div className="mt-2 text-3xl font-bold">{k.value}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-2xl border bg-warning/10 p-4 text-sm">
        <span className="text-muted-foreground">最常见错误：</span>
        <span className="font-semibold text-warning-foreground">{COMMON_ERRORS[0].name}</span>
        <span className="ml-2 text-muted-foreground">（共出现 {COMMON_ERRORS[0].count} 次）</span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border bg-card p-6">
          <h3 className="font-semibold">共性错误 Top 5</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <BarChart data={COMMON_ERRORS} layout="vertical" margin={{ left: 12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 260)" />
                <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={170} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {COMMON_ERRORS.map((_, i) => <Cell key={i} fill={i === 0 ? "oklch(0.60 0.22 25)" : "oklch(0.55 0.20 265)"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6">
          <h3 className="font-semibold">学生提交列表</h3>
          <div className="mt-4 overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-secondary text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">小组</th>
                  <th className="px-3 py-2">等级</th>
                  <th className="px-3 py-2">总分</th>
                  <th className="px-3 py-2">硬约束</th>
                  <th className="px-3 py-2">仿真</th>
                  <th className="px-3 py-2">复核</th>
                </tr>
              </thead>
              <tbody>
                {GROUPS.map((g) => (
                  <tr key={g.id} onClick={() => setSelected(g)} className="cursor-pointer border-t hover:bg-accent">
                    <td className="px-3 py-2 font-medium">{g.name}</td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${g.grade === "A" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>{g.grade}</span>
                    </td>
                    <td className={`px-3 py-2 font-semibold ${g.total >= 80 ? "text-success" : g.total >= 60 ? "text-warning-foreground" : "text-destructive"}`}>{g.total}</td>
                    <td className="px-3 py-2">{g.issues}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{g.sim_status}</td>
                    <td className="px-3 py-2 text-xs">{g.review}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold">{selected.name}</h3>
                <p className="text-sm text-muted-foreground">主要问题：{selected.main}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-muted-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded bg-secondary p-2"><div className="text-xs text-muted-foreground">文件格式</div><div className="font-semibold">{selected.format} / 20</div></div>
              <div className="rounded bg-secondary p-2"><div className="text-xs text-muted-foreground">分拣仿真</div><div className="font-semibold">{selected.sim} / 25</div></div>
              <div className="rounded bg-secondary p-2"><div className="text-xs text-muted-foreground">配送路径</div><div className="font-semibold">{selected.vrp} / 25</div></div>
              <div className="rounded bg-secondary p-2"><div className="text-xs text-muted-foreground">协同与成本</div><div className="font-semibold">{selected.coord} / 30</div></div>
            </div>
            <div className="mt-4 rounded-lg border p-3 text-sm">
              <div className="text-xs text-muted-foreground">仿真状态</div>
              <p className="mt-1">{selected.sim_status}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
