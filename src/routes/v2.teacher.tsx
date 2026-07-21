import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  BarChart3,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  FileQuestion,
  Flame,
  MousePointerClick,
  RefreshCcw,
  Users,
} from "lucide-react";
import { DemoBoundaryNote, V2Shell, v2Nav } from "@/components/V2Shell";
import { v2FinalDemoState } from "@/lib/v2-demo-data";

export const Route = createFileRoute("/v2/teacher")({
  head: () => ({
    meta: [
      { title: "v2 教师端 · 过程性证据看板" },
      { name: "description", content: "教师查看学生首次尝试、错误类型、AI 提问质量、修改次数和过程证据。" },
    ],
  }),
  component: V2TeacherPage,
});

function V2TeacherPage() {
  const summary = v2FinalDemoState.teacherSummary;

  return (
    <V2Shell role="teacher" nav={v2Nav}>
      <div className="space-y-6">
        <section className="rounded-3xl border bg-card p-6" style={{ boxShadow: "var(--shadow-soft)" }}>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <ClipboardCheck className="h-3.5 w-3.5" /> 教师过程证据中心
          </div>
          <h1 className="mt-3 text-3xl font-bold">教师端最终要看到：学生怎么做、怎么问、怎么改</h1>
          <p className="mt-2 max-w-4xl text-sm leading-relaxed text-muted-foreground">
            这个页面按最终上线后的教师视角组织信息：教师不是只看一个最终分数，而是看到学生首次尝试、共性错误、
            AI 提问质量、修改轨迹、正式提交状态和下一步教学干预建议。
          </p>
        </section>

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-6">
          <Kpi icon={Users} label="开始体验" value={`${summary.started}`} sub="人" />
          <Kpi icon={MousePointerClick} label="完成游戏" value={`${summary.completed}`} sub="人" />
          <Kpi icon={Bot} label="AI 提问" value={`${summary.askedAi}`} sub="人" />
          <Kpi icon={RefreshCcw} label="二次修改" value={`${summary.revised}`} sub="人" />
          <Kpi icon={Eye} label="二次访问" value={`${summary.secondVisit}`} sub="人" />
          <Kpi icon={FileQuestion} label="平均提问质量" value={`${summary.avgQuestionQuality}`} sub="/5" />
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_430px]">
          <div className="rounded-3xl border bg-card p-6">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <FileQuestion className="h-4 w-4 text-primary" /> 学生过程证据表
            </div>
            <div className="mt-4 overflow-hidden rounded-2xl border">
              <table className="w-full text-sm">
                <thead className="bg-secondary text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">学生</th>
                    <th className="px-3 py-2">首次尝试</th>
                    <th className="px-3 py-2">最终改法</th>
                    <th className="px-3 py-2">提问质量</th>
                    <th className="px-3 py-2">修改轮次</th>
                    <th className="px-3 py-2">教师判断</th>
                  </tr>
                </thead>
                <tbody>
                  {v2FinalDemoState.studentRecords.map((student) => (
                    <tr key={student.name} className="border-t hover:bg-accent">
                      <td className="px-3 py-3 font-semibold">{student.name}</td>
                      <td className="px-3 py-3 text-muted-foreground">{student.firstTry}</td>
                      <td className="px-3 py-3 text-muted-foreground">{student.finalState}</td>
                      <td className="px-3 py-3">
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-xs text-primary">
                          {student.questionScore}/5
                        </span>
                      </td>
                      <td className="px-3 py-3">{student.revisions} 轮</td>
                      <td className="px-3 py-3">
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">{student.result}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-3xl border bg-card p-6">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Flame className="h-4 w-4 text-primary" /> 班级热力图 + 教学干预建议
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              这里不用强排行榜，而是让老师快速看到班级共性问题，决定下一节课讲什么、推送什么资源。
            </p>
            <div className="mt-4 space-y-4">
              {v2FinalDemoState.heatmap.map((item) => (
                <div key={item.label} className="rounded-2xl border bg-background/40 p-3">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold">{item.label}</span>
                    <span className="font-mono text-primary">{item.count} 人</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, item.count * 4)}%` }} />
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">建议：{item.advice}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border bg-card p-6">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <BarChart3 className="h-4 w-4 text-primary" /> 教师复核视角
            </div>
            <div className="mt-4 space-y-3">
              {[
                ["看首次尝试", "学生一开始犯什么错，是否暴露真实能力缺口。"],
                ["看 AI 提问", "是否能给出背景、目标、约束、已有尝试和具体请求。"],
                ["看修改轨迹", "是否根据反馈做过有效迭代，而不是一次性生成答案。"],
                ["看最终解释", "是否能说明为什么这个方案更稳、更准时或更低成本。"],
              ].map(([title, text]) => (
                <div key={title} className="flex gap-3 rounded-2xl bg-secondary/60 p-3 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <div>
                    <div className="font-semibold">{title}</div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border bg-card p-6">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <AlertTriangle className="h-4 w-4 text-warning-foreground" /> 从 Demo 到真实上线还缺什么
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              {[
                "真实学生账号与班级身份",
                "学生行为数据持久化",
                "真实 AI / RAG 问答记录",
                "正式任务提交与文件解析",
                "仿真服务结果回传",
                "教师可配置评分规则",
              ].map((item) => (
                <div key={item} className="rounded-2xl border bg-background/40 p-3 text-sm text-muted-foreground">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <DemoBoundaryNote />
      </div>
    </V2Shell>
  );
}

function Kpi({ icon: Icon, label, value, sub }: { icon: typeof Users; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-3xl font-bold">{value}</span>
        {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
      </div>
    </div>
  );
}
