import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import { Users, FileCheck2, TrendingUp, Target, X } from "lucide-react";

export const Route = createFileRoute("/teacher/")({ component: Dashboard });

const dist = [
  { range: "0-60", count: 3 }, { range: "60-70", count: 8 },
  { range: "70-80", count: 15 }, { range: "80-90", count: 14 }, { range: "90-100", count: 6 },
];
const dims = [
  { dim: "代码检查", avg: 24.5, full: 30 },
  { dim: "格式校验", avg: 17.2, full: 20 },
  { dim: "仿真验证", avg: 14.1, full: 20 },
  { dim: "协调评分", avg: 22.8, full: 30 },
];
const errors = [
  { name: "VRP 未考虑时间窗", count: 18 },
  { name: "笼车超载未约束", count: 14 },
  { name: "Excel 模板字段缺失", count: 11 },
  { name: "波次划分不合理", count: 9 },
  { name: "仿真截图不完整", count: 6 },
];
const students = [
  { id: "S101", name: "张子涵", score: 92, status: "已批改" },
  { id: "S102", name: "李梓萱", score: 86, status: "已批改" },
  { id: "S103", name: "王梓豪", score: 78, status: "已批改" },
  { id: "S104", name: "陈思远", score: 65, status: "待复核" },
  { id: "S105", name: "刘嘉怡", score: 58, status: "待复核" },
];

function Dashboard() {
  const [selectedStudent, setSelectedStudent] = useState<typeof students[number] | null>(null);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">学情看板</h1>
        <p className="mt-1 text-muted-foreground">Wafia Bakery · 配送管理课程 · 第 3 次作业</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "总学生数", value: "46", icon: Users, color: "text-primary" },
          { label: "已提交", value: "42", icon: FileCheck2, color: "text-success" },
          { label: "平均分", value: "78.4", icon: TrendingUp, color: "text-warning-foreground" },
          { label: "通过率", value: "91%", icon: Target, color: "text-chart-5" },
        ].map((k) => {
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

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6">
          <h3 className="font-semibold">班级成绩分布</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <BarChart data={dist}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 260)" />
                <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {dist.map((d, i) => (
                    <Cell key={i} fill={d.range === "0-60" ? "oklch(0.60 0.22 25)" : d.range === "90-100" ? "oklch(0.65 0.17 150)" : "oklch(0.55 0.20 265)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6">
          <h3 className="font-semibold">四维度平均得分</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <RadialBarChart innerRadius="30%" outerRadius="100%" data={dims} startAngle={90} endAngle={-270}>
                <PolarAngleAxis type="number" domain={[0, 30]} tick={false} />
                <RadialBar dataKey="avg" cornerRadius={8} background>
                  {dims.map((_, i) => <Cell key={i} fill={`oklch(0.55 0.20 265 / ${1 - i * 0.18})`} />)}
                </RadialBar>
                <Tooltip />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            {dims.map((d) => (
              <div key={d.dim} className="flex justify-between rounded bg-secondary px-2 py-1">
                <span>{d.dim}</span><span className="font-medium">{d.avg}/{d.full}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-2xl border bg-card p-6">
          <h3 className="font-semibold">共性错误 Top 5</h3>
          <ol className="mt-4 space-y-2">
            {errors.map((e, i) => (
              <li key={e.name} className="flex items-center gap-3 rounded-lg bg-secondary p-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</span>
                <span className="flex-1 text-sm">{e.name}</span>
                <span className="text-sm font-semibold text-destructive">{e.count} 人</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-2xl border bg-card p-6">
          <h3 className="font-semibold">学生提交列表</h3>
          <div className="mt-4 overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-secondary text-left text-xs text-muted-foreground">
                <tr><th className="px-3 py-2">学号</th><th className="px-3 py-2">姓名</th><th className="px-3 py-2">分数</th><th className="px-3 py-2">状态</th></tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} onClick={() => setSelectedStudent(s)} className="cursor-pointer border-t hover:bg-accent">
                    <td className="px-3 py-2 text-muted-foreground">{s.id}</td>
                    <td className="px-3 py-2 font-medium">{s.name}</td>
                    <td className={`px-3 py-2 font-semibold ${s.score >= 80 ? "text-success" : s.score >= 60 ? "text-warning-foreground" : "text-destructive"}`}>{s.score}</td>
                    <td className="px-3 py-2"><span className={`rounded-full px-2 py-0.5 text-xs ${s.status === "已批改" ? "bg-success/10 text-success" : "bg-warning/20 text-warning-foreground"}`}>{s.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" onClick={() => setSelectedStudent(null)}>
          <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold">{selectedStudent.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedStudent.id} · Wafia Bakery</p>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="text-muted-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-4 rounded-xl bg-secondary p-4 text-center">
              <div className="text-xs text-muted-foreground">总分</div>
              <div className="text-4xl font-bold text-primary">{selectedStudent.score}</div>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">代码检查</span><span className="font-medium">{Math.round(selectedStudent.score * 0.3)} / 30</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">格式校验</span><span className="font-medium">{Math.round(selectedStudent.score * 0.2)} / 20</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">仿真验证</span><span className="font-medium">{Math.round(selectedStudent.score * 0.2)} / 20</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">协调评分</span><span className="font-medium">{Math.round(selectedStudent.score * 0.3)} / 30</span></div>
            </div>
            <div className="mt-4 rounded-lg border p-3 text-sm">
              <div className="text-xs text-muted-foreground">AI 反馈摘要</div>
              <p className="mt-1">VRP 路径合理，但波次划分存在轻微不均；建议在协调阶段引入容量松弛约束。</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
