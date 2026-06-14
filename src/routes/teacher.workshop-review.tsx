import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ThumbsUp, MessageSquare, Sparkles, CheckCircle2, XCircle, ArrowUpCircle, ClipboardCheck } from "lucide-react";
import {
  MODULE_TYPE_META, TEACHER_STATUS_META, updateModuleStatus, useStore,
  type TeacherStatus,
} from "@/lib/demo-store";

export const Route = createFileRoute("/teacher/workshop-review")({ component: WorkshopReview });

const FILTERS: { v: TeacherStatus | "all"; label: string }[] = [
  { v: "all", label: "全部" },
  { v: "pending", label: "待审核" },
  { v: "recommended", label: "已推荐" },
  { v: "adopted", label: "已纳入" },
  { v: "needs_revision", label: "需要修改" },
];

function WorkshopReview() {
  const modules = useStore((s) => s.workshop);
  const [filter, setFilter] = useState<TeacherStatus | "all">("pending");
  const [openNote, setOpenNote] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const list = useMemo(() => modules.filter((m) => filter === "all" || m.status === filter), [modules, filter]);
  const counts = useMemo(() => ({
    pending:        modules.filter((m) => m.status === "pending").length,
    recommended:    modules.filter((m) => m.status === "recommended").length,
    adopted:        modules.filter((m) => m.status === "adopted").length,
    needs_revision: modules.filter((m) => m.status === "needs_revision").length,
  }), [modules]);

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold flex items-center gap-2"><ClipboardCheck className="h-5 w-5 text-primary" /> 学生共创审核</h1>
        <p className="mt-1 text-sm text-muted-foreground">审核学生通过 Vibe Coding 提交的教学动画 / 训练工具 / 闯关 Demo / Prompt，标记后会自动回流到对应教学周。</p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { k: "待审核", v: counts.pending, cls: "text-warning-foreground bg-warning/15" },
          { k: "已推荐", v: counts.recommended, cls: "text-success bg-success/15" },
          { k: "已纳入课程资源", v: counts.adopted, cls: "text-primary bg-primary/15" },
          { k: "需要修改", v: counts.needs_revision, cls: "text-destructive bg-destructive/15" },
        ].map((s) => (
          <div key={s.k} className="rounded-2xl border bg-card p-4">
            <div className="text-xs text-muted-foreground">{s.k}</div>
            <div className={`mt-1 inline-block rounded px-2 py-0.5 text-2xl font-bold ${s.cls}`}>{s.v}</div>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button key={f.v} onClick={() => setFilter(f.v)}
            className={`rounded-full border px-3 py-1 text-xs ${filter === f.v ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary"}`}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {list.map((m) => {
          const tm = MODULE_TYPE_META[m.type];
          const sm = TEACHER_STATUS_META[m.status];
          return (
            <div key={m.id} className="rounded-2xl border bg-card p-4">
              <div className="flex flex-wrap items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl text-3xl" style={{ background: m.gradient }}>{m.cover}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className={`rounded px-1.5 py-0.5 ${tm.cls}`}>{tm.label}</span>
                    <span className="rounded bg-secondary px-1.5 py-0.5 text-muted-foreground">Week {m.week}</span>
                    <span className={`rounded px-1.5 py-0.5 ${sm.cls}`}>{sm.label}</span>
                    <span className="text-muted-foreground">{m.group} · {m.author} · {m.createdAt}</span>
                  </div>
                  <div className="mt-1.5 text-sm font-semibold">{m.title}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{m.intro}</div>
                  <div className="mt-1 text-[11px] text-muted-foreground">解决：{m.painPoint}</div>
                  {m.teacherNote && <div className="mt-2 rounded-lg bg-accent px-2 py-1 text-xs">教师点评：{m.teacherNote}</div>}
                  <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><ThumbsUp className="h-3 w-3" />{m.likes}</span>
                    <span className="inline-flex items-center gap-1"><MessageSquare className="h-3 w-3" />{m.comments.length}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Action label="标记已推荐" Icon={Sparkles} onClick={() => updateModuleStatus(m.id, "recommended")} />
                  <Action label="纳入课程资源" Icon={ArrowUpCircle} onClick={() => updateModuleStatus(m.id, "adopted")} primary />
                  <Action label="需要修改" Icon={XCircle} onClick={() => updateModuleStatus(m.id, "needs_revision")} danger />
                  <Action label="点评" Icon={CheckCircle2} onClick={() => { setOpenNote(m.id); setNote(m.teacherNote ?? ""); }} />
                </div>
              </div>
            </div>
          );
        })}
        {list.length === 0 && <div className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">无符合条件的模块。</div>}
      </div>

      {openNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4" onClick={() => setOpenNote(null)}>
          <div className="w-full max-w-md rounded-2xl border bg-card p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold">教师点评</h3>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4}
              className="mt-3 w-full rounded-md border bg-background px-2 py-1.5 text-sm" placeholder="留下对该共创模块的反馈…" />
            <div className="mt-3 flex justify-end gap-2">
              <button onClick={() => setOpenNote(null)} className="rounded-md border px-3 py-1.5 text-sm">取消</button>
              <button onClick={() => { const m = modules.find((x) => x.id === openNote); if (m) updateModuleStatus(m.id, m.status, note); setOpenNote(null); }}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-primary-foreground" style={{ background: "var(--gradient-hero)" }}>
                保存点评
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Action({ label, Icon, onClick, primary, danger }: { label: string; Icon: typeof Sparkles; onClick: () => void; primary?: boolean; danger?: boolean }) {
  const cls = primary
    ? "border-primary bg-primary/10 text-primary hover:bg-primary/15"
    : danger
    ? "border-destructive/40 text-destructive hover:bg-destructive/10"
    : "hover:border-primary";
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs ${cls}`}>
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}
