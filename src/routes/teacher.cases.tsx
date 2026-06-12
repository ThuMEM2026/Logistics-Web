import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Edit2, Copy, Eye, EyeOff, Settings2, X } from "lucide-react";
import { useStore, setState, type CaseItem } from "@/lib/demo-store";

export const Route = createFileRoute("/teacher/cases")({ component: TeacherCases });

type Published = Record<string, boolean>;

function TeacherCases() {
  const cases = useStore((s) => s.cases);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<CaseItem | null>(null);
  const [configuring, setConfiguring] = useState<CaseItem | null>(null);
  const [published, setPublished] = useState<Published>(() => Object.fromEntries(cases.map((c) => [c.id, true])));
  const [toast, setToast] = useState<string>("");

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 1800); };

  const create = () => {
    if (!name) return;
    const id = Date.now().toString();
    setState((s) => ({ cases: [...s.cases, { id, name, description: "新建案例", status: "not_started", difficulty: "入门", cover: "📦" }] }));
    setPublished((p) => ({ ...p, [id]: true }));
    setName(""); setCreating(false);
    flash("案例已创建");
  };

  const duplicate = (c: CaseItem) => {
    const id = Date.now().toString();
    setState((s) => ({ cases: [...s.cases, { ...c, id, name: c.name + "（副本）", status: "not_started" }] }));
    setPublished((p) => ({ ...p, [id]: false }));
    flash(`已复制：${c.name}`);
  };

  const togglePublish = (c: CaseItem) => {
    setPublished((p) => ({ ...p, [c.id]: !p[c.id] }));
    flash(published[c.id] ? `${c.name} 已下架` : `${c.name} 已发布`);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">案例管理</h1>
          <p className="mt-1 text-muted-foreground">创建、发布、下架、复制课程案例 · 编辑任务文件与评分规则</p>
        </div>
        <button onClick={() => setCreating(true)} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          <Plus className="h-4 w-4" /> 新建案例
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">案例</th>
              <th className="px-4 py-3">难度</th>
              <th className="px-4 py-3">状态</th>
              <th className="px-4 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((c) => {
              const isPub = published[c.id] ?? true;
              return (
                <tr key={c.id} className="border-t">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-xl">{c.cover}</div>
                      <div>
                        <div className="font-medium">{c.name}</div>
                        <div className="line-clamp-1 text-xs text-muted-foreground">{c.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{c.difficulty}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${isPub ? "bg-success/10 text-success" : "bg-secondary text-muted-foreground"}`}>
                      {isPub ? "已发布" : "已下架"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditing(c)} className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs hover:border-primary">
                        <Edit2 className="h-3.5 w-3.5" /> 编辑
                      </button>
                      <button onClick={() => duplicate(c)} className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs hover:border-primary">
                        <Copy className="h-3.5 w-3.5" /> 复制
                      </button>
                      <button onClick={() => togglePublish(c)} className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs hover:border-primary">
                        {isPub ? <><EyeOff className="h-3.5 w-3.5" /> 下架</> : <><Eye className="h-3.5 w-3.5" /> 发布</>}
                      </button>
                      <button onClick={() => setConfiguring(c)} className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs hover:border-primary">
                        <Settings2 className="h-3.5 w-3.5" /> 任务配置
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-md bg-foreground px-4 py-2 text-sm text-background shadow-lg">{toast}</div>
      )}

      {/* Create modal */}
      {creating && (
        <Modal onClose={() => setCreating(false)} title="新建案例">
          <label className="block">
            <span className="text-sm font-medium">案例名称</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </label>
          <label className="mt-3 block">
            <span className="text-sm font-medium">数据集 (JSON)</span>
            <textarea rows={4} defaultValue={`{ "stores": 24, "skus": 1200 }`} className="mt-1 w-full rounded-md border bg-background px-3 py-2 font-mono text-xs" />
          </label>
          <div className="mt-5 flex justify-end gap-2">
            <button onClick={() => setCreating(false)} className="rounded-md px-3 py-1.5 text-sm">取消</button>
            <button onClick={create} className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground">创建</button>
          </div>
        </Modal>
      )}

      {/* Edit modal */}
      {editing && (
        <Modal onClose={() => setEditing(null)} title={`编辑案例 · ${editing.name}`}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="案例名称" defaultValue={editing.name} />
            <Field label="难度" defaultValue={editing.difficulty} />
            <Field label="状态" defaultValue={editing.status} />
            <Field label="涉及知识点" defaultValue="Logistics Wave、Cage Cart、VRP、Time Window" />
          </div>
          <Field label="案例简介" defaultValue={editing.description} textarea />
          <Field label="任务文件说明" defaultValue="订单 Excel、分拣成本、VRP、Total Time、方案报告" textarea />
          <Field label="评分规则说明" defaultValue="文件格式 20 + 分拣仿真 25 + 配送路径 25 + 协同与成本 30" textarea />
          <div className="mt-5 flex justify-end gap-2">
            <button onClick={() => setEditing(null)} className="rounded-md px-3 py-1.5 text-sm">取消</button>
            <button onClick={() => { setEditing(null); flash("案例已保存"); }} className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground">保存</button>
          </div>
        </Modal>
      )}

      {/* Task config modal */}
      {configuring && (
        <Modal onClose={() => setConfiguring(null)} title={`任务配置 · ${configuring.name}`}>
          <div className="space-y-3 text-sm">
            <Section title="任务文件清单">
              <ul className="space-y-1 text-muted-foreground">
                <li>• 订单信息_week14.xlsx（必交）</li>
                <li>• sorting_cost_week14.xlsx（必交）</li>
                <li>• 第14周作业_VRP第二轮解法.xlsx（必交）</li>
                <li>• Total_Time.xlsx（必交）</li>
                <li>• Group_Report.docx（必交）</li>
                <li>• sorting_logic.py（选交）</li>
              </ul>
            </Section>
            <Section title="评分规则">
              <p className="text-muted-foreground">文件格式 20 ｜ 分拣仿真 25 ｜ 配送路径 25 ｜ 协同与成本 30</p>
            </Section>
            <Section title="仿真参数">
              <p className="text-muted-foreground">单车容量 80 carts，sorting wave 上限 80 carts，司机工时 ≤ 8h。</p>
            </Section>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button onClick={() => setConfiguring(null)} className="rounded-md px-3 py-1.5 text-sm">关闭</button>
            <button onClick={() => { setConfiguring(null); flash("任务配置已保存"); }} className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground">保存</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" onClick={onClose}>
      <div className="w-full max-w-xl rounded-2xl bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, defaultValue, textarea }: { label: string; defaultValue: string; textarea?: boolean }) {
  return (
    <label className="mt-3 block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {textarea
        ? <textarea defaultValue={defaultValue} rows={2} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
        : <input defaultValue={defaultValue} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />}
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="mb-1 text-sm font-semibold">{title}</div>
      {children}
    </div>
  );
}
