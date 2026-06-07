import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Edit2, EyeOff, Eye, Trash2 } from "lucide-react";
import { useStore, setState } from "@/lib/demo-store";

export const Route = createFileRoute("/teacher/cases")({ component: TeacherCases });

function TeacherCases() {
  const cases = useStore((s) => s.cases);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");

  const create = () => {
    if (!name) return;
    setState((s) => ({ cases: [...s.cases, { id: Date.now().toString(), name, description: "新建案例", status: "not_started", difficulty: "入门", cover: "📦" }] }));
    setName(""); setCreating(false);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">案例管理</h1>
          <p className="mt-1 text-muted-foreground">创建、发布、下架课程案例</p>
        </div>
        <button onClick={() => setCreating(true)} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          <Plus className="h-4 w-4" /> 新建案例
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="px-4 py-3">案例</th><th className="px-4 py-3">难度</th><th className="px-4 py-3">状态</th><th className="px-4 py-3">操作</th></tr>
          </thead>
          <tbody>
            {cases.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-xl">{c.cover}</div>
                    <div>
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.description}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{c.difficulty}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs text-success">已发布</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 text-muted-foreground">
                    <button className="rounded p-1.5 hover:bg-secondary hover:text-foreground"><Edit2 className="h-4 w-4" /></button>
                    <button className="rounded p-1.5 hover:bg-secondary hover:text-foreground"><EyeOff className="h-4 w-4" /></button>
                    <button className="rounded p-1.5 hover:bg-secondary hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" onClick={() => setCreating(false)}>
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold">新建案例</h3>
            <label className="mt-4 block">
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
          </div>
        </div>
      )}
    </div>
  );
}
