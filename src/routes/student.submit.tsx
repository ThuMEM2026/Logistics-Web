import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Upload, FileCode, FileSpreadsheet, FileText, Image as ImageIcon, FileBox, CheckCircle2, X, Loader2 } from "lucide-react";
import { makeMockScore, setState, useStore } from "@/lib/demo-store";

export const Route = createFileRoute("/student/submit")({ component: SubmitPage });

const REQUIRED = [
  { key: "py", label: "Python 代码", ext: ".py", icon: FileCode },
  { key: "xlsx", label: "Excel 数据", ext: ".xlsx", icon: FileSpreadsheet },
  { key: "docx", label: "方案说明", ext: ".docx", icon: FileText },
  { key: "html", label: "HTML 可视化", ext: ".html", icon: FileBox },
  { key: "png", label: "RALC 仿真截图", ext: ".png", icon: ImageIcon },
];

function SubmitPage() {
  const files = useStore((s) => s.uploadedFiles);
  const [dragging, setDragging] = useState(false);
  const [grading, setGrading] = useState(false);
  const router = useRouter();

  const addMockFile = (label: string, ext: string) => {
    const name = `wafia_${label}_v1${ext}`;
    if (files.some((f) => f.name === name)) return;
    setState((s) => ({ uploadedFiles: [...s.uploadedFiles, { name, size: `${(Math.random() * 200 + 30).toFixed(1)} KB`, type: ext }] }));
  };
  const remove = (n: string) => setState((s) => ({ uploadedFiles: s.uploadedFiles.filter((f) => f.name !== n) }));

  const allUploaded = REQUIRED.every((r) => files.some((f) => f.type === r.ext));

  const submit = () => {
    setGrading(true);
    setTimeout(() => {
      setState({ lastScore: makeMockScore(), unlockedLevel: 3 });
      setGrading(false);
      router.navigate({ to: "/student/result" });
    }, 1800);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">方案设计与提交</h1>
        <p className="mt-1 text-muted-foreground">请上传 5 类必交文件，系统将自动进行格式预检。</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); REQUIRED.forEach((r) => addMockFile(r.label, r.ext)); }}
            className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-all ${dragging ? "border-primary bg-accent" : "border-border bg-card"}`}
          >
            <Upload className="h-12 w-12 text-primary" />
            <div className="mt-4 text-lg font-semibold">拖拽文件到此处上传</div>
            <div className="mt-1 text-sm text-muted-foreground">或者点击下方按钮逐个添加（演示）</div>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {REQUIRED.map((r) => {
                const Icon = r.icon;
                const done = files.some((f) => f.type === r.ext);
                return (
                  <button
                    key={r.key}
                    onClick={() => addMockFile(r.label, r.ext)}
                    disabled={done}
                    className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs transition-all ${done ? "border-success bg-success/10 text-success" : "bg-card hover:border-primary"}`}
                  >
                    {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                    {r.label} <span className="text-muted-foreground">{r.ext}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <h3 className="font-semibold">已上传文件</h3>
            {files.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">尚未上传任何文件</p>
            ) : (
              <ul className="mt-3 divide-y">
                {files.map((f) => (
                  <li key={f.name} className="flex items-center gap-3 py-2.5">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{f.name}</div>
                      <div className="text-xs text-muted-foreground">{f.size} · 格式预检通过</div>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <button onClick={() => remove(f.name)} className="text-muted-foreground hover:text-destructive">
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border bg-card p-5">
            <h3 className="font-semibold">提交规范</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>• 单个文件不超过 20 MB</li>
              <li>• Python 入口函数命名为 <code className="rounded bg-secondary px-1">solve()</code></li>
              <li>• Excel 模板请使用班级共享版本</li>
              <li>• 截图需包含仿真完成时间戳</li>
            </ul>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <h3 className="font-semibold">历史提交</h3>
            <div className="mt-3 space-y-2 text-sm">
              {[{ t: "v1.0", s: 72 }, { t: "v1.1", s: 78 }].map((h) => (
                <div key={h.t} className="flex items-center justify-between rounded-md bg-secondary px-3 py-2">
                  <span>{h.t} · 2 天前</span>
                  <span className="font-semibold text-warning-foreground">{h.s} 分</span>
                </div>
              ))}
            </div>
          </div>

          <button
            disabled={!allUploaded || grading}
            onClick={submit}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-primary-foreground transition-all disabled:opacity-50"
            style={{ background: "var(--gradient-hero)" }}
          >
            {grading ? <><Loader2 className="h-4 w-4 animate-spin" /> AI 正在批改…</> : "提交方案并自动批改"}
          </button>
          {!allUploaded && <p className="text-center text-xs text-muted-foreground">请先补齐 5 类必交文件</p>}
        </aside>
      </div>
    </div>
  );
}
