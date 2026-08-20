import { EmptyState } from "@/components/EmptyState";
import { MetricCard } from "@/components/MetricCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatDuration, POSITION_LABELS } from "@/lib/patio";
import { trpc } from "@/lib/trpc";
import {
  AlertTriangle,
  Banknote,
  BarChart3,
  CalendarDays,
  CarFront,
  Clock3,
  Plus,
  RefreshCw,
  Siren,
  Trophy,
  UsersRound,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const today = new Date();
const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

function getMonthRange(month: string) {
  const [year, monthIndex] = month.split("-").map(Number);
  const start = new Date(year, monthIndex - 1, 1).getTime();
  const monthEnd = new Date(year, monthIndex, 1).getTime() - 1;
  return {
    rangeStart: start,
    rangeEnd: month === currentMonth ? Date.now() : monthEnd,
  };
}

function formatMoney(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

type PlatePopup =
  | {
      title: string;
      description: string;
      rows: Array<{ id: number | string; primary: string; secondary?: string }>;
    }
  | null;

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const [month, setMonth] = useState(currentMonth);
  const [selectedCollaboratorId, setSelectedCollaboratorId] = useState<number | null>(null);
  const [platePopup, setPlatePopup] = useState<PlatePopup>(null);
  const range = useMemo(() => getMonthRange(month), [month]);
  const { data, isLoading, isError, error, refetch, isFetching } = trpc.dashboard.overview.useQuery(range, {
    refetchInterval: 15_000,
  });
  const { data: occurrenceSummary } = trpc.occurrences.summary.useQuery(undefined, {
    refetchInterval: 8_000,
    refetchIntervalInBackground: true,
  });

  const averageData = useMemo(
    () => data?.averageStageTime.map(item => ({ ...item, hours: Math.round((item.averageMs / 3_600_000) * 10) / 10 })) ?? [],
    [data],
  );
  const bottleneck = useMemo(
    () => [...averageData].filter(item => item.averageMs > 0).sort((a, b) => b.averageMs - a.averageMs)[0],
    [averageData],
  );
  const selectedCollaborator = data?.productivity.find(item => item.collaboratorId === (selectedCollaboratorId ?? data.productivity[0]?.collaboratorId));
  const maxCompleted = Math.max(1, ...(data?.productivity.map(item => item.completedStages) ?? [1]));

  if (isError) {
    return <EmptyState icon={AlertTriangle} title="Falha ao calcular os indicadores" description={error.message} action={<Button variant="outline" onClick={() => void refetch()}><RefreshCw className="size-4" /> Tentar novamente</Button>} />;
  }

  const occupancyTone =
    data?.occupancyTone === "green"
      ? "positive"
      : data?.occupancyTone === "yellow"
        ? "warning"
        : data?.occupancyTone === "red"
          ? "critical"
          : "default";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button onClick={() => setLocation("/ordens-servico/nova")}>
          <Plus className="size-4" />
          Nova OS
        </Button>
        <Input
          type="month"
          value={month}
          max={currentMonth}
          onChange={event => setMonth(event.target.value)}
          className="w-40 bg-card"
          aria-label="Mês de análise"
        />
        <Button
          variant="outline"
          size="icon"
          onClick={() => void refetch()}
          disabled={isFetching}
          aria-label="Atualizar indicadores"
        >
          <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {occurrenceSummary?.active ? (
        <section className={`flex flex-col gap-4 rounded-2xl border p-4 shadow-panel sm:flex-row sm:items-center sm:justify-between ${occurrenceSummary.critical ? "border-primary/45 bg-[linear-gradient(110deg,rgba(209,10,17,0.12),rgba(18,18,18,0.96)_55%)]" : "border-orange-500/25 bg-orange-500/[0.045]"}`}>
          <div className="flex items-start gap-3">
            <div className={`grid size-11 shrink-0 place-items-center rounded-xl border ${occurrenceSummary.critical ? "border-primary/30 bg-primary/12 text-primary" : "border-orange-500/25 bg-orange-500/10 text-orange-300"}`}><Siren className="size-5" /></div>
            <div><p className="font-display text-lg font-bold uppercase italic">{occurrenceSummary.active} ocorrência{occurrenceSummary.active === 1 ? "" : "s"} exige{occurrenceSummary.active === 1 ? "" : "m"} atenção</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{occurrenceSummary.critical ? `${occurrenceSummary.critical} crítica${occurrenceSummary.critical === 1 ? "" : "s"}` : "Nenhuma crítica"} · {occurrenceSummary.byType.missing_part} peça{occurrenceSummary.byType.missing_part === 1 ? "" : "s"} faltante{occurrenceSummary.byType.missing_part === 1 ? "" : "s"} · {occurrenceSummary.unassigned} sem responsável</p></div>
          </div>
          <Button variant={occurrenceSummary.critical ? "default" : "outline"} onClick={() => setLocation("/ocorrencias")}><Siren className="size-4" /> Abrir Central</Button>
        </section>
      ) : null}

      {isLoading || !data ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard
              label="Veículos no pátio"
              value={`${data.totalActive}/${data.yardCapacity}`}
              caption={`${data.occupancyPct}% da capacidade · clique para ver placas`}
              icon={CarFront}
              tone={occupancyTone}
              onClick={() =>
                setPlatePopup({
                  title: "Veículos no pátio",
                  description: "Passagens ativas neste momento",
                  rows: data.activePlates.map(item => ({
                    id: item.id,
                    primary: item.plate,
                    secondary: item.model,
                  })),
                })
              }
              footer={<MetricFooter label="Próximos do prazo" value={`${data.dueSoon} em 24h`} />}
            />
            <MetricCard
              label="Atrasados"
              value={data.overdue}
              caption="Prazo estimado já ultrapassado"
              icon={AlertTriangle}
              tone={data.overdue ? "critical" : "positive"}
              onClick={() =>
                setPlatePopup({
                  title: "Veículos atrasados",
                  description: "Prazo estimado ultrapassado",
                  rows: data.overduePlates.map(item => ({
                    id: item.id,
                    primary: item.plate,
                    secondary: item.model,
                  })),
                })
              }
              footer={<MetricFooter label="Incidência" value={data.totalActive ? `${Math.round((data.overdue / data.totalActive) * 100)}% do pátio` : "Sem veículos"} />}
            />
            <MetricCard
              label="Dinheiro do pátio"
              value={formatMoney(data.moneyInYardCents)}
              caption="Aprovado em ag. peças, execução, teste e pronto"
              icon={Wallet}
              tone="premium"
              onClick={() =>
                setPlatePopup({
                  title: "Dinheiro do pátio",
                  description: "Valor aprovado ainda no pátio",
                  rows: data.moneyInYardVehicles.map(item => ({
                    id: item.id,
                    primary: item.plate,
                    secondary: `${item.model} · ${formatMoney(item.approvedCents)}`,
                  })),
                })
              }
              footer={<MetricFooter label="Veículos" value={`${data.moneyInYardVehicles.length} no cálculo`} />}
            />
            <MetricCard
              label="Agendamentos do dia"
              value={data.appointmentsTodayCount}
              caption="Agenda de hoje"
              icon={CalendarDays}
              onClick={() =>
                setPlatePopup({
                  title: "Agendamentos do dia",
                  description: "Compromissos de hoje",
                  rows: data.appointmentsToday.map(item => ({
                    id: item.id,
                    primary: item.plate ?? item.label,
                    secondary: item.plate ? item.label : undefined,
                  })),
                })
              }
              footer={<MetricFooter label="Hoje" value={today.toLocaleDateString("pt-BR")} />}
            />
            <MetricCard
              label="Previsão de caixa"
              value={formatMoney(data.cashForecastCents)}
              caption="Provisório · prazo estimado = hoje"
              icon={Banknote}
              tone="premium"
              onClick={() =>
                setPlatePopup({
                  title: "Previsão de caixa do dia",
                  description: "Valor aprovado com prazo estimado para hoje",
                  rows: data.cashForecastVehicles.map(item => ({
                    id: item.id,
                    primary: item.plate,
                    secondary: `${item.model} · ${formatMoney(item.approvedCents)}`,
                  })),
                })
              }
              footer={<MetricFooter label="Status" value="Provisório" />}
            />
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
            <Panel title="Distribuição atual do pátio" subtitle="Quantidade de veículos em cada etapa" icon={BarChart3}>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.stageDistribution} margin={{ top: 10, right: 6, left: -26, bottom: 20 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.055)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: "#8c8c8c", fontSize: 10 }} axisLine={false} tickLine={false} interval={0} angle={-24} textAnchor="end" height={55} />
                    <YAxis allowDecimals={false} tick={{ fill: "#8c8c8c", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: "rgba(209,10,17,0.055)" }} contentStyle={{ background: "#151515", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#f8f8f8", fontSize: 12 }} formatter={value => [Number(value), "Veículos"]} />
                    <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={38}>{data.stageDistribution.map((entry, index) => <Cell key={entry.stage} fill={entry.total ? index === 0 ? "#D10A11" : `rgba(209,10,17,${Math.max(0.32, 0.88 - index * 0.07)})` : "rgba(255,255,255,0.08)"} />)}</Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel title="Tempo médio por etapa" subtitle="Com base em transições concluídas no período" icon={Clock3}>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={averageData} layout="vertical" margin={{ top: 5, right: 18, left: 10, bottom: 5 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.055)" horizontal={false} />
                    <XAxis type="number" tick={{ fill: "#8c8c8c", fontSize: 10 }} axisLine={false} tickLine={false} unit="h" />
                    <YAxis type="category" dataKey="label" width={76} tick={{ fill: "#b8b8b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: "rgba(209,10,17,0.055)" }} contentStyle={{ background: "#151515", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#f8f8f8", fontSize: 12 }} formatter={(value, _name, item) => [`${Number(value).toLocaleString("pt-BR")} h`, `${item.payload.completedTransitions} transições`]} />
                    <Bar dataKey="hours" fill="#D10A11" radius={[0, 6, 6, 0]} maxBarSize={18} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 rounded-xl border border-border bg-background/40 p-3 text-xs text-muted-foreground">
                {bottleneck ? <>Maior tempo médio: <strong className="text-foreground">{bottleneck.label}</strong>, com <strong className="text-primary">{formatDuration(bottleneck.averageMs)}</strong>.</> : "Ainda não há transições concluídas suficientes para identificar gargalos."}
              </div>
            </Panel>
          </div>

          <Panel title="Produtividade por colaborador" subtitle="Etapas concluídas no mês; selecione uma pessoa para ver os veículos atendidos" icon={UsersRound}>
            {data.productivity.length ? (
              <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-2">
                  {data.productivity.map((person, index) => {
                    const selected = person.collaboratorId === selectedCollaborator?.collaboratorId;
                    return (
                      <button key={person.collaboratorId} type="button" onClick={() => setSelectedCollaboratorId(person.collaboratorId)} className={`w-full rounded-xl border p-3.5 text-left transition ${selected ? "border-primary/45 bg-primary/[0.06]" : "border-border bg-background/30 hover:border-primary/25"}`}>
                        <div className="flex items-center gap-3">
                          <span className={`grid size-8 shrink-0 place-items-center rounded-lg font-display text-lg font-bold ${index === 0 ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>{index + 1}</span>
                          <div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><p className="truncate text-sm font-semibold">{person.name}</p><strong className="font-mono text-sm text-primary">{person.completedStages}</strong></div><p className="mt-1 text-[0.65rem] uppercase tracking-wider text-muted-foreground">{POSITION_LABELS[person.position as keyof typeof POSITION_LABELS] || person.position} · {person.vehiclesHandled} veículos</p><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${(person.completedStages / maxCompleted) * 100}%` }} /></div></div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="rounded-2xl border border-border bg-background/35 p-5">
                  {selectedCollaborator ? (
                    <>
                      <div className="flex items-start justify-between gap-4"><div><p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-primary">Detalhamento</p><h3 className="mt-2 font-display text-2xl font-bold uppercase tracking-wide">{selectedCollaborator.name}</h3><p className="mt-1 text-xs text-muted-foreground">Tempo médio por etapa: {formatDuration(selectedCollaborator.averageDurationMs)}</p></div><Trophy className="size-6 text-primary" /></div>
                      <div className="mt-5 grid grid-cols-2 gap-3"><SmallStat label="Etapas" value={selectedCollaborator.completedStages} /><SmallStat label="Veículos" value={selectedCollaborator.vehiclesHandled} /></div>
                      <div className="mt-5 border-t border-border pt-4"><p className="mb-3 text-xs font-semibold text-foreground">Placas trabalhadas no período</p>{selectedCollaborator.vehicles.length ? <div className="flex flex-wrap gap-2">{selectedCollaborator.vehicles.map(vehicle => <Badge key={vehicle.id} variant="outline" className="font-mono">{vehicle.plate} · {vehicle.model}</Badge>)}</div> : <p className="text-xs leading-5 text-muted-foreground">Nenhuma etapa concluída por este colaborador no período selecionado.</p>}</div>
                    </>
                  ) : null}
                </div>
              </div>
            ) : (
              <EmptyState icon={UsersRound} title="Sem produtividade calculada" description="Cadastre colaboradores e conclua transições para gerar o ranking do período." />
            )}
          </Panel>
        </>
      )}

      <Dialog open={Boolean(platePopup)} onOpenChange={open => !open && setPlatePopup(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{platePopup?.title}</DialogTitle>
            <DialogDescription>{platePopup?.description}</DialogDescription>
          </DialogHeader>
          {platePopup?.rows.length ? (
            <ul className="space-y-2">
              {platePopup.rows.map(row => (
                <li
                  key={row.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-card/60 px-3 py-2.5"
                >
                  <span className="font-mono text-sm font-semibold tracking-wide">{row.primary}</span>
                  {row.secondary ? (
                    <span className="truncate text-xs text-muted-foreground">{row.secondary}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhum veículo nesta visão.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Panel({ title, subtitle, icon: Icon, children }: { title: string; subtitle: string; icon: typeof BarChart3; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-border bg-card/75 p-5 shadow-panel"><header className="mb-5 flex items-start gap-3"><div className="grid size-10 shrink-0 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary"><Icon className="size-5" /></div><div><h2 className="font-display text-xl font-bold uppercase tracking-wide">{title}</h2><p className="mt-1 text-xs text-muted-foreground">{subtitle}</p></div></header>{children}</section>;
}

function MetricFooter({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between gap-3 text-[0.68rem]"><span className="text-muted-foreground">{label}</span><span className="font-medium text-foreground">{value}</span></div>; }
function SmallStat({ label, value }: { label: string; value: number }) { return <div className="rounded-xl border border-border bg-card/55 p-3"><p className="text-[0.62rem] uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-1 font-display text-2xl font-bold">{value}</p></div>; }
function DashboardSkeleton() { return <div className="space-y-5"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-44 animate-pulse rounded-2xl bg-card" />)}</div><div className="grid gap-5 xl:grid-cols-2">{Array.from({ length: 2 }).map((_, index) => <div key={index} className="h-96 animate-pulse rounded-2xl bg-card" />)}</div></div>; }
