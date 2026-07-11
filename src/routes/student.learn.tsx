import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Bot, CheckCircle2, Play, Pause, FastForward, ArrowLeft, ArrowRight, Lock } from "lucide-react";
import { KNOWLEDGE, setState, useStore } from "@/lib/demo-store";

export const Route = createFileRoute("/student/learn")({ component: LearnPage });

function LearnPage() {
  const search = Route.useSearch() as { concept?: string; fromWeek?: string | number };
  const passed = useStore((s) => s.passedQuiz);
  const requestedConcept = useMemo(
    () => KNOWLEDGE.some((k) => k.id === search.concept) ? search.concept! : KNOWLEDGE[0].id,
    [search.concept],
  );
  const fromWeek = search.fromWeek && Number.isFinite(Number(search.fromWeek)) ? String(search.fromWeek) : null;
  const directConceptMode = Boolean(search.concept);

  const [active, setActive] = useState(requestedConcept);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [quiz, setQuiz] = useState<{ open: boolean; answer: string | null }>({ open: false, answer: null });

  useEffect(() => {
    setActive(requestedConcept);
    setProgress(0);
    setPlaying(false);
  }, [requestedConcept]);

  const rawIdx = KNOWLEDGE.findIndex((k) => k.id === active);
  const idx = rawIdx >= 0 ? rawIdx : 0;
  const k = KNOWLEDGE[idx];
  const completedCount = Object.values(passed).filter(Boolean).length;
  const overall = Math.round((completedCount / KNOWLEDGE.length) * 100);

  return (
    <div>
      {fromWeek && (
        <Link
          to="/student/week/$weekId"
          params={{ weekId: fromWeek }}
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> 返回 Week {fromWeek} 学习页
        </Link>
      )}

      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold">概念学习</h1>
          <p className="mt-1 text-muted-foreground">Wafia Bakery · 通过 AI 教学视频掌握核心知识点</p>
        </div>
        <div className="flex flex-col items-end gap-3 text-right">
          <div>
            <div className="text-xs text-muted-foreground">学习进度</div>
            <div className="text-2xl font-bold text-primary">{overall}%</div>
          </div>
          <Link
            to="/student/assistant"
            search={{ from: "learn", concept: active, fromWeek, week: fromWeek, mode: "qa" }}
            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:border-primary"
          >
            <Bot className="h-4 w-4 text-primary" /> 没听懂？问 AI 助教
          </Link>
        </div>
      </div>

      <div className="mb-6 h-2 overflow-hidden rounded-full bg-secondary">
        <div className="h-full transition-all" style={{ width: `${overall}%`, background: "var(--gradient-hero)" }} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-2">
          {KNOWLEDGE.map((kk, i) => {
            const done = passed[kk.id];
            const locked = !directConceptMode && i > 0 && !passed[KNOWLEDGE[i - 1].id];
            return (
              <button
                key={kk.id}
                disabled={locked}
                onClick={() => { setActive(kk.id); setProgress(0); setPlaying(false); }}
                className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all ${active === kk.id ? "border-primary bg-accent" : "bg-card hover:border-primary/40"} ${locked ? "opacity-50" : ""}`}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${done ? "bg-success text-success-foreground" : active === kk.id ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                  {done ? <CheckCircle2 className="h-4 w-4" /> : locked ? <Lock className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{kk.name}</div>
                  <div className="text-xs text-muted-foreground">{done ? "已通过测验" : "5 分钟"}</div>
                </div>
              </button>
            );
          })}
        </aside>

        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border bg-card" style={{ boxShadow: "var(--shadow-soft)" }}>
            <div className="relative aspect-video" style={{ background: "var(--gradient-hero)" }}>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-primary-foreground">
                <div className="text-xs uppercase tracking-widest opacity-80">AI v1 通用知识视频</div>
                <div className="mt-2 text-3xl font-bold">{k.name}</div>
                <div className="mt-1 max-w-md text-center text-sm opacity-90">{k.desc}</div>
              </div>
              <button
                onClick={() => {
                  if (!playing) {
                    setPlaying(true);
                    const id = setInterval(() => {
                      setProgress((p) => {
                        if (p >= 100) { clearInterval(id); setPlaying(false); return 100; }
                        return p + 5;
                      });
                    }, 200);
                  } else setPlaying(false);
                }}
                className="absolute bottom-6 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-card/90 text-primary shadow-lg backdrop-blur"
              >
                {playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 translate-x-0.5" />}
              </button>
            </div>
            <div className="flex items-center gap-3 p-4">
              <button onClick={() => setPlaying(!playing)} className="text-muted-foreground hover:text-foreground">
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-xs text-muted-foreground">{Math.round(progress * 0.05)}:00 / 5:00</span>
              <button className="flex items-center gap-1 rounded bg-secondary px-2 py-1 text-xs"><FastForward className="h-3 w-3" /> 1.5x</button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-2xl border bg-card p-5">
              <div className="text-xs font-semibold text-primary">在 Wafia Bakery 中的体现</div>
              <p className="mt-2 text-sm">{k.embodiment}</p>
            </div>
            <div className="rounded-2xl border bg-destructive/10 p-5">
              <div className="text-xs font-semibold text-destructive">常见错误</div>
              <p className="mt-2 text-sm">{k.mistake}</p>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6">
            <h3 className="text-lg font-semibold">{k.name} · 随堂测验</h3>
            <p className="mt-1 text-sm text-muted-foreground">看完视频后，通过测验才能解锁下一关。</p>
            {!passed[k.id] ? (
              <button
                disabled={progress < 100}
                onClick={() => setQuiz({ open: true, answer: null })}
                className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                {progress < 100 ? "请先看完视频" : "开始测验"}
              </button>
            ) : (
              <div className="mt-4 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <span className="text-sm text-success">已通过</span>
                {idx < KNOWLEDGE.length - 1 ? (
                  <button onClick={() => { setActive(KNOWLEDGE[idx + 1].id); setProgress(0); }} className="ml-auto inline-flex items-center gap-1 text-sm text-primary">
                    下一知识点 <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <Link to="/student/map" className="ml-auto inline-flex items-center gap-1 text-sm text-primary">
                    进入闯关地图 <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {quiz.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" onClick={() => setQuiz({ open: false, answer: null })}>
          <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold">关于「{k.name}」</h3>
            <p className="mt-2 text-sm">下面哪项最能描述 {k.name} 的核心目标？</p>
            <div className="mt-4 space-y-2">
              {["A. 最大化单点处理速度", "B. 平衡产能利用与时效约束", "C. 仅追求最短路径", "D. 完全交由人工决策"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setQuiz({ ...quiz, answer: opt })}
                  className={`w-full rounded-lg border p-3 text-left text-sm transition-all ${quiz.answer === opt ? "border-primary bg-accent" : "hover:border-primary/40"}`}
                >
                  {opt}
                </button>
              ))}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setQuiz({ open: false, answer: null })} className="rounded-md px-3 py-1.5 text-sm text-muted-foreground">取消</button>
              <button
                disabled={!quiz.answer}
                onClick={() => {
                  const correct = quiz.answer?.startsWith("B");
                  if (correct) {
                    setState((s) => ({ passedQuiz: { ...s.passedQuiz, [k.id]: true } }));
                    setQuiz({ open: false, answer: null });
                  } else {
                    alert("回答有误，请再思考下视频中的要点。");
                  }
                }}
                className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                提交
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
