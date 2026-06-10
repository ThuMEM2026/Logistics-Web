import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/teacher/rules")({ component: Rules });

const hard = [
  { rule: "Excel 模板字段不能被破坏", impact: "文件无法进入仿真或自动批改" },
  { rule: "每个 sorting wave 最多 80 carts", impact: "超过后方案可能判为 B" },
  { rule: "仿真结果必须与成本表一致", impact: "不一致会影响分拣仿真评分" },
  { rule: "配送路线必须覆盖所有门店", impact: "遗漏门店属于重大错误" },
  { rule: "司机工时不能超过限制", impact: "超过会影响配送路径有效性" },
  { rule: "车辆发车不能早于对应货物分拣完成", impact: "违反 Week 14 综合协同要求" },
];

const dims = [
  { d: "文件格式", s: 20, desc: "检查 Excel 字段、sheet、命名和必交文件完整性" },
  { d: "分拣仿真", s: 25, desc: "检查分拣方案是否可导入、是否跑通、是否违反 carts 限制" },
  { d: "配送路径", s: 25, desc: "检查路线覆盖、距离、到达时间、司机工时和配送截止时间" },
  { d: "协同与成本", s: 30, desc: "检查分拣完成时间、车辆发车时间、总时间和成本计算" },
];

function Rules() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">评分规则</h1>
        <p className="mt-1 text-muted-foreground">平台依据以下规则进行自动批改，所有 AI 评分均可追溯至此</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border bg-success/10 p-5">
          <div className="text-xs font-semibold text-success">A 等级</div>
          <p className="mt-2 text-sm">方案基本有效，可参与 ranking。允许存在少量成本计算、格式展示或轻微时间误差。</p>
        </div>
        <div className="rounded-2xl border bg-destructive/10 p-5">
          <div className="text-xs font-semibold text-destructive">B 等级</div>
          <p className="mt-2 text-sm">方案存在重大错误，不建议参与 ranking。例如文件无法导入、分拣 wave 超过 80 carts、配送时间窗不满足、分拣与配送发车时间冲突。</p>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-6">
        <h3 className="font-semibold">硬约束规则</h3>
        <div className="mt-4 overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left text-xs uppercase text-muted-foreground">
              <tr><th className="px-3 py-2">规则</th><th className="px-3 py-2">违规后果</th></tr>
            </thead>
            <tbody>
              {hard.map((h) => (
                <tr key={h.rule} className="border-t">
                  <td className="px-3 py-2">{h.rule}</td>
                  <td className="px-3 py-2 text-muted-foreground">{h.impact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-6">
        <h3 className="font-semibold">四维评分规则</h3>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {dims.map((d) => (
            <div key={d.d} className="rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">{d.d}</div>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">{d.s} 分</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{d.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
