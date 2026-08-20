import { EmptyState } from "@/components/EmptyState";
import { KanbanColumn } from "@/components/KanbanColumn";
import { OccurrenceFormDialog } from "@/components/OccurrenceFormDialog";
import { PageHeader } from "@/components/PageHeader";
import { VehicleCard } from "@/components/VehicleCard";
import { VehicleDetailSheet } from "@/components/VehicleDetailSheet";
import { VehicleFormDialog } from "@/components/VehicleFormDialog";
import { YardVehicleList } from "@/components/YardVehicleList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { YardVehicleItem } from "@/lib/routerTypes";
import { getDeadlineState } from "@/lib/patio";
import { trpc } from "@/lib/trpc";
import { canTransitionStage, PATIO_STAGES, PATIO_STAGE_META } from "@shared/patio";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  AlertTriangle,
  Columns3,
  FilterX,
  List,
  Plus,
  RadioTower,
  RefreshCw,
  Search,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { createPortal } from "react-dom";
import { toast } from "sonner";

type DeadlineFilter = "all" | "overdue" | "dueSoon" | "onTrack";
type YardView = "kanban" | "list";

const YARD_VIEW_STORAGE_KEY = "dap-patio-yard-view";

function readStoredView(): YardView {
  if (typeof window === "undefined") return "kanban";
  const stored = window.localStorage.getItem(YARD_VIEW_STORAGE_KEY);
  return stored === "list" ? "list" : "kanban";
}

export default function YardPage() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [collaboratorId, setCollaboratorId] = useState("all");
  const [deadline, setDeadline] = useState<DeadlineFilter>("all");
  const [view, setView] = useState<YardView>("kanban");
  const [newVehicleOpen, setNewVehicleOpen] = useState(false);
  const [newOccurrenceOpen, setNewOccurrenceOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [activeVehicleId, setActiveVehicleId] = useState<number | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 7 } }));
  const utils = trpc.useUtils();

  useEffect(() => {
    setView(readStoredView());
  }, []);

  function changeView(next: YardView) {
    setView(next);
    window.localStorage.setItem(YARD_VIEW_STORAGE_KEY, next);
  }

  const queryInput = useMemo(
    () => ({
      search: search || undefined,
      status: "active" as const,
      collaboratorId: collaboratorId === "all" ? undefined : Number(collaboratorId),
      deadline: deadline === "all" ? undefined : deadline,
    }),
    [collaboratorId, deadline, search],
  );
  const { data: vehicles = [], isLoading, isError, error, refetch, dataUpdatedAt } = trpc.patio.list.useQuery(queryInput, {
    refetchInterval: 5_000,
    refetchIntervalInBackground: true,
  });
  const monthRange = useMemo(() => {
    const now = new Date();
    return {
      from: new Date(now.getFullYear(), now.getMonth(), 1).getTime(),
      // Fim do mês civil: evita filtro “congelado” em Date.now() do mount.
      to: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).getTime(),
    };
  }, []);
  const { data: deliveredMonth = [] } = trpc.patio.list.useQuery(
    { status: "delivered", deliveredFrom: monthRange.from, deliveredTo: monthRange.to },
    { refetchInterval: 15_000 },
  );
  const { data: cancelledMonth = [] } = trpc.patio.list.useQuery(
    { status: "cancelled", cancelledFrom: monthRange.from, cancelledTo: monthRange.to },
    { refetchInterval: 15_000 },
  );
  const { data: collaborators = [] } = trpc.collaborators.list.useQuery({ includeInactive: false });
  const { data: occurrenceSummary } = trpc.occurrences.summary.useQuery(undefined, { refetchInterval: 8_000, refetchIntervalInBackground: true });
  const selectedVehicle =
    vehicles.find(vehicle => vehicle.id === selectedVehicleId) ??
    deliveredMonth.find(vehicle => vehicle.id === selectedVehicleId) ??
    cancelledMonth.find(vehicle => vehicle.id === selectedVehicleId) ??
    null;
  const activeVehicle = vehicles.find(vehicle => vehicle.id === activeVehicleId) ?? null;
  const missingOsCount = vehicles.filter(vehicle => vehicle.missingOpenOs).length;

  const moveMutation = trpc.patio.move.useMutation({
    onMutate: async variables => {
      await utils.patio.list.cancel(queryInput);
      const previous = utils.patio.list.getData(queryInput);
      utils.patio.list.setData(queryInput, (current: YardVehicleItem[] | undefined) =>
        current?.map((vehicle: YardVehicleItem) =>
          vehicle.id === variables.id
            ? { ...vehicle, currentStage: variables.toStage, stageEnteredAt: Date.now(), version: (vehicle.version ?? 1) + 1 }
            : vehicle,
        ),
      );
      return { previous };
    },
    onError: (mutationError, _variables, context) => {
      if (context?.previous) utils.patio.list.setData(queryInput, context.previous);
      toast.error(mutationError.message || "Não foi possível mover o veículo");
    },
    onSuccess: (_data, variables) => {
      toast.success(`Movido para ${PATIO_STAGE_META[variables.toStage].label}`);
    },
    onSettled: async () => {
      await Promise.all([utils.patio.list.invalidate(), utils.dashboard.overview.invalidate()]);
    },
  });

  function handleDragStart(event: DragStartEvent) {
    const vehicleId = event.active.data.current?.vehicleId;
    setActiveVehicleId(typeof vehicleId === "number" ? vehicleId : null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveVehicleId(null);
    const vehicleId = event.active.data.current?.vehicleId;
    const targetStage = event.over?.data.current?.stage;
    if (typeof vehicleId !== "number" || !PATIO_STAGES.includes(targetStage)) return;
    const vehicle = vehicles.find(item => item.id === vehicleId);
    if (!vehicle || vehicle.currentStage === targetStage) return;
    if (!canTransitionStage(vehicle.currentStage, targetStage)) {
      toast.error("Só é permitido mover o veículo para a etapa adjacente");
      return;
    }
    moveMutation.mutate({ id: vehicle.id, toStage: targetStage, expectedVersion: vehicle.version });
  }

  const overdue = vehicles.filter(vehicle => getDeadlineState(vehicle.estimatedDeliveryAt) === "overdue").length;
  const dueSoon = vehicles.filter(vehicle => getDeadlineState(vehicle.estimatedDeliveryAt) === "dueSoon").length;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Operação ao vivo"
        title="Pipeline Pátio"
        description="Acompanhe cada veículo do diagnóstico à entrega. Use o Kanban ou a lista; arraste cards ou avance etapas com ações rápidas."
        actions={
          <>
            <div className="hidden items-center gap-2 rounded-xl border border-border bg-card/65 px-3 py-2 text-[0.68rem] text-muted-foreground xl:flex">
              <span className="size-1.5 rounded-full bg-emerald-400" /> Atualizado{" "}
              {dataUpdatedAt
                ? new Date(dataUpdatedAt).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })
                : "agora"}
            </div>
            <ToggleGroup
              type="single"
              value={view}
              onValueChange={value => {
                if (value === "kanban" || value === "list") changeView(value);
              }}
              className="rounded-xl border border-border bg-card/65 p-1"
            >
              <ToggleGroupItem value="kanban" aria-label="Visão Kanban" className="gap-1.5 px-3">
                <Columns3 className="size-4" /> Kanban
              </ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="Visão Lista" className="gap-1.5 px-3">
                <List className="size-4" /> Lista
              </ToggleGroupItem>
            </ToggleGroup>
            <Button variant="outline" onClick={() => setNewOccurrenceOpen(true)}>
              <RadioTower className="size-4" /> Avisar BO
            </Button>
            <Button onClick={() => setLocation("/ordens-servico/nova")}>
              <Plus className="size-4" /> Nova passagem
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:max-w-4xl sm:grid-cols-5">
        <MiniMetric label="No pátio" value={vehicles.length} />
        <MiniMetric label="Atrasados" value={overdue} critical={overdue > 0} />
        <MiniMetric label="Vencem em 24h" value={dueSoon} warning={dueSoon > 0} />
        <MiniMetric label="Sem OS" value={missingOsCount} warning={missingOsCount > 0} />
        <MiniMetric
          label="Avisos"
          value={occurrenceSummary?.active ?? 0}
          critical={Boolean(occurrenceSummary?.critical)}
          warning={Boolean(occurrenceSummary?.active && !occurrenceSummary.critical)}
        />
      </div>

      <div className="grid gap-3 rounded-2xl border border-border bg-card/70 p-3 shadow-panel md:grid-cols-[minmax(260px,1.5fr)_1fr_1fr_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Buscar placa, cliente ou modelo"
          />
        </div>
        <Select value={collaboratorId} onValueChange={setCollaboratorId}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os responsáveis</SelectItem>
            {collaborators.map(item => (
              <SelectItem key={item.id} value={String(item.id)}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={deadline} onValueChange={value => setDeadline(value as DeadlineFilter)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os prazos</SelectItem>
            <SelectItem value="overdue">Atrasados</SelectItem>
            <SelectItem value="dueSoon">Vencem em 24h</SelectItem>
            <SelectItem value="onTrack">Dentro do prazo</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setSearch("");
            setCollaboratorId("all");
            setDeadline("all");
          }}
          aria-label="Limpar filtros"
        >
          <FilterX className="size-4" />
        </Button>
      </div>

      {isError ? (
        <EmptyState
          icon={AlertTriangle}
          title="Falha ao carregar o pátio"
          description={error.message}
          action={
            <Button variant="outline" onClick={() => void refetch()}>
              <RefreshCw className="size-4" /> Tentar novamente
            </Button>
          }
        />
      ) : isLoading ? (
        view === "list" ? (
          <div className="h-64 animate-pulse rounded-2xl bg-card" />
        ) : (
          <div className="flex gap-4 overflow-hidden">
            {PATIO_STAGES.slice(0, 4).map(stage => (
              <div key={stage} className="h-[520px] w-72 shrink-0 animate-pulse rounded-2xl bg-card" />
            ))}
          </div>
        )
      ) : view === "list" ? (
        <YardVehicleList
          vehicles={vehicles}
          collaborators={collaborators}
          onOpenVehicle={setSelectedVehicleId}
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveVehicleId(null)}
        >
          <div className="scrollbar-thin overflow-x-auto pb-3">
            <div className="flex w-max gap-4">
              {PATIO_STAGES.map(stage => (
                <KanbanColumn
                  key={stage}
                  stage={stage}
                  vehicles={vehicles.filter(vehicle => vehicle.currentStage === stage)}
                  onOpenVehicle={setSelectedVehicleId}
                />
              ))}
              <StatusKanbanColumn
                title="Entregue"
                subtitle="Mês vigente"
                orderLabel="08"
                vehicles={deliveredMonth}
                onOpenVehicle={setSelectedVehicleId}
              />
              <StatusKanbanColumn
                title="Cancelado"
                subtitle="Mês vigente"
                orderLabel="09"
                vehicles={cancelledMonth}
                onOpenVehicle={setSelectedVehicleId}
              />
            </div>
          </div>
          {createPortal(
            <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.23, 1, 0.32, 1)" }}>
              {activeVehicle ? <VehicleCard vehicle={activeVehicle} overlay /> : null}
            </DragOverlay>,
            document.body,
          )}
        </DndContext>
      )}

      <VehicleFormDialog open={newVehicleOpen} onOpenChange={setNewVehicleOpen} />
      <OccurrenceFormDialog open={newOccurrenceOpen} onOpenChange={setNewOccurrenceOpen} />
      <VehicleDetailSheet
        vehicle={selectedVehicle}
        open={Boolean(selectedVehicleId)}
        onOpenChange={open => {
          if (!open) setSelectedVehicleId(null);
        }}
      />
    </div>
  );
}

function MiniMetric({
  label,
  value,
  critical,
  warning,
}: {
  label: string;
  value: number;
  critical?: boolean;
  warning?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-3 py-2.5 ${
        critical
          ? "border-primary/45 bg-primary/8"
          : warning
            ? "border-amber-500/25 bg-amber-500/[0.04]"
            : "border-border bg-card/70"
      }`}
    >
      <p className="text-[0.58rem] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-1 font-display text-2xl font-bold tabular-nums ${
          critical ? "text-primary" : warning ? "text-amber-300" : "text-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function StatusKanbanColumn({
  title,
  subtitle,
  orderLabel,
  vehicles,
  onOpenVehicle,
}: {
  title: string;
  subtitle: string;
  orderLabel: string;
  vehicles: YardVehicleItem[];
  onOpenVehicle: (id: number) => void;
}) {
  return (
    <section className="command-panel telemetry-rule flex h-[calc(100vh-20.5rem)] min-h-[480px] w-[288px] shrink-0 flex-col overflow-hidden rounded-2xl border border-border/80">
      <header className="relative flex items-center justify-between border-b border-border/70 px-4 py-3.5 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-primary/45 after:via-white/8 after:to-transparent">
        <div className="flex items-center gap-3">
          <span className="grid size-7 place-items-center rounded-lg border border-primary/20 bg-primary/8 font-mono text-[0.65rem] font-semibold text-primary">
            {orderLabel}
          </span>
          <div>
            <h2 className="font-display text-sm font-bold uppercase tracking-[0.08em] text-foreground">
              {title}
            </h2>
            <p className="mt-0.5 text-[0.62rem] text-muted-foreground">
              {subtitle} · {vehicles.length}{" "}
              {vehicles.length === 1 ? "veículo" : "veículos"}
            </p>
          </div>
        </div>
      </header>
      <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto p-3">
        {vehicles.map(vehicle => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            onOpen={() => onOpenVehicle(vehicle.id)}
          />
        ))}
        {!vehicles.length ? (
          <div className="grid min-h-32 place-items-center rounded-xl border border-dashed border-border px-5 text-center text-xs leading-5 text-muted-foreground/65">
            Nenhum no mês vigente
          </div>
        ) : null}
      </div>
    </section>
  );
}
