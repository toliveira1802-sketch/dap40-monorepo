import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { PatioMapSectionNav } from "@/components/PatioMapSectionNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPlate } from "@/lib/patio";
import type { YardVehicleItem } from "@/lib/routerTypes";
import { trpc } from "@/lib/trpc";
import { PATIO_STAGE_META } from "@shared/patio";
import type { WorkshopMapColumn } from "@shared/workshop";
import {
  compareQueueUrgency,
  getQueueUrgency,
  type QueueUrgencyTone,
} from "@shared/workshopSla";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  AlertTriangle,
  CarFront,
  Check,
  Clock3,
  MapPinned,
  RefreshCw,
  Wrench,
} from "lucide-react";
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

type WorkshopResourceRow = {
  id: number;
  name: string;
  type: string;
  isServicePost: boolean;
  mapColumn: WorkshopMapColumn;
  mapOrder: number;
  currentYardVehicleId: number | null;
};

function resourceDropId(resourceId: number) {
  return `workshop-resource:${resourceId}`;
}

function queueDragId(vehicleId: number) {
  return `queue-vehicle:${vehicleId}`;
}

const urgencyClass: Record<QueueUrgencyTone, string> = {
  ok: "",
  warning: "border-amber-500/45 bg-amber-500/[0.08]",
  critical: "border-primary/55 bg-primary/[0.1] animate-pulse",
};

const freeStationClass =
  "border-emerald-500/35 bg-emerald-500/[0.08] text-emerald-200";
const occupiedStationClass =
  "border-rose-400/40 bg-rose-500/[0.1] text-foreground";
const scheduledStationClass =
  "border-sky-500/35 bg-sky-500/[0.08] text-sky-100";

export default function PatioMapPage() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const [activeVehicleId, setActiveVehicleId] = useState<number | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const vehiclesQuery = trpc.patio.list.useQuery(
    { status: "active" },
    { refetchInterval: 5_000, refetchIntervalInBackground: true }
  );
  const resourcesQuery = trpc.workshop.resources.list.useQuery(
    { includeInactive: false },
    { refetchInterval: 5_000, refetchIntervalInBackground: true }
  );
  const capacityQuery = trpc.workshop.capacity.summary.useQuery(undefined, {
    refetchInterval: 10_000,
  });

  const vehicles = vehiclesQuery.data ?? [];
  const resources = (resourcesQuery.data ?? []) as WorkshopResourceRow[];
  const vehicleById = useMemo(() => {
    const map = new Map<number, YardVehicleItem>();
    for (const vehicle of vehicles) map.set(vehicle.id, vehicle);
    return map;
  }, [vehicles]);

  const occupiedVehicleIds = useMemo(() => {
    const ids = new Set<number>();
    for (const resource of resources) {
      if (resource.currentYardVehicleId) ids.add(resource.currentYardVehicleId);
    }
    return ids;
  }, [resources]);

  const queue = useMemo(() => {
    return vehicles
      .filter(vehicle => !occupiedVehicleIds.has(vehicle.id))
      .slice()
      .sort((a, b) =>
        compareQueueUrgency(
          {
            currentStage: a.currentStage,
            stageEnteredAt: a.stageEnteredAt,
            estimatedDeliveryAt: a.estimatedDeliveryAt,
          },
          {
            currentStage: b.currentStage,
            stageEnteredAt: b.stageEnteredAt,
            estimatedDeliveryAt: b.estimatedDeliveryAt,
          }
        )
      );
  }, [vehicles, occupiedVehicleIds]);

  const byColumn = useMemo(() => {
    const groups: Record<WorkshopMapColumn, WorkshopResourceRow[]> = {
      left: [],
      top: [],
      center: [],
      right: [],
      "bottom-left": [],
    };
    for (const resource of resources) {
      groups[resource.mapColumn]?.push(resource);
    }
    for (const key of Object.keys(groups) as WorkshopMapColumn[]) {
      groups[key].sort((a, b) => a.mapOrder - b.mapOrder);
    }
    return groups;
  }, [resources]);

  const allocateMutation = trpc.workshop.resources.allocate.useMutation({
    onSuccess: async () => {
      toast.success("Veículo alocado no posto");
      await Promise.all([
        utils.workshop.resources.list.invalidate(),
        utils.workshop.capacity.summary.invalidate(),
        utils.patio.list.invalidate(),
      ]);
    },
    onError: error => toast.error(error.message),
  });

  const releaseMutation = trpc.workshop.resources.release.useMutation({
    onSuccess: async () => {
      toast.success("Posto liberado");
      await Promise.all([
        utils.workshop.resources.list.invalidate(),
        utils.workshop.capacity.summary.invalidate(),
        utils.patio.list.invalidate(),
      ]);
    },
    onError: error => toast.error(error.message),
  });

  const activeVehicle =
    activeVehicleId != null ? vehicleById.get(activeVehicleId) ?? null : null;

  const isLoading = vehiclesQuery.isLoading || resourcesQuery.isLoading;
  const isError = vehiclesQuery.isError || resourcesQuery.isError;
  const errorMessage =
    vehiclesQuery.error?.message ?? resourcesQuery.error?.message ?? "Erro";

  function handleDragStart(event: DragStartEvent) {
    const vehicleId = event.active.data.current?.yardVehicleId;
    setActiveVehicleId(typeof vehicleId === "number" ? vehicleId : null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveVehicleId(null);
    const vehicleId = event.active.data.current?.yardVehicleId;
    const resourceId = event.over?.data.current?.resourceId;
    if (typeof vehicleId !== "number" || typeof resourceId !== "number") return;
    const resource = resources.find(item => item.id === resourceId);
    if (!resource) return;
    if (!resource.isServicePost) {
      toast.error("Recepção não recebe alocação de serviço");
      return;
    }
    if (resource.currentYardVehicleId) {
      toast.error("Posto já está ocupado");
      return;
    }
    const vehicle = vehicleById.get(vehicleId);
    allocateMutation.mutate({
      resourceId,
      yardVehicleId: vehicleId,
      collaboratorId: vehicle?.currentCollaboratorId ?? null,
    });
  }

  function refreshAll() {
    void Promise.all([
      vehiclesQuery.refetch(),
      resourcesQuery.refetch(),
      capacityQuery.refetch(),
    ]);
  }

  const occupiedPosts =
    capacityQuery.data?.servicePosts.occupied ??
    resources.filter(r => r.isServicePost && r.currentYardVehicleId).length;
  const totalPosts =
    capacityQuery.data?.servicePosts.total ??
    resources.filter(r => r.isServicePost).length;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Mapa do pátio"
        title="Planta da oficina"
        description="Aloque carros da fila nos elevadores e boxes. Urgência visual pelo SLA da etapa e prazo prometido."
        actions={
          <Button variant="outline" onClick={refreshAll}>
            <RefreshCw className="size-4" /> Atualizar mapa
          </Button>
        }
      />

      <PatioMapSectionNav />

      <div className="grid gap-3 sm:grid-cols-3">
        <MapMetric label="Veículos no pátio" value={vehicles.length} />
        <MapMetric label="Postos ocupados" value={`${occupiedPosts}/${totalPosts}`} />
        <MapMetric
          label="Vagas (capacidade)"
          value={`${capacityQuery.data?.slots.occupied ?? "—"}/${capacityQuery.data?.slots.capacity ?? 20}`}
        />
      </div>

      {isError ? (
        <EmptyState
          icon={AlertTriangle}
          title="Não foi possível carregar o mapa"
          description={errorMessage}
          action={
            <Button variant="outline" onClick={refreshAll}>
              Tentar novamente
            </Button>
          }
        />
      ) : isLoading ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <div className="h-[560px] animate-pulse rounded-3xl bg-card" />
          <div className="h-[560px] animate-pulse rounded-3xl bg-card" />
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveVehicleId(null)}
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
            <section className="relative overflow-hidden rounded-3xl border border-border bg-[radial-gradient(circle_at_50%_0%,rgba(209,10,17,0.05),transparent_32%),linear-gradient(180deg,rgba(248,248,248,0.96),rgba(236,236,236,0.98))] p-4 shadow-panel dark:bg-[linear-gradient(180deg,rgba(20,20,20,0.92),rgba(10,10,10,0.96))] sm:p-5">
              <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(0,0,0,.18)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,.18)_1px,transparent_1px)] [background-size:28px_28px] dark:opacity-[0.06] dark:[background-image:linear-gradient(rgba(255,255,255,.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.35)_1px,transparent_1px)]" />
              <div className="relative mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <MapPinned className="size-5 text-primary" />
                  <h2 className="font-semibold text-foreground">Layout físico</h2>
                </div>
                <p className="text-xs text-muted-foreground">
                  Arraste da fila → solte no posto livre
                </p>
              </div>

              <div className="relative grid gap-3 lg:grid-cols-[160px_minmax(0,1fr)_150px]">
                <div className="flex flex-col gap-2">
                  {byColumn.left.map(resource => (
                    <StationCard
                      key={resource.id}
                      resource={resource}
                      vehicle={
                        resource.currentYardVehicleId
                          ? vehicleById.get(resource.currentYardVehicleId) ?? null
                          : null
                      }
                      onOpenVehicle={id => setLocation(`/veiculos?vehicle=${id}`)}
                      onRelease={() =>
                        releaseMutation.mutate({ resourceId: resource.id })
                      }
                      releasing={releaseMutation.isPending}
                    />
                  ))}
                  {byColumn["bottom-left"].map(resource => (
                    <StationCard
                      key={resource.id}
                      resource={resource}
                      vehicle={null}
                      onOpenVehicle={id => setLocation(`/veiculos?vehicle=${id}`)}
                      onRelease={() =>
                        releaseMutation.mutate({ resourceId: resource.id })
                      }
                      releasing={releaseMutation.isPending}
                    />
                  ))}
                </div>

                <div className="flex flex-col gap-3">
                  <div className="grid gap-2 sm:grid-cols-3">
                    {byColumn.top.map(resource => (
                      <StationCard
                        key={resource.id}
                        resource={resource}
                        vehicle={
                          resource.currentYardVehicleId
                            ? vehicleById.get(resource.currentYardVehicleId) ??
                              null
                            : null
                        }
                        onOpenVehicle={id => setLocation(`/veiculos?vehicle=${id}`)}
                        onRelease={() =>
                          releaseMutation.mutate({ resourceId: resource.id })
                        }
                        releasing={releaseMutation.isPending}
                      />
                    ))}
                  </div>
                  <div className="grid flex-1 place-items-center">
                    {byColumn.center.map(resource => (
                      <StationCard
                        key={resource.id}
                        resource={resource}
                        className="min-h-28 w-full max-w-xs"
                        vehicle={
                          resource.currentYardVehicleId
                            ? vehicleById.get(resource.currentYardVehicleId) ??
                              null
                            : null
                        }
                        onOpenVehicle={id => setLocation(`/veiculos?vehicle=${id}`)}
                        onRelease={() =>
                          releaseMutation.mutate({ resourceId: resource.id })
                        }
                        releasing={releaseMutation.isPending}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {byColumn.right.map(resource => (
                    <StationCard
                      key={resource.id}
                      resource={resource}
                      className="min-h-[7.5rem] flex-1"
                      vehicle={
                        resource.currentYardVehicleId
                          ? vehicleById.get(resource.currentYardVehicleId) ?? null
                          : null
                      }
                      onOpenVehicle={id => setLocation(`/veiculos?vehicle=${id}`)}
                      onRelease={() =>
                        releaseMutation.mutate({ resourceId: resource.id })
                      }
                      releasing={releaseMutation.isPending}
                    />
                  ))}
                </div>
              </div>
            </section>

            <aside className="rounded-3xl border border-border bg-card/80 p-4 shadow-panel">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold">Próximos</h2>
                <Badge variant="outline">{queue.length}</Badge>
              </div>
              <p className="mb-3 text-[0.68rem] leading-4 text-muted-foreground">
                Ordem por urgência (SLA / prazo). Arraste para o posto.
              </p>
              <div className="scrollbar-thin max-h-[calc(100vh-22rem)] space-y-2 overflow-y-auto pr-1">
                {queue.length ? (
                  queue.map(vehicle => (
                    <QueueVehicleCard key={vehicle.id} vehicle={vehicle} />
                  ))
                ) : (
                  <div className="grid min-h-40 place-items-center rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
                    Todos os carros ativos estão em um posto
                  </div>
                )}
              </div>
            </aside>
          </div>

          {createPortal(
            <DragOverlay>
              {activeVehicle ? (
                <div className="w-64 rounded-xl border border-primary/40 bg-card p-3 shadow-xl">
                  <p className="font-mono text-sm font-semibold">
                    {formatPlate(activeVehicle.plate)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {activeVehicle.model}
                  </p>
                </div>
              ) : null}
            </DragOverlay>,
            document.body
          )}
        </DndContext>
      )}
    </div>
  );
}

function StationCard({
  resource,
  vehicle,
  onOpenVehicle,
  onRelease,
  releasing,
  className,
}: {
  resource: WorkshopResourceRow;
  vehicle: YardVehicleItem | null;
  onOpenVehicle: (id: number) => void;
  onRelease: () => void;
  releasing: boolean;
  className?: string;
}) {
  const droppable = resource.isServicePost && !resource.currentYardVehicleId;
  const { setNodeRef, isOver } = useDroppable({
    id: resourceDropId(resource.id),
    data: { resourceId: resource.id },
    disabled: !droppable,
  });

  const tone = vehicle
    ? getQueueUrgency({
        currentStage: vehicle.currentStage,
        stageEnteredAt: vehicle.stageEnteredAt,
        estimatedDeliveryAt: vehicle.estimatedDeliveryAt,
      })
    : "ok";

  const occupied = Boolean(resource.currentYardVehicleId);
  const baseTone = !resource.isServicePost
    ? freeStationClass
    : occupied
      ? occupiedStationClass
      : resource.type === "equipment"
        ? scheduledStationClass
        : freeStationClass;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative flex min-h-[4.5rem] flex-col justify-between rounded-xl border px-2.5 py-2 transition",
        baseTone,
        occupied && urgencyClass[tone],
        isOver && droppable && "ring-2 ring-primary/50",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[0.72rem] font-semibold leading-tight text-foreground">
          {resource.name}
        </p>
        <StationIcon
          occupied={occupied}
          isServicePost={resource.isServicePost}
          type={resource.type}
        />
      </div>
      {vehicle ? (
        <div className="mt-2 space-y-1.5">
          <button
            type="button"
            className="w-full text-left"
            onClick={() => onOpenVehicle(vehicle.id)}
          >
            <p className="font-mono text-xs font-bold tracking-wide">
              {formatPlate(vehicle.plate)}
            </p>
            <p className="truncate text-[0.62rem] text-muted-foreground">
              {PATIO_STAGE_META[vehicle.currentStage].shortLabel}
            </p>
          </button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 w-full text-[0.65rem]"
            disabled={releasing}
            onClick={onRelease}
          >
            Liberar
          </Button>
        </div>
      ) : (
        <p className="mt-2 text-[0.62rem] text-muted-foreground/80">
          {resource.isServicePost ? "Livre — solte aqui" : "Sem alocação"}
        </p>
      )}
    </div>
  );
}

function StationIcon({
  occupied,
  isServicePost,
  type,
}: {
  occupied: boolean;
  isServicePost: boolean;
  type: string;
}) {
  if (!isServicePost) return <Check className="size-3.5 text-emerald-500" />;
  if (occupied) return <CarFront className="size-3.5 text-rose-400" />;
  if (type === "equipment") return <Clock3 className="size-3.5 text-sky-400" />;
  if (type === "elevator" || type === "box" || type === "ramp") {
    return <Check className="size-3.5 text-emerald-500" />;
  }
  return <Wrench className="size-3.5 text-amber-400" />;
}

function QueueVehicleCard({ vehicle }: { vehicle: YardVehicleItem }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: queueDragId(vehicle.id),
      data: { yardVehicleId: vehicle.id },
    });
  const tone = getQueueUrgency({
    currentStage: vehicle.currentStage,
    stageEnteredAt: vehicle.stageEnteredAt,
    estimatedDeliveryAt: vehicle.estimatedDeliveryAt,
  });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "cursor-grab rounded-xl border border-border bg-background/70 p-3 active:cursor-grabbing",
        urgencyClass[tone],
        isDragging && "opacity-40"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-mono text-sm font-semibold tracking-wide">
            {formatPlate(vehicle.plate)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{vehicle.model}</p>
        </div>
        <Badge
          variant="outline"
          className={
            tone === "critical"
              ? "border-primary/40 text-primary"
              : tone === "warning"
                ? "border-amber-500/40 text-amber-300"
                : undefined
          }
        >
          {PATIO_STAGE_META[vehicle.currentStage].shortLabel}
        </Badge>
      </div>
    </div>
  );
}

function MapMetric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-border bg-card/70 px-4 py-3">
      <p className="text-[0.62rem] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}
