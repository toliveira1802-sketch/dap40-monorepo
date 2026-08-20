import { DeadlineBadge } from "@/components/DeadlineBadge";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { VehicleDetailSheet } from "@/components/VehicleDetailSheet";
import { VehicleFormDialog } from "@/components/VehicleFormDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatMileage, formatPlate, PRIORITY_LABELS } from "@/lib/patio";
import type { YardVehicleItem } from "@/lib/routerTypes";
import { trpc } from "@/lib/trpc";
import { PATIO_STAGES, PATIO_STAGE_META } from "@shared/patio";
import { AlertTriangle, CarFront, Eye, FilterX, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";

type StatusFilter = "active" | "delivered" | "cancelled";
type DeadlineFilter = "all" | "overdue" | "dueSoon" | "onTrack";

export default function VehiclesPage() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("active");
  const [stage, setStage] = useState("all");
  const [collaboratorId, setCollaboratorId] = useState("all");
  const [deadline, setDeadline] = useState<DeadlineFilter>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const vehicleId = Number(params.get("vehicle"));
    const requestedStatus = params.get("status");
    const createRequested = params.get("novo") === "1";
    if (Number.isInteger(vehicleId) && vehicleId > 0) setSelectedVehicleId(vehicleId);
    if (createRequested) {
      setLocation("/ordens-servico/nova");
      return;
    }
    if (requestedStatus === "active" || requestedStatus === "delivered" || requestedStatus === "cancelled") {
      setStatus(requestedStatus);
    }
  }, [setLocation]);

  const input = useMemo(
    () => ({
      search: search || undefined,
      status,
      stage: stage === "all" ? undefined : (stage as (typeof PATIO_STAGES)[number]),
      collaboratorId: collaboratorId === "all" ? undefined : Number(collaboratorId),
      deadline: deadline === "all" ? undefined : deadline,
    }),
    [collaboratorId, deadline, search, stage, status],
  );
  const {
    data: vehicles = [],
    isLoading,
    isError,
    error,
    refetch,
  } = trpc.patio.list.useQuery(input, { refetchInterval: 8_000 });
  const { data: collaborators = [], isError: collaboratorsError } = trpc.collaborators.list.useQuery({
    includeInactive: false,
  });
  const selectedVehicle = vehicles.find(vehicle => vehicle.id === selectedVehicleId) ?? null;

  const clearFilters = () => {
    setSearch("");
    setStage("all");
    setCollaboratorId("all");
    setDeadline("all");
  };

  const openCreate = () => {
    setLocation("/ordens-servico/nova");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Base operacional"
        title="Veículos"
        description="Consulte passagens ativas e encerradas, localize rapidamente uma placa e mantenha dados e prazos atualizados."
        actions={<Button onClick={openCreate}><Plus className="size-4" /> Nova entrada</Button>}
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {([
          ["active", "No pátio"],
          ["delivered", "Entregues"],
          ["cancelled", "Cancelados"],
        ] as const).map(([value, label]) => (
          <Button key={value} variant={status === value ? "default" : "outline"} size="sm" onClick={() => { setStatus(value); setSelectedVehicleId(null); }} className="shrink-0">
            {label}
          </Button>
        ))}
      </div>

      <div className="grid gap-3 rounded-2xl border border-border bg-card/75 p-4 shadow-panel md:grid-cols-2 xl:grid-cols-[minmax(260px,1.6fr)_1fr_1fr_1fr_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" value={search} onChange={event => setSearch(event.target.value)} placeholder="Placa, cliente ou modelo" />
        </div>
        <Select value={stage} onValueChange={setStage} disabled={status !== "active"}>
          <SelectTrigger><SelectValue placeholder="Etapa" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as etapas</SelectItem>
            {PATIO_STAGES.map(item => <SelectItem key={item} value={item}>{PATIO_STAGE_META[item].label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={collaboratorId} onValueChange={setCollaboratorId} disabled={status !== "active"}>
          <SelectTrigger><SelectValue placeholder="Responsável" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os responsáveis</SelectItem>
            {collaborators.map(item => <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={deadline} onValueChange={value => setDeadline(value as DeadlineFilter)} disabled={status !== "active"}>
          <SelectTrigger><SelectValue placeholder="Prazo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os prazos</SelectItem>
            <SelectItem value="overdue">Atrasados</SelectItem>
            <SelectItem value="dueSoon">Vencem em 24h</SelectItem>
            <SelectItem value="onTrack">Dentro do prazo</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="ghost" size="icon" onClick={clearFilters} aria-label="Limpar filtros"><FilterX className="size-4" /></Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card/75 shadow-panel">
        {isError || collaboratorsError ? (
          <div className="p-5">
            <EmptyState
              icon={AlertTriangle}
              title="Não foi possível carregar os veículos"
              description={error?.message || "A consulta de responsáveis falhou. Verifique a conexão e tente novamente."}
              action={<Button variant="outline" onClick={() => void refetch()}>Tentar novamente</Button>}
            />
          </div>
        ) : isLoading ? (
          <div className="grid gap-3 p-5">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-16 animate-pulse rounded-xl bg-muted/60" />)}</div>
        ) : vehicles.length ? (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Veículo</TableHead><TableHead>Cliente</TableHead><TableHead>Status / etapa</TableHead><TableHead>Responsável</TableHead><TableHead>Prazo</TableHead><TableHead className="w-16" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map(vehicle => (
                    <TableRow key={vehicle.id}>
                      <TableCell><div className="font-mono text-sm font-semibold tracking-wider">{formatPlate(vehicle.plate)}</div><div className="mt-1 text-xs text-muted-foreground">{vehicle.make ? `${vehicle.make} ` : ""}{vehicle.model} · {vehicle.year}</div><div className="mt-1 font-mono text-[0.65rem] text-muted-foreground">{formatMileage(vehicle.mileage)}</div></TableCell>
                      <TableCell><div className="text-sm font-medium">{vehicle.customerName}</div><Badge variant="outline" className="mt-1 text-[0.6rem] uppercase tracking-wider">{PRIORITY_LABELS[vehicle.priority]}</Badge></TableCell>
                      <TableCell><Badge variant="outline" className={vehicle.status === "active" ? "border-primary/20 bg-primary/5 text-primary" : vehicle.status === "delivered" ? "border-emerald-500/25 bg-emerald-500/5 text-emerald-400" : "text-muted-foreground"}>{vehicle.status === "active" ? PATIO_STAGE_META[vehicle.currentStage].label : vehicle.status === "delivered" ? "Entregue" : "Cancelado"}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{vehicle.collaboratorName || "A definir"}</TableCell>
                      <TableCell>{vehicle.status === "active" ? <DeadlineBadge estimatedDeliveryAt={vehicle.estimatedDeliveryAt} /> : <span className="text-xs text-muted-foreground">Passagem encerrada</span>}</TableCell>
                      <TableCell><Button variant="ghost" size="icon" onClick={() => setSelectedVehicleId(vehicle.id)} aria-label={`Ver detalhes de ${vehicle.plate}`}><Eye className="size-4" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="grid gap-3 p-3 lg:hidden">
              {vehicles.map(vehicle => (
                <button key={vehicle.id} type="button" onClick={() => setSelectedVehicleId(vehicle.id)} className="rounded-xl border border-border bg-background/40 p-4 text-left">
                  <div className="flex items-start justify-between gap-3"><div><p className="font-mono text-sm font-semibold tracking-wider">{formatPlate(vehicle.plate)}</p><p className="mt-1 text-xs text-muted-foreground">{vehicle.model} · {vehicle.customerName}</p></div><Badge variant="outline" className="border-primary/20 text-primary">{PATIO_STAGE_META[vehicle.currentStage].label}</Badge></div>
                  {vehicle.status === "active" ? <div className="mt-3"><DeadlineBadge estimatedDeliveryAt={vehicle.estimatedDeliveryAt} /></div> : null}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="p-5"><EmptyState icon={CarFront} title="Nenhum veículo encontrado" description="Ajuste os filtros ou registre uma nova entrada no pátio." action={status === "active" ? <Button onClick={openCreate}><Plus className="size-4" /> Nova entrada</Button> : undefined} /></div>
        )}
      </div>

      <VehicleFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <VehicleDetailSheet vehicle={selectedVehicle} open={Boolean(selectedVehicleId)} onOpenChange={open => { if (!open) setSelectedVehicleId(null); }} />
    </div>
  );
}
