import { EmptyState } from "@/components/EmptyState";
import { OccurrenceDetailSheet } from "@/components/OccurrenceDetailSheet";
import { OccurrenceFormDialog } from "@/components/OccurrenceFormDialog";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  OCCURRENCE_ICONS,
  OCCURRENCE_SEVERITY_STYLES,
  OCCURRENCE_STATUS_STYLES,
  formatOccurrenceAge,
} from "@/lib/occurrences";
import { formatPlate } from "@/lib/patio";
import { trpc } from "@/lib/trpc";
import {
  OCCURRENCE_SEVERITIES,
  OCCURRENCE_SEVERITY_META,
  OCCURRENCE_STATUSES,
  OCCURRENCE_STATUS_META,
  OCCURRENCE_TYPES,
  OCCURRENCE_TYPE_META,
  type OccurrenceSeverity,
  type OccurrenceStatus,
  type OccurrenceType,
} from "@shared/patio";
import { AlertTriangle, FilterX, Plus, RadioTower, RefreshCw, Search, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function OccurrencesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<OccurrenceStatus | "active" | "all">("active");
  const [type, setType] = useState<OccurrenceType | "all">("all");
  const [severity, setSeverity] = useState<OccurrenceSeverity | "all">("all");
  const [responsibleId, setResponsibleId] = useState("all");
  const [vehicleId, setVehicleId] = useState<number | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedVehicleId = Number(params.get("vehicle"));
    const requestedOccurrenceId = Number(params.get("occurrence"));
    if (Number.isInteger(requestedVehicleId) && requestedVehicleId > 0) setVehicleId(requestedVehicleId);
    if (Number.isInteger(requestedOccurrenceId) && requestedOccurrenceId > 0) setSelectedId(requestedOccurrenceId);
  }, []);

  const input = useMemo(() => ({
    search: search || undefined,
    status: status !== "active" && status !== "all" ? status : undefined,
    activeOnly: status === "active" ? true : undefined,
    type: type === "all" ? undefined : type,
    severity: severity === "all" ? undefined : severity,
    responsibleCollaboratorId: responsibleId === "all" ? undefined : Number(responsibleId),
    vehicleId: vehicleId ?? undefined,
  }), [responsibleId, search, severity, status, type, vehicleId]);
  const { data: occurrences = [], isLoading, isError, error, refetch } = trpc.occurrences.list.useQuery(input, { refetchInterval: 8_000, refetchIntervalInBackground: true });
  const { data: summary } = trpc.occurrences.summary.useQuery(undefined, { refetchInterval: 8_000, refetchIntervalInBackground: true });
  const { data: collaborators = [] } = trpc.collaborators.list.useQuery({ includeInactive: false });

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Comunicação operacional" title="Ocorrências e avisos" description="Problemas, peças, atrasos, BOs e recados operacionais em um único lugar. Registre, atribua e atualize para que todo mundo trabalhe com a mesma informação." actions={<Button onClick={() => setNewOpen(true)}><Plus className="size-4" /> Novo aviso</Button>} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SignalMetric label="Abertas e em andamento" value={summary?.active ?? 0} tone="red" />
        <SignalMetric label="Críticas" value={summary?.critical ?? 0} tone="red" />
        <SignalMetric label="Sem responsável" value={summary?.unassigned ?? 0} tone="amber" />
        <SignalMetric label="Peças faltantes" value={summary?.byType.missing_part ?? 0} tone="neutral" />
      </div>

      {vehicleId ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/[0.045] px-4 py-3 text-sm">
          <span>Exibindo somente ocorrências do veículo selecionado.</span>
          <Button variant="ghost" size="sm" onClick={() => { setVehicleId(null); window.history.replaceState(null, "", "/ocorrencias"); }}>Ver todas</Button>
        </div>
      ) : null}

      <div className="grid gap-3 rounded-2xl border border-border bg-card/70 p-3 shadow-panel md:grid-cols-2 xl:grid-cols-[minmax(220px,1.35fr)_repeat(4,minmax(0,0.75fr))_44px]">
        <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar placa, título ou descrição" /></div>
        <Select value={status} onValueChange={value => setStatus(value as typeof status)}><SelectTrigger className="w-full min-w-0"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Pendentes</SelectItem><SelectItem value="all">Todos os status</SelectItem>{OCCURRENCE_STATUSES.map(item => <SelectItem key={item} value={item}>{OCCURRENCE_STATUS_META[item].label}</SelectItem>)}</SelectContent></Select>
        <Select value={type} onValueChange={value => setType(value as typeof type)}><SelectTrigger className="w-full min-w-0"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos os tipos</SelectItem>{OCCURRENCE_TYPES.map(item => <SelectItem key={item} value={item}>{OCCURRENCE_TYPE_META[item].label}</SelectItem>)}</SelectContent></Select>
        <Select value={severity} onValueChange={value => setSeverity(value as typeof severity)}><SelectTrigger className="w-full min-w-0"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todas as gravidades</SelectItem>{OCCURRENCE_SEVERITIES.map(item => <SelectItem key={item} value={item}>{OCCURRENCE_SEVERITY_META[item].label}</SelectItem>)}</SelectContent></Select>
        <Select value={responsibleId} onValueChange={setResponsibleId}><SelectTrigger className="w-full min-w-0"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos os responsáveis</SelectItem>{collaborators.map(item => <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>)}</SelectContent></Select>
        <Button variant="ghost" size="icon" className="justify-self-end md:col-span-2 xl:col-span-1" aria-label="Limpar filtros" onClick={() => { setSearch(""); setStatus("active"); setType("all"); setSeverity("all"); setResponsibleId("all"); }}><FilterX className="size-4" /></Button>
      </div>

      {isError ? <EmptyState icon={AlertTriangle} title="Falha ao carregar ocorrências e avisos" description={error.message} action={<Button variant="outline" onClick={() => void refetch()}><RefreshCw className="size-4" /> Tentar novamente</Button>} /> : isLoading ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-64 animate-pulse rounded-2xl bg-card" />)}</div> : occurrences.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{occurrences.map(item => <OccurrenceCard key={item.id} occurrence={item} onOpen={() => setSelectedId(item.id)} />)}</div> : <EmptyState icon={RadioTower} title="Nenhuma ocorrência ou aviso neste filtro" description="A comunicação operacional está limpa. Use Novo aviso quando algo fugir do plano." action={<Button onClick={() => setNewOpen(true)}><Plus className="size-4" /> Registrar aviso</Button>} />}

      <OccurrenceFormDialog open={newOpen} onOpenChange={setNewOpen} />
      <OccurrenceDetailSheet occurrenceId={selectedId} open={Boolean(selectedId)} onOpenChange={open => { if (!open) setSelectedId(null); }} />
    </div>
  );
}

function OccurrenceCard({ occurrence, onOpen }: { occurrence: Awaited<ReturnType<typeof useOccurrenceType>>; onOpen: () => void }) {
  const Icon = OCCURRENCE_ICONS[occurrence.type];
  return <button type="button" onClick={onOpen} className={`group relative overflow-hidden rounded-2xl border bg-card p-5 text-left shadow-panel transition-[transform,border-color,box-shadow] hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_18px_45px_rgba(0,0,0,0.3)] ${occurrence.severity === "critical" ? "border-primary/50 bg-[linear-gradient(145deg,rgba(209,10,17,0.10),rgba(18,18,18,0.97)_48%)]" : "border-border"}`}>
    <div className={`absolute inset-x-0 top-0 h-0.5 ${occurrence.severity === "critical" ? "bg-primary" : occurrence.severity === "high" ? "bg-orange-500" : "bg-amber-500/60"}`} />
    <div className="flex items-start justify-between gap-3"><div className="grid size-10 place-items-center rounded-xl border border-border bg-muted/35 text-primary"><Icon className="size-5" /></div><span className="font-mono text-[0.66rem] text-muted-foreground">#{String(occurrence.id).padStart(4, "0")}</span></div>
    <div className="mt-4 flex flex-wrap gap-1.5"><Badge variant="outline" className={OCCURRENCE_SEVERITY_STYLES[occurrence.severity]}>{OCCURRENCE_SEVERITY_META[occurrence.severity].label}</Badge><Badge variant="outline" className={OCCURRENCE_STATUS_STYLES[occurrence.status]}>{OCCURRENCE_STATUS_META[occurrence.status].label}</Badge><Badge variant="outline">{OCCURRENCE_TYPE_META[occurrence.type].label}</Badge></div>
    <h2 className="mt-4 line-clamp-2 font-display text-lg font-bold uppercase italic leading-tight">{occurrence.title}</h2>
    <p className="mt-2 line-clamp-2 text-sm leading-5 text-muted-foreground">{occurrence.description}</p>
    {occurrence.vehicleId ? <div className="mt-4 rounded-xl border border-border/70 bg-background/45 px-3 py-2"><p className="font-mono text-xs font-semibold tracking-wider">{occurrence.vehiclePlate ? formatPlate(occurrence.vehiclePlate) : "Veículo"}</p><p className="mt-0.5 truncate text-[0.68rem] text-muted-foreground">{occurrence.vehicleModel}</p></div> : null}
    <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/70 pt-3 text-xs text-muted-foreground"><span className="flex min-w-0 items-center gap-2"><UserRound className="size-3.5 shrink-0" /><span className="truncate">{occurrence.responsibleName || "Responsável a definir"}</span></span><span className="shrink-0">{formatOccurrenceAge(occurrence.createdAt)}</span></div>
  </button>;
}

function useOccurrenceType() {
  return {} as import("@/lib/routerTypes").OccurrenceItem;
}

function SignalMetric({ label, value, tone }: { label: string; value: number; tone: "red" | "amber" | "neutral" }) {
  return <div className={`rounded-2xl border p-4 ${tone === "red" && value > 0 ? "border-primary/35 bg-primary/[0.06]" : tone === "amber" && value > 0 ? "border-amber-500/25 bg-amber-500/[0.04]" : "border-border bg-card/70"}`}><p className="text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p><p className={`mt-2 font-display text-3xl font-bold tabular-nums ${tone === "red" && value > 0 ? "text-primary" : tone === "amber" && value > 0 ? "text-amber-300" : "text-foreground"}`}>{value}</p></div>;
}
