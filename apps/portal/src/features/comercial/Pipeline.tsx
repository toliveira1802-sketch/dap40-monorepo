import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Kanban, Plus, RefreshCw, SearchX } from "lucide-react";

/** Inline substitute for @dnd-kit/utilities CSS.Translate (avoid extra dep). */
function translateToString(
  transform: { x: number; y: number } | null | undefined
) {
  if (!transform) return undefined;
  return `translate3d(${transform.x}px, ${transform.y}px, 0)`;
}
import { useEffect, useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { CreateOpportunityDialog } from "./CreateOpportunityDialog";
import { FilterBar } from "./FilterBar";
import { KanbanSkeleton, QueryState } from "./QueryState";

function formatMoney(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

type PipelineOpportunity = {
  id: string;
  title: string;
  contactName: string;
  estimatedValueCents: number;
  pipelineStageId: string;
};

type PipelineStage = {
  id: string;
  name: string;
  isLost?: boolean;
};

type CloseMode = "won" | "lost";

function CloseOpportunityDialog({
  opportunity,
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: {
  opportunity: PipelineOpportunity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  isPending: boolean;
}) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) setReason("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-popover sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Marcar oportunidade como perdida</DialogTitle>
          <DialogDescription>
            Registre o motivo para preservar o histórico comercial de{" "}
            {opportunity?.title ?? ""}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="lost-reason">Motivo da perda</Label>
          <Textarea
            id="lost-reason"
            value={reason}
            onChange={event => setReason(event.target.value)}
            placeholder="Ex.: cliente adiou o serviço ou fechou com outra oficina"
            maxLength={500}
            autoFocus
          />
          <p className="text-right text-xs text-muted-foreground">
            {reason.length}/500
          </p>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => onConfirm(reason.trim())}
            disabled={reason.trim().length < 3 || isPending}
          >
            Confirmar perda
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PipelineCard({
  card,
  overlay = false,
  canWriteCrm = false,
  stages = [],
  onMove,
  onClose,
}: {
  card: PipelineOpportunity;
  overlay?: boolean;
  canWriteCrm?: boolean;
  stages?: readonly PipelineStage[];
  onMove?: (toStageId: string) => void;
  onClose?: (mode: CloseMode) => void;
}) {
  const draggable = useDraggable({
    id: `crm-opportunity-${card.id}`,
    data: { opportunityId: card.id, card },
    disabled: overlay || !canWriteCrm,
  });
  const style = overlay
    ? undefined
    : {
        transform: translateToString(draggable.transform),
        opacity: draggable.isDragging ? 0.35 : 1,
      };

  return (
    <article
      ref={overlay ? undefined : draggable.setNodeRef}
      style={style}
      className={`rounded-lg border border-border/50 bg-background/50 p-3 transition-[border-color,opacity,transform] hover:border-primary/40 ${overlay ? "w-72 rotate-1 border-primary/50 shadow-2xl" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold leading-snug">{card.title}</h4>
        {!overlay ? (
          <button
            type="button"
            {...draggable.attributes}
            {...draggable.listeners}
            className="-mr-1 -mt-1 cursor-grab rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing"
            aria-label={`Arrastar ${card.title}`}
          >
            ⋮⋮
          </button>
        ) : null}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{card.contactName}</p>
      <p className="mt-2 text-sm font-medium tabular-nums">
        {formatMoney(card.estimatedValueCents)}
      </p>
      {canWriteCrm && !overlay ? (
        <div className="mt-3">
          <Select value={card.pipelineStageId} onValueChange={onMove}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Mover" />
            </SelectTrigger>
            <SelectContent>
              {stages
                .filter(stage => !stage.isLost)
                .map(stage => (
                  <SelectItem key={stage.id} value={stage.id}>
                    {stage.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}
      {canWriteCrm && !overlay ? (
        <div className="mt-3 flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 flex-1 text-xs"
            onClick={() => onClose?.("won")}
          >
            Marcar ganha
          </Button>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            className="h-8 flex-1 text-xs"
            onClick={() => onClose?.("lost")}
          >
            Marcar perdida
          </Button>
        </div>
      ) : null}
    </article>
  );
}

function PipelineColumn({
  stage,
  cards,
  canWriteCrm,
  stages,
  onMove,
  onClose,
}: {
  stage: PipelineStage;
  cards: PipelineOpportunity[];
  canWriteCrm: boolean;
  stages: readonly PipelineStage[];
  onMove: (opportunityId: string, toStageId: string) => void;
  onClose: (card: PipelineOpportunity, mode: CloseMode) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `crm-stage-${stage.id}`,
    data: { stageId: stage.id },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex w-72 shrink-0 flex-col rounded-xl border bg-card/30 transition-colors ${isOver ? "border-primary/60 bg-primary/[0.06]" : "border-border/70"}`}
    >
      <div className="flex items-center justify-between border-b border-border/50 px-3 py-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {stage.name}
        </h3>
        <Badge variant="secondary">{cards.length}</Badge>
      </div>
      <div className="flex max-h-[60vh] min-h-24 flex-col gap-2 overflow-y-auto p-2">
        {cards.map(card => (
          <PipelineCard
            key={card.id}
            card={card}
            canWriteCrm={canWriteCrm}
            stages={stages}
            onMove={toStageId => onMove(card.id, toStageId)}
            onClose={mode => onClose(card, mode)}
          />
        ))}
        {!cards.length ? (
          <div className="grid min-h-20 place-items-center rounded-lg border border-dashed border-border px-3 text-center text-xs text-muted-foreground">
            {isOver ? `Solte em ${stage.name}` : "Nenhuma oportunidade"}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function ComercialPipelinePage() {
  const utils = trpc.useUtils();
  const { data: capabilities } = trpc.access.capabilities.useQuery();
  const canWriteCrm = capabilities?.canWriteCrm ?? false;
  const { data: config } = trpc.crm.pipeline.config.useQuery();
  const {
    data: opportunities,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = trpc.crm.pipeline.list.useQuery(undefined, { refetchInterval: 12_000 });

  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [activeCard, setActiveCard] = useState<PipelineOpportunity | null>(
    null
  );
  const [lossTarget, setLossTarget] = useState<PipelineOpportunity | null>(
    null
  );
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const moveStage = trpc.crm.pipeline.moveStage.useMutation({
    onMutate: async ({ opportunityId, toStageId }) => {
      await utils.crm.pipeline.list.cancel();
      const previous = utils.crm.pipeline.list.getData();
      utils.crm.pipeline.list.setData(undefined, current =>
        current?.map(opportunity =>
          opportunity.id === opportunityId
            ? { ...opportunity, pipelineStageId: toStageId }
            : opportunity
        )
      );
      return { previous };
    },
    onSuccess: async () => {
      await utils.crm.pipeline.list.invalidate();
      await utils.crm.dashboard.overview.invalidate();
      toast.success("Estágio atualizado");
    },
    onError: (error, _variables, context) => {
      if (context?.previous)
        utils.crm.pipeline.list.setData(undefined, context.previous);
      toast.error(error.message);
    },
  });

  const stages = config?.stages ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return opportunities ?? [];
    return (opportunities ?? []).filter(
      opp =>
        opp.title.toLowerCase().includes(q) ||
        opp.contactName.toLowerCase().includes(q)
    );
  }, [opportunities, search]);

  const hasData = (opportunities?.length ?? 0) > 0;
  const filterEmpty = hasData && filtered.length === 0;

  function handleClose(
    card: PipelineOpportunity,
    mode: CloseMode,
    lostReason?: string
  ) {
    moveStage.mutate({
      opportunityId: card.id,
      toStageId: (mode === "won"
        ? "stage_entregue"
        : "stage_perdido") as (typeof stages)[number]["id"],
      lostReason,
    });
    if (mode === "lost") setLossTarget(null);
  }

  function handleDragStart(event: DragStartEvent) {
    const card = event.active.data.current?.card as
      | PipelineOpportunity
      | undefined;
    setActiveCard(card ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveCard(null);
    const opportunityId = event.active.data.current?.opportunityId;
    const toStageId = event.over?.data.current?.stageId;
    if (typeof opportunityId !== "string" || typeof toStageId !== "string")
      return;

    const card = (opportunities ?? []).find(item => item.id === opportunityId);
    if (!card || card.pipelineStageId === toStageId) return;
    if (!stages.some(stage => stage.id === toStageId && !stage.isLost)) return;

    moveStage.mutate({
      opportunityId,
      toStageId: toStageId as (typeof stages)[number]["id"],
    });
  }

  return (
    <div className="comercial-surface flex flex-col gap-6 p-4 md:p-6">
      <PageHeader
        eyebrow="Comercial"
        title="Pipeline"
        description="Oportunidades comerciais por estágio — handoff ao ERP via conversion intent quando ganhar."
        actions={
          <div className="flex flex-wrap gap-2">
            {canWriteCrm ? (
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <Plus className="mr-2 size-4" />
                Nova oportunidade
              </Button>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw
                className={`mr-2 size-4 ${isFetching ? "animate-spin" : ""}`}
              />
              Atualizar
            </Button>
          </div>
        }
      />

      {!isLoading && !isError && hasData ? (
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Buscar por título ou contato…"
        />
      ) : null}

      <QueryState
        isLoading={isLoading}
        isError={isError}
        isEmpty={!hasData}
        onRetry={() => refetch()}
        errorIcon={Kanban}
        errorTitle="Não foi possível carregar o pipeline"
        emptyIcon={Kanban}
        emptyTitle="Sem oportunidades"
        emptyDescription="Crie a primeira oportunidade ou aguarde leads/conversas gerarem cards."
        loadingFallback={<KanbanSkeleton />}
      >
        {filterEmpty ? (
          <EmptyState
            icon={SearchX}
            title="Nenhum resultado"
            description="Nenhuma oportunidade corresponde à busca."
            action={
              <Button variant="outline" size="sm" onClick={() => setSearch("")}>
                Limpar busca
              </Button>
            }
          />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActiveCard(null)}
          >
            <div className="flex gap-3 overflow-x-auto pb-2">
              {stages
                .filter(stage => !stage.isLost)
                .map(stage => (
                  <PipelineColumn
                    key={stage.id}
                    stage={stage}
                    cards={filtered.filter(
                      opp => opp.pipelineStageId === stage.id
                    )}
                    canWriteCrm={canWriteCrm}
                    stages={stages}
                    onMove={(opportunityId, toStageId) =>
                      moveStage.mutate({
                        opportunityId,
                        toStageId: toStageId as (typeof stages)[number]["id"],
                      })
                    }
                    onClose={(card, mode) =>
                      mode === "lost"
                        ? setLossTarget(card)
                        : handleClose(card, mode)
                    }
                  />
                ))}
            </div>
            {typeof document !== "undefined"
              ? createPortal(
                  <DragOverlay>
                    {activeCard ? (
                      <PipelineCard card={activeCard} overlay />
                    ) : null}
                  </DragOverlay>,
                  document.body
                )
              : null}
          </DndContext>
        )}
      </QueryState>

      <CloseOpportunityDialog
        opportunity={lossTarget}
        open={Boolean(lossTarget)}
        onOpenChange={open => {
          if (!open) setLossTarget(null);
        }}
        onConfirm={reason => {
          if (lossTarget) handleClose(lossTarget, "lost", reason);
        }}
        isPending={moveStage.isPending}
      />

      {canWriteCrm ? (
        <CreateOpportunityDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          stages={stages}
          defaultStageId="stage_novo_lead"
        />
      ) : null}
    </div>
  );
}
