import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, ThumbsUp, MessageSquare, Sparkles } from "lucide-react";
import {
  MODULE_TYPE_META, TEACHER_STATUS_META, WEEKS, addWorkshopModule, useStore,
  type ModuleType, type TeacherStatus, type WorkshopModule,
} from "@/lib/demo-store";

export const Route = createFileRoute("/student/workshop")({ component: WorkshopList });

const TYPE_OPTIONS: { v: ModuleType | "all"; label: string }[] = [
  { v: "all", label: "全部类型" },
  { v: "animation", label: "教学动画" },
  { v: "tool", label: "训练工具" },
  { v: "challenge", label: "闯关 Demo" },
  { v: "prompt", label: "Prompt / Agent" },
];

const STATUS_OPTIONS: { v: TeacherStatus | "all"; label: string }[] = [
  { v: "all", label: "全部状态" },
  { v: "pending", label: "待审核" },
  { v: "recommended", label: "已推荐" },
  { v: "adopted", label: "已纳入" },
  { v: "needs_revision", label: "需要修改" },
];

function WorkshopList() {
  const modules = useStore((s) => s.workshop);
  const username = useStore((s) => s.username);
  const [week, setWeek] = useState<number | "all">("all");
  const [type, setType] = useState<ModuleType | "all">("all");
  const [status, setStatus] = useState<TeacherStatus | "all">("all");
  const [sort, setSort] = useState<"hot" | "new">("hot");
  const [q, setQ] = useState("");
  const [openUpload, setOpenUpload] = useState(false);

  const list = useMemo(() => {
    let r = modules.slice();
    if (week !== "all") r = r.filter((m) => m.week === week);
    if (type !== "all") r = r.filter((m) => m.type === type);
    if (status !== "all") r = r.filter((m) => m.status === status);
    if (q.trim()) {
      const k = q.toLowerCase();
      r = r.filter((m) => m.title.toLowerCase().includes(k) || m.painPoint.toLowerCase().includes(k));
    }
    r.sort((a, b) => sort === "hot" ? b.likes - a.likes : b.createdAt.localeCompare(a.createdAt));
    return r;
  }, [modules, week, type, status, q, sort]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Vibe Coding 共创工坊
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            学生用 Vibe Coding 做出来的教学动画、训练工具、闯关 Demo、Prompt 模板会在这里沉淀；教师审核通过后自动出现在对应教学周。
          </p>
        </div>
        <button onClick={() => setOpenUpload(true)} className="inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium text-primary-foreground"
          style={{ background: "var(--gradient-hero)" }}>
          <Plus className="h-4 w-4" /> 上传共创模块
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border bg-card p-4">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
          <Select label="教学周" value={String(week)} onChange={(v) => setWeek(v === "all" ? "all" : Number(v))}
            options={[{ value: "all", label: "全部周次" }, ...WEEKS.map((w) => ({ value: String(w.id), label: `Week ${w.id}` }))]} />
          <Select label="模块类型" value={type} onChange={(v) => setType(v as ModuleType | "all")}
            options={TYPE_OPTIONS.map((o) => ({ value: o.v, label: o.label }))} />
          <Select label="教师状态" value={status} onChange={(v) => setStatus(v as TeacherStatus | "all")}
            options={STATUS_OPTIONS.map((o) => ({ value: o.v, label: o.label }))} />
          <Select label="排序" value={sort} onChange={(v) => setSort(v as "hot" | "new")}
            options={[{ value: "hot", label: "按热度" }, { value: "new", label: "按最新" }]} />
          <label className="block">
            <div className="text-xs text-muted-foreground">搜索</div>
            <div className="relative mt-1">
              <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="标题或痛点关键词"
                className="w-full rounded-md border bg-background py-1.5 pl-7 pr-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </label>
        </div>
      </div>

      {/* Cards */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((m) => <Card key={m.id} m={m} />)}
        {list.length === 0 && (
          <div className="col-span-full rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">
            没有符合筛选条件的模块。
          </div>
        )}
      </div>

      {openUpload && <UploadDialog onClose={() => setOpenUpload(false)} username={username || "李同学"} />}
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <label className="block">
      <div className="text-xs text-muted-foreground">{label}</div>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border bg-background px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

function Card({ m }: { m: WorkshopModule }) {
  const tm = MODULE_TYPE_META[m.type];
  const sm = TEACHER_STATUS_META[m.status];
  return (
    <Link to="/student/workshop/$moduleId" params={{ moduleId: m.id }}
      className="overflow-hidden rounded-2xl border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative flex h-32 items-center justify-center text-5xl" style={{ background: m.gradient }}>
        <span>{m.cover}</span>
        <span className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] ${sm.cls}`}>{sm.label}</span>
      </div>
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className={`rounded px-1.5 py-0.5 ${tm.cls}`}>{tm.label}</span>
          <span className="rounded bg-secondary px-1.5 py-0.5 text-muted-foreground">Week {m.week}</span>
        </div>
        <h3 className="mt-2 text-sm font-semibold leading-snug">{m.title}</h3>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{m.intro}</p>
        <p className="mt-1.5 line-clamp-1 text-[11px] text-muted-foreground">解决：{m.painPoint}</p>
        <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>{m.group} · {m.author}</span>
          <span className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1"><ThumbsUp className="h-3 w-3" />{m.likes}</span>
            <span className="inline-flex items-center gap-1"><MessageSquare className="h-3 w-3" />{m.comments.length}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

function UploadDialog({ onClose, username }: { onClose: () => void; username: string }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ModuleType>("tool");
  const [week, setWeek] = useState(8);
  const [pain, setPain] = useState("");
  const [intro, setIntro] = useState("");
  const [detail, setDetail] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [usage, setUsage] = useState("");
  const [group, setGroup] = useState("Group X");
  const [submitted, setSubmitted] = useState(false);

  const submit = () => {
    if (!title.trim()) return;
    addWorkshopModule({
      title, type, week, painPoint: pain || "未填写", intro: intro || "（暂无简介）",
      detail: detail || "（暂无详细说明）", cover: "✨", author: username, group,
      demoUrl: demoUrl || "#", usage,
    });
    setSubmitted(true);
    setTimeout(onClose, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold">上传共创模块</h3>
        <p className="mt-1 text-xs text-muted-foreground">提交后将进入「待审核」状态，由教师审核并决定是否推荐到对应教学周。</p>

        {submitted ? (
          <div className="mt-6 rounded-xl border bg-success/10 p-6 text-center text-success">
            ✓ 已提交，正在等待教师审核
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <Field label="模块标题"><input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-md border bg-background px-2 py-1.5 text-sm" placeholder="例如：Sorting Wave 可视化动画" /></Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="模块类型">
                <select value={type} onChange={(e) => setType(e.target.value as ModuleType)} className="w-full rounded-md border bg-background px-2 py-1.5 text-sm">
                  <option value="animation">教学动画</option>
                  <option value="tool">训练工具</option>
                  <option value="challenge">闯关 Demo</option>
                  <option value="prompt">Prompt / Agent</option>
                </select>
              </Field>
              <Field label="适用教学周">
                <select value={week} onChange={(e) => setWeek(Number(e.target.value))} className="w-full rounded-md border bg-background px-2 py-1.5 text-sm">
                  {WEEKS.map((w) => <option key={w.id} value={w.id}>Week {w.id}</option>)}
                </select>
              </Field>
              <Field label="作者 / 小组"><input value={group} onChange={(e) => setGroup(e.target.value)} className="w-full rounded-md border bg-background px-2 py-1.5 text-sm" /></Field>
            </div>
            <Field label="解决的学习痛点"><input value={pain} onChange={(e) => setPain(e.target.value)} className="w-full rounded-md border bg-background px-2 py-1.5 text-sm" placeholder="同学最容易卡住的地方" /></Field>
            <Field label="模块简介"><input value={intro} onChange={(e) => setIntro(e.target.value)} className="w-full rounded-md border bg-background px-2 py-1.5 text-sm" /></Field>
            <Field label="模块说明（详细）"><textarea value={detail} onChange={(e) => setDetail(e.target.value)} rows={4} className="w-full rounded-md border bg-background px-2 py-1.5 text-sm" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Demo 链接"><input value={demoUrl} onChange={(e) => setDemoUrl(e.target.value)} className="w-full rounded-md border bg-background px-2 py-1.5 text-sm" placeholder="https://..." /></Field>
              <Field label="使用说明（简要）"><input value={usage} onChange={(e) => setUsage(e.target.value)} className="w-full rounded-md border bg-background px-2 py-1.5 text-sm" placeholder="建议在哪个环节使用" /></Field>
            </div>
            <Field label="演示截图（占位）">
              <div className="flex h-20 items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">点击上传截图（演示，未真实保存）</div>
            </Field>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={onClose} className="rounded-md border px-3 py-1.5 text-sm">取消</button>
              <button onClick={submit} className="rounded-md px-4 py-1.5 text-sm font-medium text-primary-foreground" style={{ background: "var(--gradient-hero)" }}>提交</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs text-muted-foreground">{label}</div>
      {children}
    </label>
  );
}
