import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  Bot,
  Boxes,
  CheckCircle2,
  Clock3,
  ClipboardList,
  PackageCheck,
  Play,
  RefreshCcw,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Truck,
  Users,
  Zap,
} from "lucide-react";
import { bakeryStores, type OpeningNightResult } from "@/lib/v2-demo-data";

type GoalChoice = "speed" | "cost" | "trust";
type ScanChoice = "manual" | "barcode" | "rfid";
type DispatchChoice = "early" | "balanced" | "full";
type PromptChoice = "vague" | "structured" | "auditable";
type EventChoice = "surge" | "cold" | "exception" | "teacher";
type SimPhase = "idle" | "running" | "done";

type GameState = {
  goal: GoalChoice;
  sortingStaff: number;
  qcStaff: number;
  loadingStaff: number;
  waveTarget: number;
  scanMode: ScanChoice;
  exceptionLane: boolean;
  dispatch: DispatchChoice;
  prompt: PromptChoice;
  event: EventChoice;
};

type WaveState = {
  id: string;
  carts: number;
  status: "安全" | "接近红线" | "超限";
};

type GameResult = OpeningNightResult & {
  hardFail: boolean;
  resultTitle: string;
  trust: number;
  rework: number;
  waves: WaveState[];
};

const goals: Record<GoalChoice, { label: string; desc: string; onTime: number; cost: number; accuracy: number }> = {
  speed: { label: "准时率冲刺", desc: "优先保证明早开业前送达，愿意增加高峰投入。", onTime: 9, cost: 180, accuracy: 0 },
  cost: { label: "成本守门", desc: "控制加班和临时岗，但要承担更高延误风险。", onTime: -6, cost: -160, accuracy: -1.2 },
  trust: { label: "客户信任优先", desc: "平衡准时、成本和错分，重点保护门店体验。", onTime: 3, cost: 60, accuracy: 2.8 },
};

const scanModes: Record<ScanChoice, { label: string; desc: string; cost: number; accuracy: number; speed: number }> = {
  manual: { label: "人工目检", desc: "成本低，但错分、漏扫和异常件堆积风险高。", cost: 0, accuracy: -5.6, speed: -2 },
  barcode: { label: "条码扫描", desc: "首版最稳妥：成本可控，能明显降低错分。", cost: 220, accuracy: 2.6, speed: 1 },
  rfid: { label: "RFID 快速通过", desc: "效率最高，但真实接入成本高，Demo 中仅模拟。", cost: 520, accuracy: 4.2, speed: 4 },
};

const dispatchModes: Record<DispatchChoice, { label: string; desc: string; buffer: number; cost: number; onTime: number }> = {
  early: { label: "早发车", desc: "配送缓冲更安全，但可能牺牲装载率。", buffer: 13, cost: 150, onTime: 5 },
  balanced: { label: "平衡发车", desc: "兼顾配送缓冲和装载率，适合首轮方案。", buffer: 5, cost: 40, onTime: 2 },
  full: { label: "满载发车", desc: "成本更低，但会压缩门店时间窗。", buffer: -10, cost: -120, onTime: -7 },
};

const prompts: Record<PromptChoice, { label: string; desc: string; score: number }> = {
  vague: { label: "模糊提问", desc: "我的方案哪里不好？", score: 2 },
  structured: { label: "结构化提问", desc: "说明背景、目标、约束和已有配置。", score: 4 },
  auditable: { label: "可复核提问", desc: "要求 AI 先查硬约束，再给修改方向和判断标准。", score: 5 },
};

const events: Record<EventChoice, { label: string; desc: string; icon: typeof Zap; wave: number; buffer: number; accuracy: number }> = {
  surge: { label: "团购爆单", desc: "五道口店临时追加 60 单，主波次压力上升。", icon: Zap, wave: 8, buffer: -5, accuracy: -1.2 },
  cold: { label: "冷链插单", desc: "金融街快闪点冷链订单需要提前出库。", icon: PackageCheck, wave: 4, buffer: -4, accuracy: -0.8 },
  exception: { label: "异常件堆积", desc: "标签模糊订单开始占用主线分拣能力。", icon: AlertTriangle, wave: 5, buffer: -2, accuracy: -3.2 },
  teacher: { label: "教师追问", desc: "请解释你为什么这样配置 wave、复核岗和发车策略。", icon: Bot, wave: 0, buffer: 0, accuracy: 0 },
};

const defaultGame: GameState = {
  goal: "trust",
  sortingStaff: 6,
  qcStaff: 2,
  loadingStaff: 2,
  waveTarget: 76,
  scanMode: "barcode",
  exceptionLane: true,
  dispatch: "balanced",
  prompt: "structured",
  event: "surge",
};

export function OpeningNightCommandGame({ onResult }: { onResult?: (result: OpeningNightResult) => void }) {
  const [phase, setPhase] = useState<SimPhase>("idle");
  const [ran, setRan] = useState(false);
  const [round, setRound] = useState(1);
  const [game, setGame] = useState<GameState>(defaultGame);
  const result = useMemo(() => calculateResult(game), [game]);
  const EventIcon = events[game.event].icon;

  const update = (patch: Partial<GameState>) => {
    setRan(false);
    setPhase("idle");
    setGame((prev) => ({ ...prev, ...patch }));
  };

  const run = () => {
    setRan(false);
    setPhase("running");
    setRound((prev) => Math.min(5, prev + 1));
  };

  const reset = () => {
    setGame(defaultGame);
    setPhase("idle");
    setRan(false);
    setRound(1);
  };

  useEffect(() => {
    if (phase !== "running") return;
    const timer = window.setTimeout(() => {
      setPhase("done");
      setRan(true);
      onResult?.(result);
    }, 1100);
    return () => window.clearTimeout(timer);
  }, [onResult, phase, result]);

  return (
    <section className="overflow-hidden rounded-3xl border bg-card" style={{ boxShadow: "var(--shadow-soft)" }}>
      <div className="border-b bg-gradient-to-r from-primary/10 via-background to-warning/10 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> 开业夜分拣运营指挥
            </div>
            <h2 className="mt-2 text-3xl font-bold">目标：让门店准时收到货，同时守住 80 carts 硬约束</h2>
            <p className="mt-1 max-w-4xl text-sm leading-relaxed text-muted-foreground">
              你是面包工坊开业夜分拣负责人。面对爆单、冷链插单和异常件堆积，你要配置人手、wave、识别方式、异常件旁路和发车策略。
              系统会把你的选择转成运营指标、瓶颈诊断和教师端过程证据。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={reset} className="inline-flex items-center gap-2 rounded-2xl border bg-card px-4 py-2 text-sm font-semibold hover:bg-secondary">
              <RefreshCcw className="h-4 w-4" /> 重置
            </button>
            <button
              onClick={run}
              disabled={phase === "running"}
              className="inline-flex items-center gap-2 rounded-2xl px-5 py-2 text-sm font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-70"
              style={{ background: "var(--gradient-hero)" }}
            >
              <Play className={`h-4 w-4 ${phase === "running" ? "animate-pulse" : ""}`} /> {phase === "running" ? "正在仿真..." : "运行开业夜仿真"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-0 xl:grid-cols-[1fr_380px]">
        <main className="space-y-5 p-5">
          <TopBar round={round} eventIcon={EventIcon} eventName={events[game.event].label} phase={phase} result={result} />
          <SortingFloor phase={phase} ran={ran} result={result} game={game} />
          <Timeline phase={phase} ran={ran} />
          <ResultCard phase={phase} ran={ran} result={result} />
        </main>

        <aside className="space-y-4 border-t bg-secondary/20 p-5 xl:border-l xl:border-t-0">
          <DecisionPanel game={game} disabled={phase === "running"} update={update} />
          <EventPanel current={game.event} disabled={phase === "running"} update={update} />
        </aside>
      </div>
    </section>
  );
}

function TopBar({
  eventIcon: EventIcon,
  eventName,
  phase,
  result,
  round,
}: {
  eventIcon: typeof Zap;
  eventName: string;
  phase: SimPhase;
  result: GameResult;
  round: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-[1fr_repeat(4,150px)]">
      <div className="rounded-3xl border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <EventIcon className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-muted-foreground">第 {round} 轮 · {phase === "running" ? "仿真运行中" : "当前事件"}</div>
            <div className="text-lg font-bold">{eventName}</div>
          </div>
        </div>
      </div>
      <KpiCard icon={Clock3} label="准时率" value={`${result.onTime}%`} tone={result.onTime >= 88 ? "green" : result.onTime >= 75 ? "yellow" : "red"} />
      <KpiCard icon={ScanLine} label="准确率" value={`${result.accuracy}%`} tone={result.accuracy >= 95 ? "green" : result.accuracy >= 90 ? "yellow" : "red"} />
      <KpiCard icon={Boxes} label="最大 wave" value={`${result.maxWave}`} tone={result.hardFail ? "red" : result.maxWave >= 76 ? "yellow" : "green"} />
      <KpiCard icon={Truck} label="配送缓冲" value={`${result.buffer}分`} tone={result.buffer >= 40 ? "green" : result.buffer >= 25 ? "yellow" : "red"} />
    </div>
  );
}

function SortingFloor({ game, phase, ran, result }: { game: GameState; phase: SimPhase; ran: boolean; result: GameResult }) {
  const stationCards = [
    { icon: Users, title: "主线分拣", value: `${game.sortingStaff} 人`, text: "决定吞吐能力和分拣完成时间" },
    { icon: ShieldCheck, title: "异常件复核", value: `${game.qcStaff} 人`, text: game.exceptionLane ? "已开启旁路复核" : "未开启旁路复核" },
    { icon: Truck, title: "装车交接", value: `${game.loadingStaff} 人`, text: dispatchModes[game.dispatch].label },
    { icon: Bot, title: "AI 提问", value: `${result.questionQuality}/5`, text: prompts[game.prompt].label },
  ];

  return (
    <div className="overflow-hidden rounded-[28px] border bg-card shadow-sm">
      <div className="grid grid-cols-1 gap-0 lg:grid-cols-[1fr_290px]">
        <div className="relative min-h-[470px] bg-[radial-gradient(circle_at_top_left,oklch(0.97_0.04_230),transparent_34%),linear-gradient(180deg,oklch(0.99_0.01_250),oklch(0.96_0.02_250))] p-5">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {stationCards.map(({ icon: Icon, title, value, text }) => (
              <div key={title} className="rounded-2xl border bg-white/90 p-3 shadow-sm">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{title}</span>
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="mt-2 text-xl font-bold">{value}</div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-3xl border bg-white/90 p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Boxes className="h-4 w-4 text-primary" /> sorting wave 控制台
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${result.hardFail ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}`}>
                {result.hardFail ? "硬约束失败" : "可进入正式任务"}
              </span>
            </div>
            <div className="space-y-3">
              {result.waves.map((wave) => (
                <div key={wave.id}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-semibold">{wave.id}</span>
                    <span className={wave.status === "超限" ? "font-mono text-destructive" : "font-mono text-primary"}>
                      {wave.carts} carts · {wave.status}
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-secondary">
                    <div
                      className={`h-full rounded-full ${wave.status === "超限" ? "bg-destructive" : wave.status === "接近红线" ? "bg-warning" : "bg-primary"}`}
                      style={{ width: `${Math.min(100, (wave.carts / 92) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            {bakeryStores.slice(0, 3).map((store, index) => (
              <div key={store.id} className={`rounded-3xl border bg-white/90 p-4 shadow-sm ${phase === "running" ? "animate-pulse" : ""}`}>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold">{store.name}</div>
                  <PackageCheck className="h-4 w-4 text-primary" />
                </div>
                <div className="mt-2 text-2xl font-bold">{store.orders + (game.event === "surge" && index === 2 ? 60 : 0)}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  承诺 {store.promisedAt} · {store.temp}
                </div>
              </div>
            ))}
          </div>

          {phase === "running" && (
            <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 rounded-3xl border bg-card/95 p-4 text-center shadow-xl backdrop-blur">
              <div className="text-sm font-bold">正在仿真：订单入波、异常件复核、装车交接与配送缓冲...</div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
                <div className="h-full w-2/3 animate-pulse rounded-full bg-primary" />
              </div>
            </div>
          )}
        </div>

        <div className="border-t bg-secondary/40 p-5 lg:border-l lg:border-t-0">
          <div className="text-sm font-semibold">本轮诊断</div>
          <div className="mt-3 space-y-3">
            {diagnose(result).map((item) => (
              <div key={item.title} className={`rounded-2xl border p-3 ${item.danger ? "border-destructive/30 bg-destructive/10" : "bg-card"}`}>
                <div className="text-sm font-semibold">{item.title}</div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
          {ran && (
            <div className="mt-4 rounded-2xl border bg-success/10 p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-success">
                <CheckCircle2 className="h-4 w-4" /> 已生成教师端过程证据
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                记录本轮决策、硬约束、AI 提问质量和修改建议，可进入教师端热力图。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DecisionPanel({ disabled, game, update }: { disabled: boolean; game: GameState; update: (patch: Partial<GameState>) => void }) {
  return (
    <section className="rounded-3xl border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2 text-base font-bold">
        <ClipboardList className="h-5 w-5 text-primary" /> 设置分拣方案
      </div>

      <div className="mt-4 space-y-4">
        <DecisionGroup title="今晚运营目标">
          {(Object.keys(goals) as GoalChoice[]).map((goal) => (
            <ChoiceButton key={goal} active={game.goal === goal} desc={goals[goal].desc} disabled={disabled} title={goals[goal].label} onClick={() => update({ goal })} />
          ))}
        </DecisionGroup>

        <div className="rounded-3xl border bg-secondary/40 p-4">
          <div className="mb-3 text-sm font-bold">高峰人手配置</div>
          <Counter label="主线分拣岗" value={game.sortingStaff} min={3} max={9} disabled={disabled} onChange={(sortingStaff) => update({ sortingStaff })} />
          <Counter label="异常件复核岗" value={game.qcStaff} min={0} max={5} disabled={disabled} onChange={(qcStaff) => update({ qcStaff })} />
          <Counter label="装车交接岗" value={game.loadingStaff} min={1} max={5} disabled={disabled} onChange={(loadingStaff) => update({ loadingStaff })} />
        </div>

        <div className="rounded-3xl border bg-secondary/40 p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-bold">目标 wave carts</span>
            <span className={game.waveTarget > 80 ? "font-mono text-destructive" : "font-mono text-primary"}>{game.waveTarget} carts</span>
          </div>
          <input
            disabled={disabled}
            className="w-full accent-primary"
            type="range"
            min={58}
            max={92}
            value={game.waveTarget}
            onChange={(event) => update({ waveTarget: Number(event.target.value) })}
          />
          <p className="mt-2 text-xs text-muted-foreground">超过 80 carts 会触发硬约束失败，即使其他指标较好也不能算有效方案。</p>
        </div>

        <DecisionGroup title="识别方式">
          {(Object.keys(scanModes) as ScanChoice[]).map((scanMode) => (
            <ChoiceButton key={scanMode} active={game.scanMode === scanMode} desc={scanModes[scanMode].desc} disabled={disabled} title={scanModes[scanMode].label} onClick={() => update({ scanMode })} />
          ))}
        </DecisionGroup>

        <button
          disabled={disabled}
          onClick={() => update({ exceptionLane: !game.exceptionLane })}
          className={`w-full rounded-2xl border p-3 text-left transition-all ${game.exceptionLane ? "border-primary bg-accent" : "bg-secondary/40 hover:border-primary/50"} disabled:cursor-not-allowed disabled:opacity-55`}
        >
          <div className="text-sm font-bold">{game.exceptionLane ? "已开启异常件旁路" : "未开启异常件旁路"}</div>
          <div className="mt-1 text-xs text-muted-foreground">开启后增加少量成本，但能降低错分和返工。</div>
        </button>

        <DecisionGroup title="发车策略">
          {(Object.keys(dispatchModes) as DispatchChoice[]).map((dispatch) => (
            <ChoiceButton key={dispatch} active={game.dispatch === dispatch} desc={dispatchModes[dispatch].desc} disabled={disabled} title={dispatchModes[dispatch].label} onClick={() => update({ dispatch })} />
          ))}
        </DecisionGroup>

        <DecisionGroup title="AI 提问方式">
          {(Object.keys(prompts) as PromptChoice[]).map((prompt) => (
            <ChoiceButton key={prompt} active={game.prompt === prompt} desc={prompts[prompt].desc} disabled={disabled} title={prompts[prompt].label} onClick={() => update({ prompt })} />
          ))}
        </DecisionGroup>
      </div>
    </section>
  );
}

function EventPanel({ current, disabled, update }: { current: EventChoice; disabled: boolean; update: (patch: Partial<GameState>) => void }) {
  return (
    <section className="rounded-3xl border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2 text-base font-bold">
        <Zap className="h-5 w-5 text-warning-foreground" /> 开业夜事件
      </div>
      <div className="mt-3 space-y-2">
        {(Object.keys(events) as EventChoice[]).map((event) => {
          const Icon = events[event].icon;
          return (
            <button
              key={event}
              disabled={disabled}
              onClick={() => update({ event })}
              className={`w-full rounded-2xl border p-3 text-left transition-all ${
                current === event ? "border-primary bg-accent" : "bg-secondary/40 hover:border-primary/50"
              } disabled:cursor-not-allowed disabled:opacity-55`}
            >
              <div className="flex items-center gap-2 text-sm font-bold">
                <Icon className="h-4 w-4 text-primary" /> {events[event].label}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{events[event].desc}</div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function Timeline({ phase, ran }: { phase: SimPhase; ran: boolean }) {
  const activeIndex = phase === "idle" ? 0 : phase === "running" ? 2 : 3;
  return (
    <section className="rounded-3xl border bg-card p-5 shadow-sm">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        {[
          ["18:00", "订单入波", "按门店承诺时间与温控要求分 wave"],
          ["18:40", "主线分拣", "分拣岗处理高峰订单，异常件进入旁路"],
          ["19:30", "复核装车", "扫码复核、装车交接、生成发车缓冲"],
          ["20:00", "教师复核", "记录首次尝试、AI 提问和修改证据"],
        ].map(([time, title, desc], index) => (
          <div key={title} className={`rounded-2xl border p-3 ${ran || index <= activeIndex ? "bg-primary/5" : "bg-secondary/40"} ${phase === "running" && index === activeIndex ? "ring-2 ring-primary/20" : ""}`}>
            <div className="font-mono text-xs font-bold text-primary">{time}</div>
            <div className="mt-1 text-sm font-bold">{title}</div>
            <div className="mt-1 text-xs text-muted-foreground">{desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ResultCard({ phase, ran, result }: { phase: SimPhase; ran: boolean; result: GameResult }) {
  return (
    <section className={`rounded-3xl border p-5 shadow-sm ${ran ? "bg-card" : "bg-primary/5"}`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-base font-bold">
            {ran ? <CheckCircle2 className="h-5 w-5 text-success" /> : <Bot className={`h-5 w-5 text-primary ${phase === "running" ? "animate-pulse" : ""}`} />}
            {phase === "running" ? "正在生成开业夜战报" : ran ? result.resultTitle : "运行后生成开业夜战报"}
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {phase === "running"
              ? "系统正在计算 wave 上限、异常件复核、装车交接和配送缓冲。"
              : ran
                ? `${result.bottleneck} 你可以带着本轮结果进入 AI 提问教练，要求 AI 先检查硬约束，再给修改方向。`
                : "先在右侧设置分拣方案，然后点击运行仿真。系统会展示是否守住硬约束，以及你的方案如何影响准时率、准确率、成本和配送缓冲。"}
          </p>
        </div>
        <a
          href="/v2/student/assistant"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold text-primary-foreground"
          style={{ background: "var(--gradient-hero)" }}
        >
          带问题去问 AI <Bot className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
}

function KpiCard({ icon: Icon, label, tone, value }: { icon: typeof Clock3; label: string; tone: "green" | "yellow" | "red"; value: string }) {
  const color = {
    green: "bg-success/10 text-success border-success/20",
    yellow: "bg-warning/20 text-warning-foreground border-warning/30",
    red: "bg-destructive/10 text-destructive border-destructive/20",
  }[tone];
  return (
    <div className={`rounded-3xl border p-4 shadow-sm ${color}`}>
      <div className="flex items-center justify-between text-xs font-semibold opacity-80">
        <span>{label}</span>
        <Icon className="h-4 w-4" />
      </div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
    </div>
  );
}

function DecisionGroup({ children, title }: { children: ReactNode; title: string }) {
  return (
    <div>
      <div className="mb-2 text-sm font-bold">{title}</div>
      <div className="grid grid-cols-1 gap-2">{children}</div>
    </div>
  );
}

function ChoiceButton({
  active,
  desc,
  disabled = false,
  onClick,
  title,
}: {
  active: boolean;
  desc: string;
  disabled?: boolean;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`rounded-2xl border p-3 text-left transition-all ${
        active ? "border-primary bg-accent shadow-sm" : "bg-secondary/40 hover:border-primary/50"
      } disabled:cursor-not-allowed disabled:opacity-55`}
    >
      <div className="text-sm font-bold">{title}</div>
      <div className="mt-1 text-xs text-muted-foreground">{desc}</div>
    </button>
  );
}

function Counter({
  disabled,
  label,
  max,
  min,
  onChange,
  value,
}: {
  disabled: boolean;
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  value: number;
}) {
  return (
    <div className="mb-3 last:mb-0">
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-semibold text-muted-foreground">{label}</span>
        <span className="font-mono text-primary">{value} 人</span>
      </div>
      <input
        disabled={disabled}
        className="w-full accent-primary"
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}

function diagnose(result: GameResult) {
  return [
    {
      title: result.hardFail ? "硬约束失败：wave 超过 80 carts" : "硬约束检查通过",
      text: result.hardFail ? "正式任务里这会直接判为无效方案，应先拆分 wave。" : "当前最大 wave 未超过 80 carts，可以继续优化效率和成本。",
      danger: result.hardFail,
    },
    {
      title: result.buffer < 30 ? "配送缓冲偏低" : "配送缓冲可接受",
      text: result.buffer < 30 ? "分拣完成时间压缩了后续发车窗口，门店准时风险升高。" : "当前分拣-配送接口比较健康。",
      danger: result.buffer < 30,
    },
    {
      title: result.accuracy < 93 ? "错分风险偏高" : "准确率表现较好",
      text: result.accuracy < 93 ? "建议提高识别方式或开启异常件旁路复核。" : "当前质检配置能较好保护客户信任。",
      danger: result.accuracy < 93,
    },
  ];
}

function calculateResult(game: GameState): GameResult {
  const goal = goals[game.goal];
  const scan = scanModes[game.scanMode];
  const dispatch = dispatchModes[game.dispatch];
  const event = events[game.event];
  const totalStaff = game.sortingStaff + game.qcStaff + game.loadingStaff;
  const overStaff = Math.max(0, totalStaff - 10);
  const underStaff = Math.max(0, 9 - totalStaff);
  const waveBase = game.waveTarget + event.wave;
  const waves = buildWaves(waveBase, game.exceptionLane);
  const maxWave = Math.max(...waves.map((wave) => wave.carts));
  const hardFail = maxWave > 80;
  const wavePenalty = Math.max(0, maxWave - 80) * 2.8 + Math.max(0, maxWave - 76) * 0.7;
  const qcBonus = game.qcStaff * 1.9 + (game.exceptionLane ? 4.5 : -3.5);
  const staffSpeed = game.sortingStaff * 2.3 + game.loadingStaff * 2.8 - underStaff * 4.2;
  const questionQuality = prompts[game.prompt].score;

  const onTime = clamp(Math.round(67 + staffSpeed + goal.onTime + scan.speed + dispatch.onTime + event.buffer - wavePenalty), 32, 99);
  const accuracy = clamp(Number((87 + scan.accuracy + qcBonus + goal.accuracy + event.accuracy - Math.max(0, maxWave - 78) * 0.22).toFixed(1)), 68, 99.6);
  const cost = Math.round(720 + totalStaff * 118 + overStaff * 210 + goal.cost + scan.cost + dispatch.cost + (game.exceptionLane ? 120 : 0));
  const buffer = clamp(Math.round(20 + game.loadingStaff * 5 + dispatch.buffer + event.buffer + (maxWave <= 76 ? 6 : 0) - Math.max(0, maxWave - 80) * 2), 0, 75);
  const rework = clamp(Math.round((100 - accuracy) * 2.2 + (hardFail ? 12 : 0)), 0, 70);
  const trust = clamp(Math.round(52 + accuracy * 0.35 + onTime * 0.28 + buffer * 0.18 - rework * 0.15), 20, 99);
  const score = clamp(Math.round(onTime * 0.28 + accuracy * 0.25 + Math.min(100, buffer * 1.7) * 0.17 + trust * 0.16 + questionQuality * 5 - (hardFail ? 22 : 0) - Math.max(0, cost - 1750) * 0.012), 0, 100);

  const resultTitle = hardFail
    ? "硬约束失败：先拆 wave"
    : score >= 86
      ? "优秀方案：可进入正式任务"
      : score >= 72
        ? "有效方案：建议再优化"
        : "方案风险偏高：需要重试";

  const bottleneck = hardFail
    ? "最大 wave carts 超过 80。正式提交前必须先拆分波次，否则方案无效。"
    : buffer < 30
      ? "配送缓冲不足。你的分拣完成时间会挤压后续发车窗口。"
      : accuracy < 93
        ? "错分风险偏高。建议增加复核岗、启用条码/RFID 或开启异常件旁路。"
        : cost > 1900
          ? "方案稳定但成本偏高。下一轮可以尝试减少临时投入，同时守住准确率。"
          : "方案较均衡。可以进入正式 Week 8 分拣任务，并补充解释为什么这样配置。";

  return {
    score,
    onTime,
    accuracy,
    cost,
    buffer,
    maxWave,
    questionQuality,
    bottleneck,
    hardFail,
    resultTitle,
    trust,
    rework,
    waves,
    profile: [
      {
        label: "约束识别",
        value: clamp(100 - Math.max(0, maxWave - 80) * 12 - Math.max(0, maxWave - 76) * 2, 35, 98),
        note: hardFail ? "仍需先修正 80 carts 硬约束。" : "能守住 80 carts 硬约束。",
      },
      {
        label: "资源配置",
        value: clamp(58 + totalStaff * 3 + game.qcStaff * 2 - overStaff * 6, 35, 96),
        note: overStaff ? "配置有效但临时用工成本偏高。" : "人手配置在可解释范围内。",
      },
      {
        label: "系统联动",
        value: clamp(48 + buffer + (game.dispatch !== "full" ? 8 : -5), 35, 96),
        note: "能看到分拣完成时间对配送缓冲的影响。",
      },
      {
        label: "AI 提问",
        value: questionQuality * 19,
        note: questionQuality >= 4 ? "提问已包含上下文和判断标准。" : "需要补充背景、目标、约束和已有尝试。",
      },
    ],
  };
}

function buildWaves(target: number, exceptionLane: boolean): WaveState[] {
  const adjustment = exceptionLane ? -4 : 3;
  const carts = [target, target - 9 + adjustment, target - 15 + Math.round(adjustment / 2)];
  return carts.map((cart, index) => ({
    id: `Wave ${index + 1}`,
    carts: Math.max(44, cart),
    status: cart > 80 ? "超限" : cart >= 76 ? "接近红线" : "安全",
  }));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
