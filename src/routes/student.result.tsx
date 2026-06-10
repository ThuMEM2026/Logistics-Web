import { createFileRoute, Link } from "@tanstack/react-router";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { CheckCircle2, AlertTriangle, XCircle, FileSearch, Lightbulb, RefreshCw, Sparkles, BookOpen } from "lucide-react";
import { useStore } from "@/lib/demo-store";

export const Route = createFileRoute("/student/result")({ component: ResultPage });

function ResultPage() {
  const score = useStore((s) => s.lastScore);

  if (!score) {
    return (
      <div className="rounded-2xl border bg-card p-12 text-center">
        <h2 className="text-xl font-semibold">还没有批改结果</h2>
        <p className="mt-2 text-muted-foreground">请先到「方案提交」页面上传文件、运行仿真并提交。</p>
        <Link to="/student/submit" className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">去提交</Link>
      </div>
    );
  }

  const data = [
    { dim: "文件格式", v: score.format, full: 20 },
    { dim: "分拣仿真", v: score.sim, full: 25 },
    { dim: "配送路径", v: score.vrp, full: 25 },
    { dim: "协同与成本", v: score.coord, full: 30 },
  ];
  const color = score.grade === "A" ? "text-success" : "text-destructive";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI 批改报告</h1>
        <p className="mt-1 text-muted-foreground">Wafia Bakery · Week 14 分拣配送综合作业</p>
      </div>

      {/* 1. 批改总览 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="rounded-2xl border bg-card p-6" style={{ boxShadow: "var(--shadow-soft)" }}>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">批改总览</div>
          <div className="mt-2 flex items-baseline gap-3">
            <div className={`text-6xl font-black ${color}`}>{score.total}</div>
            <div className="text-muted-foreground">/ 100</div>
            <span className={`ml-auto rounded-full px-3 py-1 text-sm font-semibold ${score.grade === "A" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
              方案等级 {score.grade}
            </span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{score.summary}</p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            {data.map((d) => (
              <div key={d.dim} className="rounded-lg bg-secondary p-3">
                <div className="text-muted-foreground">{d.dim}</div>
                <div className="mt-1 text-lg font-semibold">{d.v}<span className="text-xs text-muted-foreground"> / {d.full}</span></div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6">
          <h3 className="font-semibold">四维评分雷达图</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <RadarChart data={data}>
                <PolarGrid stroke="oklch(0.9 0.01 260)" />
                <PolarAngleAxis dataKey="dim" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 30]} tick={{ fontSize: 10 }} />
                <Radar dataKey="v" stroke="oklch(0.55 0.20 265)" fill="oklch(0.55 0.20 265)" fillOpacity={0.35} />
                <Radar dataKey="full" stroke="oklch(0.85 0.04 260)" fill="transparent" strokeDasharray="3 3" />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. Hard constraints */}
      <div className="rounded-2xl border bg-card p-6">
        <h3 className="font-semibold">硬约束检查</h3>
        <div className="mt-4 overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left text-xs uppercase text-muted-foreground">
              <tr><th className="px-3 py-2">规则</th><th className="px-3 py-2">检查结果</th><th className="px-3 py-2">说明</th></tr>
            </thead>
            <tbody>
              {score.constraints.map((c, i) => {
                const meta = c.result === "pass"
                  ? { Icon: CheckCircle2, cls: "text-success", label: "通过" }
                  : c.result === "risk"
                  ? { Icon: AlertTriangle, cls: "text-warning-foreground", label: "风险" }
                  : { Icon: XCircle, cls: "text-destructive", label: "未通过" };
                const I = meta.Icon;
                return (
                  <tr key={i} className="border-t">
                    <td className="px-3 py-2">{c.rule}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center gap-1 ${meta.cls}`}>
                        <I className="h-4 w-4" /> {meta.label}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{c.detail}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Evidence + 5. Problems */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="rounded-2xl border bg-card p-6">
          <h3 className="flex items-center gap-2 font-semibold"><FileSearch className="h-4 w-4 text-primary" /> 文件与仿真证据</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {score.evidence.map((e, i) => (
              <li key={i} className="rounded-lg bg-secondary px-3 py-2 text-foreground/90">{e}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border bg-card p-6">
          <h3 className="font-semibold">问题定位</h3>
          <div className="mt-3 space-y-3">
            {score.problems.map((p, i) => (
              <div key={i} className="rounded-xl border bg-background/40 p-4">
                <div className="flex items-start gap-2">
                  <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">问题 {i + 1}</span>
                  <div className="text-sm font-semibold">{p.title}</div>
                </div>
                <div className="mt-2 space-y-1 text-sm">
                  <div><span className="text-muted-foreground">位置：</span><code className="rounded bg-secondary px-1 text-xs">{p.location}</code></div>
                  <div><span className="text-muted-foreground">系统判断：</span>{p.judge}</div>
                  <div><span className="text-muted-foreground">影响：</span>{p.impact}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Suggestions */}
      <div className="rounded-2xl border bg-card p-6">
        <h3 className="flex items-center gap-2 font-semibold"><Lightbulb className="h-4 w-4 text-warning-foreground" /> 修改建议</h3>
        <ul className="mt-3 space-y-2 text-sm">
          {score.suggestions.map((s, i) => (
            <li key={i} className="rounded-lg bg-warning/10 px-3 py-2">{s}</li>
          ))}
        </ul>
      </div>

      {/* Recommendations */}
      <div className="overflow-hidden rounded-2xl border" style={{ boxShadow: "var(--shadow-glow)" }}>
        <div className="p-6" style={{ background: "var(--gradient-hero)" }}>
          <div className="flex items-center gap-2 text-sm text-primary-foreground/90">
            <Sparkles className="h-4 w-4" /> 个性化学习推荐
          </div>
          <p className="mt-2 text-primary-foreground">
            根据本次批改结果，建议优先复习：{score.recommend.join(" 和 ")}。
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 bg-card p-5 sm:grid-cols-2">
          {score.recommend.map((r) => (
            <Link key={r} to="/student/learn" className="flex items-center gap-3 rounded-lg border p-3 hover:border-primary">
              <BookOpen className="h-5 w-5 text-primary" />
              <div className="text-sm font-medium">{r}</div>
            </Link>
          ))}
        </div>
      </div>

      <Link
        to="/student/submit"
        className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-primary-foreground"
        style={{ background: "var(--gradient-hero)" }}
      >
        <RefreshCw className="h-4 w-4" /> 修改后重新提交
      </Link>
    </div>
  );
}
