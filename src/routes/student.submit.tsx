import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Upload, FileSpreadsheet, FileText, FileCode, CheckCircle2, X, Loader2, AlertTriangle, AlertCircle, Server, Clock } from "lucide-react";
import { makeMockScore, REQUIRED_FILES, setState, useStore, type FileStatus, type SimStatus } from "@/lib/demo-store";

export const Route = createFileRoute("/student/submit")({ component: SubmitPage });

const statusMeta: Record<FileStatus, { label: string; cls: string }> = {
  pending: { label: "等待上传", cls: "bg-secondary text-muted-foreground" },
  uploaded: { label: "已上传，等待预检", cls: "bg-warning/20 text-warning-foreground" },
  passed: { label: "字段结构完整，校验通过", cls: "bg-success/10 text-success" },
  failed: { label: "校验失败", cls: "bg-destructive/10 text-destructive" },
  risk: { label: "规则风险", cls: "bg-warning/20 text-warning-foreground" },
  queued: { label: "已进入在线仿真队列", cls: "bg-primary/10 text-primary" },
};

const simMeta: Record<SimStatus, { label: string; cls: string }> = {
  idle: { label: "尚未启动", cls: "bg-secondary text-muted-foreground" },
  queued: { label: "排队中", cls: "bg-warning/20 text-warning-foreground" },
  running: { label: "运行中", cls: "bg-primary/10 text-primary" },
  success: { label: "运行成功", cls: "bg-success/10 text-success" },
  error: { label: "运行异常", cls: "bg-destructive/10 text-destructive" },
  input_error: { label: "输入错误", cls: "bg-destructive/10 text-destructive" },
};

function SubmitPage() {
  const files = useStore((s) => s.uploadedFiles);
  const simStatus = useStore((s) => s.simStatus);
  const simResult = useStore((s) => s.simResult);
  const [dragging, setDragging] = useState(false);
  const [grading, setGrading] = useState(false);
  const router = useRouter();

  const addFile = (key: string, label: string, ext: string, sample: string) => {
    if (files.some((f) => f.key === key)) return;
    // Simulate Group 3 risk for the sorting orders file
    let status: FileStatus = "passed";
    let message = "字段结构完整";
    if (key === "orders") {
      status = "risk";
      message = "Wave 1 包含 90 个 logistics cage carts，超过 80 个上限";
    } else if (key === "sortCost") {
      status = "uploaded";
      message = "总分拣时间 14h 05m 47s，需等待在线仿真验证";
    }
    setState((s) => ({
      uploadedFiles: [...s.uploadedFiles, {
        key, name: sample, size: `${(Math.random() * 200 + 30).toFixed(1)} KB`, type: ext, status, message,
      }],
    }));
  };
  const remove = (key: string) => setState((s) => ({ uploadedFiles: s.uploadedFiles.filter((f) => f.key !== key) }));

  const requiredKeys = REQUIRED_FILES.filter((r) => r.required).map((r) => r.key);
  const allRequired = requiredKeys.every((k) => files.some((f) => f.key === k));
  const hasFailure = files.some((f) => f.status === "failed");

  const runPrecheck = () => {
    setState((s) => ({
      uploadedFiles: s.uploadedFiles.map((f) =>
        f.status === "uploaded" ? { ...f, status: "passed", message: "字段结构完整" } : f
      ),
    }));
  };

  const runSimulation = () => {
    setState({ simStatus: "queued" });
    setTimeout(() => setState({ simStatus: "running" }), 600);
    setTimeout(() => {
      setState({
        simStatus: "success",
        simResult: {
          taskId: "SIM-WAFIA-20260610-001",
          totalTime: "14h 05m 47s",
          maxCarts: 79,
          overLimit: false,
          startTime: "13:00",
          usable: true,
        },
      });
    }, 2400);
  };

  const submitForAI = () => {
    setGrading(true);
    setTimeout(() => {
      setState({ lastScore: makeMockScore(), unlockedLevel: 5 });
      setGrading(false);
      router.navigate({ to: "/student/result" });
    }, 1500);
  };

  const preIssues: { sev: "high" | "mid"; text: string }[] = [];
  if (files.find((f) => f.key === "orders")?.status === "risk")
    preIssues.push({ sev: "high", text: "分拣订单文件中 Wave 1 包含 90 个 logistics cage carts，超过 80 个上限。" });
  if (files.find((f) => f.key === "sortCost") && simStatus !== "success")
    preIssues.push({ sev: "mid", text: "分拣成本表中的总分拣时间为 14h 05m 47s，但仿真结果尚未生成，需等待在线仿真验证。" });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">方案提交</h1>
        <p className="mt-1 text-muted-foreground">上传 Week 14 综合作业文件 · 平台将自动预检、调用 BS 仿真并生成 AI 批改报告</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); REQUIRED_FILES.forEach((r) => addFile(r.key, r.label, r.ext, r.sample)); }}
            className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 transition-all ${dragging ? "border-primary bg-accent" : "border-border bg-card"}`}
          >
            <Upload className="h-10 w-10 text-primary" />
            <div className="mt-3 text-base font-semibold">拖拽全部文件到此处一键上传</div>
            <div className="mt-1 text-xs text-muted-foreground">或在下方逐个添加示例文件（演示）</div>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <h3 className="font-semibold">课程作业文件清单</h3>
            <div className="mt-3 space-y-2">
              {REQUIRED_FILES.map((r) => {
                const f = files.find((x) => x.key === r.key);
                const status = f?.status ?? "pending";
                const meta = statusMeta[status];
                const Icon = r.ext === ".py" ? FileCode : r.ext === ".docx" ? FileText : FileSpreadsheet;
                return (
                  <div key={r.key} className="flex items-center gap-3 rounded-lg border bg-background/40 p-3">
                    <Icon className="h-5 w-5 text-primary" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        {r.label}
                        {r.required ? <span className="rounded bg-destructive/10 px-1.5 text-xs text-destructive">必交</span>
                          : <span className="rounded bg-secondary px-1.5 text-xs text-muted-foreground">选交</span>}
                      </div>
                      <div className="mt-0.5 truncate text-xs text-muted-foreground">
                        {f ? `${f.name} · ${f.size}` : `示例：${r.sample}`}
                      </div>
                      {f?.message && <div className="mt-0.5 text-xs text-muted-foreground">{f.message}</div>}
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${meta.cls}`}>{meta.label}</span>
                    {f ? (
                      <button onClick={() => remove(r.key)} className="text-muted-foreground hover:text-destructive">
                        <X className="h-4 w-4" />
                      </button>
                    ) : (
                      <button onClick={() => addFile(r.key, r.label, r.ext, r.sample)} className="rounded border px-2 py-1 text-xs hover:border-primary">添加</button>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">提示：仿真结果由平台在线生成并保存，截图仅作为补充材料。</p>
          </div>

          {/* Pre-check */}
          <div className="rounded-2xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">文件预检结果</h3>
              {preIssues.length > 0
                ? <span className="text-xs text-warning-foreground">发现 {preIssues.length} 个问题</span>
                : <span className="text-xs text-success">未发现问题</span>}
            </div>
            <div className="mt-3 space-y-2">
              {preIssues.length === 0 && (
                <div className="rounded-lg bg-secondary p-3 text-sm text-muted-foreground">上传文件后将自动展示预检问题。</div>
              )}
              {preIssues.map((p, i) => {
                const Icon = p.sev === "high" ? AlertTriangle : AlertCircle;
                const cls = p.sev === "high" ? "bg-destructive/10 text-destructive" : "bg-warning/20 text-warning-foreground";
                return (
                  <div key={i} className={`flex items-start gap-2 rounded-lg p-3 text-sm ${cls}`}>
                    <Icon className="mt-0.5 h-4 w-4" />
                    <div>{i + 1}. {p.text}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Online simulation */}
          <div className="rounded-2xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-semibold"><Server className="h-4 w-4 text-primary" /> 在线仿真验证</h3>
              <span className={`rounded-full px-2 py-0.5 text-xs ${simMeta[simStatus].cls}`}>{simMeta[simStatus].label}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              平台将分拣方案发送到 BS 架构仿真服务运行，自动保存输入、输出和异常作为 AI 批改依据。
            </p>
            {simResult && (
              <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-secondary p-3 text-xs sm:grid-cols-3">
                <div><div className="text-muted-foreground">仿真任务</div><div className="font-medium">{simResult.taskId}</div></div>
                <div><div className="text-muted-foreground">总分拣时间</div><div className="font-medium">{simResult.totalTime}</div></div>
                <div><div className="text-muted-foreground">最大 wave carts</div><div className="font-medium">{simResult.maxCarts}</div></div>
                <div><div className="text-muted-foreground">是否超 80</div><div className="font-medium">{simResult.overLimit ? "是" : "否"}</div></div>
                <div><div className="text-muted-foreground">分拣开始</div><div className="font-medium">{simResult.startTime}</div></div>
                <div><div className="text-muted-foreground">可用于评分</div><div className="font-medium">{simResult.usable ? "是" : "否"}</div></div>
              </div>
            )}
            <div className="mt-3">
              <button
                onClick={runSimulation}
                disabled={!allRequired || simStatus === "running" || simStatus === "queued"}
                className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:border-primary disabled:opacity-50"
              >
                <Clock className="h-4 w-4" /> {simStatus === "success" ? "重新运行仿真" : "提交并运行仿真"}
              </button>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border bg-card p-5">
            <h3 className="font-semibold">操作</h3>
            <div className="mt-3 space-y-2">
              <button
                disabled={files.length === 0}
                className="w-full rounded-md border px-3 py-2 text-sm hover:border-primary disabled:opacity-50"
              >
                保存草稿
              </button>
              <button
                disabled={files.length === 0}
                onClick={runPrecheck}
                className="w-full rounded-md border px-3 py-2 text-sm hover:border-primary disabled:opacity-50"
              >
                开始预检
              </button>
              <button
                disabled={!allRequired || hasFailure || simStatus !== "success" || grading}
                onClick={submitForAI}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-primary-foreground transition-all disabled:opacity-50"
                style={{ background: "var(--gradient-hero)" }}
              >
                {grading ? <><Loader2 className="h-4 w-4 animate-spin" /> AI 批改中…</> : "提交并启动 AI 批改"}
              </button>
              {!allRequired && <p className="text-xs text-muted-foreground">请先补齐必交文件</p>}
              {allRequired && simStatus !== "success" && <p className="text-xs text-muted-foreground">请先运行在线仿真</p>}
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <h3 className="font-semibold">提交规范</h3>
            <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              <li>• Excel 模板请使用班级共享版本，字段不可修改</li>
              <li>• 每个 sorting wave ≤ 80 carts</li>
              <li>• 车辆发车时间必须晚于对应货物分拣完成</li>
              <li>• 司机工时 ≤ 8 小时</li>
              <li>• 单文件 ≤ 20 MB</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
