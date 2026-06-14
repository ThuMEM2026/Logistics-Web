import { createFileRoute, Link } from "@tanstack/react-router";
import { FileSpreadsheet, ArrowRight, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useStore } from "@/lib/demo-store";

export const Route = createFileRoute("/student/submissions")({ component: SubmissionsPage });

const HISTORY = [
  { id: "S-W14-002", week: 14, name: "Week 14 综合方案 v2", time: "2026-06-11 22:18", status: "AI 已批改", grade: "A", total: 86 },
  { id: "S-W14-001", week: 14, name: "Week 14 综合方案 v1", time: "2026-06-08 21:02", status: "AI 已批改 · 已退回", grade: "B", total: 72 },
  { id: "S-W08-003", week: 8,  name: "Week 8 分拣专项 v3",   time: "2026-06-05 19:55", status: "AI 已批改", grade: "A", total: 84 },
  { id: "S-W08-002", week: 8,  name: "Week 8 分拣专项 v2",   time: "2026-05-30 22:30", status: "AI 已批改", grade: "B", total: 65 },
];

function SubmissionsPage() {
  const lastScore = useStore((s) => s.lastScore);
  const simStatus = useStore((s) => s.simStatus);

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">我的提交</h1>
          <p className="mt-1 text-sm text-muted-foreground">查看历次提交记录、AI 批改结果与教师反馈。</p>
        </div>
        <Link to="/student/submit" className="inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium text-primary-foreground"
          style={{ background: "var(--gradient-hero)" }}>
          新建提交 <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Current draft */}
      <div className="rounded-2xl border bg-card p-5">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">当前草稿</div>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <div className="text-sm font-semibold">Week 8 · 仓内分拣专项练习</div>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">{simStatus === "success" ? "仿真已完成" : "仿真未运行"}</span>
          {lastScore && <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs text-success">已生成 AI 批改</span>}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link to="/student/submit" className="rounded-md border px-3 py-1.5 text-sm hover:border-primary">继续提交</Link>
          {lastScore && <Link to="/student/result" className="rounded-md border px-3 py-1.5 text-sm hover:border-primary">查看 AI 报告</Link>}
        </div>
      </div>

      {/* History */}
      <div className="mt-6 overflow-hidden rounded-2xl border bg-card">
        <div className="border-b p-4 text-sm font-semibold">历次提交记录</div>
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-2">编号</th>
              <th className="px-4 py-2">周次</th>
              <th className="px-4 py-2">提交</th>
              <th className="px-4 py-2">时间</th>
              <th className="px-4 py-2">状态</th>
              <th className="px-4 py-2">等级 / 分数</th>
            </tr>
          </thead>
          <tbody>
            {HISTORY.map((h) => {
              const Icon = h.status.includes("退回") ? AlertCircle : h.status.includes("批改") ? CheckCircle2 : Clock;
              return (
                <tr key={h.id} className="border-t">
                  <td className="px-4 py-2 font-mono text-xs">{h.id}</td>
                  <td className="px-4 py-2">Week {h.week}</td>
                  <td className="px-4 py-2 flex items-center gap-2"><FileSpreadsheet className="h-4 w-4 text-primary" />{h.name}</td>
                  <td className="px-4 py-2 text-muted-foreground">{h.time}</td>
                  <td className="px-4 py-2"><span className="inline-flex items-center gap-1 text-muted-foreground"><Icon className="h-3.5 w-3.5" /> {h.status}</span></td>
                  <td className="px-4 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${h.grade === "A" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>{h.grade}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{h.total} / 100</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
