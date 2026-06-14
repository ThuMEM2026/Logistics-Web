import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, CheckCircle2, FileText, Lightbulb, Lock, Play, Sparkles, Target, AlertTriangle } from "lucide-react";
import { TRACK_META, WEEKS, KNOWLEDGE, useStore, type WeekItem } from "@/lib/demo-store";

export const Route = createFileRoute("/student/week/$weekId")({ component: WeekDetail });

function WeekDetail() {
  const { weekId } = Route.useParams();
  const w = WEEKS.find((x) => x.id === Number(weekId));
  const modules = useStore((s) => s.workshop);
  if (!w) {
    return (
      <div className="rounded-2xl border bg-card p-10 text-center">
        <div className="text-lg font-semibold">未找到该教学周</div>
        <Link to="/student" className="mt-3 inline-block text-sm text-primary hover:underline">返回课程周历</Link>
      </div>
    );
  }
  const tm = TRACK_META[w.track];

  const recommended = modules.filter(
    (m) => m.week === w.id && (m.status === "recommended" || m.status === "adopted")
  ).slice(0, 3);

  return (
    <div>
      <Link to="/student" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> 返回课程周历
      </Link>

      {/* Header */}
      <div className="mt-3 overflow-hidden rounded-2xl border bg-card" style={{ boxShadow: "var(--shadow-soft)" }}>
        <div className={`h-1.5 w-full ${tm.bar}`} />
        <div className="p-6">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded bg-secondary px-2 py-0.5 text-muted-foreground">Week {w.id}</span>
            <span className={`rounded px-2 py-0.5 ${tm.color} bg-secondary`}>{tm.label}</span>
            {w.highlight && <span className="rounded bg-warning/20 px-2 py-0.5 font-semibold text-warning-foreground">★ 重点周</span>}
            {w.status === "current" && <span className="rounded bg-primary px-2 py-0.5 text-primary-foreground">进行中</span>}
            {w.status === "completed" && <span className="rounded bg-success/15 px-2 py-0.5 text-success">已完成</span>}
            {w.status === "locked" && <span className="rounded bg-secondary px-2 py-0.5 text-muted-foreground">尚未开放（可预览结构）</span>}
          </div>
          <h1 className="mt-3 text-2xl font-bold md:text-3xl">{w.title}</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{w.goal}</p>
        </div>
      </div>

      {w.status === "locked" && (
        <div className="mt-4 flex items-start gap-2 rounded-2xl border border-dashed bg-card p-4 text-sm text-muted-foreground">
          <Lock className="mt-0.5 h-4 w-4" />
          <span>本周尚未开放，下方内容为课程结构预览，老师可在课堂中按计划解锁。</span>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          {/* 1. 学习目标 */}
          <Section icon={Target} title="本周学习目标">
            <p className="text-sm text-foreground/90">{w.goal}</p>
          </Section>

          {/* 2. 核心概念 */}
          <Section icon={BookOpen} title="核心概念">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {w.concepts.map((name) => {
                const k = KNOWLEDGE.find((x) => x.name === name);
                return (
                  <div key={name} className="rounded-xl border bg-background/40 p-3">
                    <div className="text-sm font-semibold">{name}</div>
                    {k && <div className="mt-1 text-xs leading-relaxed text-muted-foreground">{k.desc}</div>}
                  </div>
                );
              })}
            </div>
            {w.concepts.some((c) => KNOWLEDGE.find((k) => k.name === c)) && (
              <Link to="/student/learn" className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                查看概念卡片详情 →
              </Link>
            )}
          </Section>

          {/* 3. 学习材料 */}
          <Section icon={FileText} title="学习材料">
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {w.materials.map((m, i) => (
                <li key={i} className="flex items-center gap-2 rounded-lg border bg-background/40 px-3 py-2 text-sm">
                  <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">{m.type}</span>
                  <span className="truncate">{m.name}</span>
                </li>
              ))}
            </ul>
          </Section>

          {/* 4. 练习任务 */}
          <Section icon={Play} title="练习任务">
            <div className="space-y-2">
              {w.practice.map((p, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border bg-background/40 p-3">
                  <div>
                    <div className="text-sm font-semibold">{p.title}</div>
                    <div className="text-xs text-muted-foreground">{p.desc}</div>
                  </div>
                  {p.href ? (
                    <Link to={p.href as string} className="rounded-md border px-3 py-1.5 text-xs hover:border-primary">前往</Link>
                  ) : (
                    <span className="text-xs text-muted-foreground">即将开放</span>
                  )}
                </div>
              ))}
            </div>
          </Section>

          {/* 5. Week 8 special blocks */}
          {w.id === 8 && <Week8Blocks />}

          {/* 6. 规则提示 */}
          {w.rules && (
            <Section icon={AlertTriangle} title="本周关键规则">
              <ul className="space-y-1.5 text-sm">
                {w.rules.map((r, i) => (
                  <li key={i} className="rounded-lg bg-warning/10 px-3 py-2 text-warning-foreground">⚠ {r}</li>
                ))}
              </ul>
            </Section>
          )}

          {/* 7. 推荐共创模块 */}
          <Section icon={Sparkles} title="推荐共创模块">
            {recommended.length === 0 ? (
              <div className="rounded-xl border bg-background/40 p-4 text-sm text-muted-foreground">
                本周暂无教师推荐的共创模块。
                <Link to="/student/workshop" className="ml-1 text-primary hover:underline">去工坊浏览</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {recommended.map((m) => (
                  <Link key={m.id} to="/student/workshop/$moduleId" params={{ moduleId: m.id }}
                    className="overflow-hidden rounded-xl border bg-card transition-all hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex h-20 items-center justify-center text-3xl" style={{ background: m.gradient }}>{m.cover}</div>
                    <div className="p-3">
                      <div className="text-sm font-semibold">{m.title}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{m.intro}</div>
                      <div className="mt-2 text-[11px] text-muted-foreground">{m.group} · 👍 {m.likes}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <div className="mt-3 text-xs text-muted-foreground">
              共创模块由学生在「Vibe Coding 共创工坊」中提交，教师审核后自动出现在对应教学周下方。
            </div>
          </Section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="rounded-2xl border bg-card p-5">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">本周状态</div>
            <div className="mt-2 text-lg font-semibold">
              {w.status === "current" ? "进行中" : w.status === "completed" ? "已完成" : w.status === "locked" ? "未开放" : "可回顾"}
            </div>
            <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
              <div>方向：{tm.label}</div>
              <div>任务类型：{w.taskTypes.join(" / ")}</div>
              <div>核心概念：{w.concepts.length} 个</div>
              <div>学习材料：{w.materials.length} 份</div>
            </div>
          </div>

          <NavWeek w={w} />
        </aside>
      </div>
    </div>
  );
}

function NavWeek({ w }: { w: WeekItem }) {
  const prev = WEEKS.find((x) => x.id === w.id - 1);
  const next = WEEKS.find((x) => x.id === w.id + 1);
  return (
    <div className="rounded-2xl border bg-card p-4 text-sm">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">周次导航</div>
      <div className="mt-3 space-y-2">
        {prev && (
          <Link to="/student/week/$weekId" params={{ weekId: String(prev.id) }} className="block rounded-lg border bg-background/40 p-2 hover:border-primary">
            <div className="text-[10px] text-muted-foreground">上一周</div>
            <div className="text-xs font-semibold">Week {prev.id} · {prev.title}</div>
          </Link>
        )}
        {next && (
          <Link to="/student/week/$weekId" params={{ weekId: String(next.id) }} className="block rounded-lg border bg-background/40 p-2 hover:border-primary">
            <div className="text-[10px] text-muted-foreground">下一周</div>
            <div className="text-xs font-semibold">Week {next.id} · {next.title}</div>
          </Link>
        )}
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: typeof Play; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Week8Blocks() {
  return (
    <>
      <Section icon={FileText} title="必交文件清单">
        <ul className="space-y-1.5 text-sm">
          {[
            "分拣订单与波次 Excel（必交）",
            "分拣成本 Excel（必交）",
            "方案说明 docx（必交）",
            "Python 逻辑文件（选交）",
          ].map((t, i) => (
            <li key={i} className="flex items-center gap-2 rounded-lg border bg-background/40 px-3 py-2">
              <CheckCircle2 className="h-4 w-4 text-success" /> {t}
            </li>
          ))}
        </ul>
        <Link to="/student/submit" className="mt-3 inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-primary-foreground"
          style={{ background: "var(--gradient-hero)" }}>
          前往方案提交 →
        </Link>
      </Section>

      <Section icon={AlertTriangle} title="文件预检与规则提示">
        <ul className="space-y-1.5 text-sm">
          <li className="rounded-lg bg-success/10 px-3 py-2 text-success">✓ Excel 字段结构已对齐课程统一模板</li>
          <li className="rounded-lg bg-warning/10 px-3 py-2 text-warning-foreground">⚠ Sorting Wave 上限：每个 wave ≤ 80 carts</li>
          <li className="rounded-lg bg-warning/10 px-3 py-2 text-warning-foreground">⚠ 总分拣时间向上取整后再计算人力成本</li>
        </ul>
      </Section>

      <Section icon={Lightbulb} title="分拣仿真结果样例">
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-secondary p-3 text-xs sm:grid-cols-3">
          <div><div className="text-muted-foreground">仿真任务</div><div className="font-medium">SIM-WAFIA-20260610-001</div></div>
          <div><div className="text-muted-foreground">总分拣时间</div><div className="font-medium">14h 05m 47s</div></div>
          <div><div className="text-muted-foreground">最大 wave carts</div><div className="font-medium">79</div></div>
          <div><div className="text-muted-foreground">是否超 80</div><div className="font-medium">否</div></div>
          <div><div className="text-muted-foreground">分拣开始</div><div className="font-medium">13:00</div></div>
          <div><div className="text-muted-foreground">是否可用于评分</div><div className="font-medium">是</div></div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">提交方案后，平台会自动在线仿真并将上述指标写入 AI 批改证据链。</p>
      </Section>

      <Section icon={Sparkles} title="AI 批改反馈与修改建议">
        <p className="text-sm text-muted-foreground">完成提交并通过仿真后，可在「AI 批改」中查看四维评分、硬约束检查与修改建议。</p>
        <div className="mt-3 flex gap-2">
          <Link to="/student/result" className="rounded-md border px-3 py-1.5 text-xs hover:border-primary">查看示例 AI 报告</Link>
          <Link to="/student/submissions" className="rounded-md border px-3 py-1.5 text-xs hover:border-primary">查看我的提交记录</Link>
        </div>
      </Section>
    </>
  );
}
