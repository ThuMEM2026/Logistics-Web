import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ThumbsUp, MessageSquare, ExternalLink, Sparkles } from "lucide-react";
import {
  MODULE_TYPE_META, TEACHER_STATUS_META, addComment, getState, toggleLike, useStore,
} from "@/lib/demo-store";

export const Route = createFileRoute("/student/workshop/$moduleId")({
  component: WorkshopDetail,
  loader: ({ params }) => {
    const m = getState().workshop.find((x) => x.id === params.moduleId);
    if (!m) throw notFound();
    return { moduleId: params.moduleId };
  },
});

function WorkshopDetail() {
  const { moduleId } = Route.useLoaderData();
  const m = useStore((s) => s.workshop.find((x) => x.id === moduleId));
  const username = useStore((s) => s.username) || "李同学";
  const [text, setText] = useState("");
  if (!m) return null;

  const tm = MODULE_TYPE_META[m.type];
  const sm = TEACHER_STATUS_META[m.status];

  return (
    <div>
      <Link to="/student/workshop" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> 返回共创工坊
      </Link>

      <div className="mt-3 overflow-hidden rounded-2xl border bg-card" style={{ boxShadow: "var(--shadow-soft)" }}>
        <div className="flex h-48 items-center justify-center text-7xl" style={{ background: m.gradient }}>{m.cover}</div>
        <div className="p-6">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className={`rounded px-2 py-0.5 ${tm.cls}`}>{tm.label}</span>
            <Link to="/student/week/$weekId" params={{ weekId: String(m.week) }} className="rounded bg-secondary px-2 py-0.5 text-muted-foreground hover:text-foreground">Week {m.week}</Link>
            <span className={`rounded px-2 py-0.5 ${sm.cls}`}>{sm.label}</span>
          </div>
          <h1 className="mt-3 text-2xl font-bold">{m.title}</h1>
          <div className="mt-1 text-sm text-muted-foreground">{m.group} · {m.author} · {m.createdAt}</div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => toggleLike(m.id)}
              className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm ${m.liked ? "border-primary bg-primary/10 text-primary" : "hover:border-primary"}`}>
              <ThumbsUp className="h-4 w-4" /> {m.liked ? "已点赞" : "点赞"} · {m.likes}
            </button>
            <a href={m.demoUrl} className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-primary-foreground"
              style={{ background: "var(--gradient-hero)" }}>
              <ExternalLink className="h-4 w-4" /> 进入 Demo
            </a>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <Section title="解决的学习痛点">
            <p className="text-sm">{m.painPoint}</p>
          </Section>
          <Section title="模块说明">
            <p className="text-sm leading-relaxed">{m.intro}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{m.detail}</p>
            {m.usage && <p className="mt-2 text-xs text-muted-foreground">建议使用场景：{m.usage}</p>}
          </Section>
          <Section title="演示截图 / 视频">
            <div className="flex h-48 items-center justify-center rounded-lg border border-dashed bg-background/40 text-sm text-muted-foreground">
              （演示占位 · 实际由作者上传媒体）
            </div>
          </Section>

          <Section title={`评论（${m.comments.length}）`}>
            <div className="space-y-2">
              {m.comments.length === 0 && <div className="rounded-lg bg-secondary p-3 text-sm text-muted-foreground">还没有评论，欢迎留下你的使用反馈。</div>}
              {m.comments.map((c, i) => (
                <div key={i} className="rounded-lg border bg-background/40 p-3 text-sm">
                  <div className="text-xs text-muted-foreground">{c.author} · {c.at}</div>
                  <div className="mt-1">{c.text}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder="写下你的使用反馈…"
                className="flex-1 rounded-md border bg-background px-3 py-1.5 text-sm" />
              <button onClick={() => { if (text.trim()) { addComment(m.id, username, text.trim()); setText(""); } }}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-primary-foreground" style={{ background: "var(--gradient-hero)" }}>
                <MessageSquare className="inline h-4 w-4" /> 发布
              </button>
            </div>
          </Section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border bg-card p-5">
            <div className="flex items-center gap-2 text-sm font-semibold"><Sparkles className="h-4 w-4 text-primary" /> 教师审核</div>
            <div className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs ${sm.cls}`}>{sm.label}</div>
            {m.teacherNote && (
              <div className="mt-3 rounded-lg bg-accent p-3 text-sm">
                <div className="text-[11px] text-muted-foreground">教师点评</div>
                <div className="mt-1">{m.teacherNote}</div>
              </div>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              {m.status === "recommended" || m.status === "adopted"
                ? `本模块已挂载到 Week ${m.week} 的「推荐共创模块」区域。`
                : "审核通过后将自动出现在对应教学周的推荐区。"}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}
