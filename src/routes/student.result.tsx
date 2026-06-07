import { createFileRoute, Link } from "@tanstack/react-router";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { AlertTriangle, AlertCircle, Info, Play, RefreshCw, Sparkles } from "lucide-react";
import { useStore } from "@/lib/demo-store";

export const Route = createFileRoute("/student/result")({ component: ResultPage });

const sevMap = {
  high: { color: "text-destructive", bg: "bg-destructive/10", icon: AlertTriangle, label: "严重" },
  mid: { color: "text-warning-foreground", bg: "bg-warning/20", icon: AlertCircle, label: "中等" },
  low: { color: "text-muted-foreground", bg: "bg-secondary", icon: Info, label: "提示" },
} as const;

function ResultPage() {
  const score = useStore((s) => s.lastScore);

  if (!score) {
    return (
      <div className="rounded-2xl border bg-card p-12 text-center">
        <h2 className="text-xl font-semibold">还没有批改结果</h2>
        <p className="mt-2 text-muted-foreground">请先到「方案提交」页面上传并提交方案。</p>
        <Link to="/student/submit" className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">去提交</Link>
      </div>
    );
  }

  const data = [
    { dim: "代码检查", v: score.code, full: 30 },
    { dim: "格式校验", v: score.format, full: 20 },
    { dim: "仿真验证", v: score.sim, full: 20 },
    { dim: "协调评分", v: score.coord, full: 30 },
  ];
  const color = score.total >= 80 ? "text-success" : score.total >= 60 ? "text-warning-foreground" : "text-destructive";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">AI 批改报告</h1>
        <p className="mt-1 text-muted-foreground">Wafia Bakery · 第 v1.2 次提交</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="rounded-2xl border bg-card p-6 text-center" style={{ boxShadow: "var(--shadow-soft)" }}>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">累计得分</div>
          <div className={`mt-2 text-7xl font-black ${color}`}>{score.total}<span className="text-2xl text-muted-foreground">/100</span></div>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs">
            <Sparkles className="h-3 w-3 text-primary" /> 较上次 +4 分
          </div>
          <div className="mt-6 grid grid-cols-2 gap-2 text-left text-xs">
            {data.map((d) => (
              <div key={d.dim} className="rounded-lg bg-secondary p-3">
                <div className="text-muted-foreground">{d.dim}</div>
                <div className="mt-1 text-base font-semibold">{d.v}<span className="text-xs text-muted-foreground"> / {d.full}</span></div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6">
          <h3 className="font-semibold">四维度雷达图</h3>
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

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border bg-card p-6">
          <h3 className="font-semibold">问题列表 · 按严重程度</h3>
          <div className="mt-4 space-y-3">
            {score.issues.map((iss, i) => {
              const s = sevMap[iss.severity];
              const Icon = s.icon;
              return (
                <div key={i} className={`rounded-xl border p-4 ${s.bg}`}>
                  <div className="flex items-start gap-3">
                    <Icon className={`mt-0.5 h-5 w-5 ${s.color}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className={`text-sm font-semibold ${s.color}`}>{iss.title}</div>
                        <span className="rounded-full bg-card px-2 py-0.5 text-xs">扣 {iss.deduct} 分</span>
                      </div>
                      <div className="mt-2 text-sm"><span className="text-muted-foreground">影响：</span>{iss.reason}</div>
                      <div className="mt-1 text-sm"><span className="text-muted-foreground">建议：</span>{iss.suggest}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border" style={{ boxShadow: "var(--shadow-glow)" }}>
            <div className="relative aspect-video" style={{ background: "var(--gradient-hero)" }}>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-primary-foreground">
                <div className="rounded-full bg-card/20 px-3 py-1 text-xs backdrop-blur">AI v2 · 针对性教学</div>
                <div className="mt-3 text-xl font-bold">薄弱点：笼车装载约束</div>
                <button className="mt-4 flex h-12 w-12 items-center justify-center rounded-full bg-card text-primary">
                  <Play className="h-5 w-5 translate-x-0.5" />
                </button>
              </div>
            </div>
            <div className="bg-card p-4">
              <div className="text-sm font-medium">基于你的方案，AI 检测出 1 个高频薄弱点</div>
              <p className="mt-1 text-xs text-muted-foreground">为你定制了 4 分钟讲解视频与 2 道针对性练习。</p>
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
      </div>
    </div>
  );
}
