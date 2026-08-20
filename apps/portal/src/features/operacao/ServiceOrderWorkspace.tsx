import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { EmptyState } from "@/components/EmptyState";
import { Spinner } from "@/components/ui/spinner";
import { formatDuration, formatPlate, POSITION_LABELS } from "@/lib/patio";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import type { PatioStage, ServiceOrderStatus } from "@shared/patio";
import { canRejectApprovalFromStage } from "@shared/patio";
import {
  BUDGET_ITEM_KIND_LABELS,
  BUDGET_ITEM_STATUS_LABELS,
  ENTRY_CHECKLIST_ITEMS,
  WORKSPACE_STAGE_ACTIONS,
} from "@shared/serviceOrderBudget";
import {
  ArrowLeft,
  Car,
  Check,
  ChevronDown,
  ClipboardList,
  Clock3,
  ExternalLink,
  Link2,
  MessageCircle,
  Pencil,
  Printer,
  Tag,
  Trash2,
  User,
  Wrench,
  X,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { useLocation, type RouteComponentProps } from "wouter";
import { toast } from "sonner";

function money(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

function marginPercent(amountCents: number, costCents: number) {
  if (costCents <= 0) return null;
  return (((amountCents - costCents) / costCents) * 100).toFixed(2);
}

function getWorkspaceStatusLabel(
  osStatus: ServiceOrderStatus,
  yardStage: PatioStage
) {
  if (osStatus === "waiting_parts") return "Aguardando Peça";
  if (osStatus === "cancelled") return "Cancelada";
  if (osStatus === "completed") return "Concluída";
  if (yardStage === "orcamento" || (yardStage as string) === "aguardando_aprovacao" || yardStage === "aprovacao") {
    return "Aguardando Aprovação";
  }
  if (yardStage === "diagnostico") return "Em Diagnóstico";
  if ((yardStage as string) === "aguardando_pecas" || yardStage === "aguardando_peca") return "Aguardando Peças";
  if (yardStage === "execucao") return "Em Execução";
  if ((yardStage as string) === "em_teste" || yardStage === "qualidade") return "Em Teste / Qualidade";
  if (yardStage === "pronto") return "Pronto";
  return "Aberta";
}

type ServiceOrderWorkspacePageProps = {
  orderId?: number;
  params?: { id?: string };
};

export default function ServiceOrderWorkspacePage(props?: ServiceOrderWorkspacePageProps) {
  const [location, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  const routeMatch = location.match(/\/ordens-servico\/(?:workspace\/)?(\d+)/);
  const orderId = props?.orderId ?? (props?.params?.id ? parseInt(props.params.id, 10) : (routeMatch ? parseInt(routeMatch[1], 10) : 1));

  const query = trpc.serviceOrders.workspace.useQuery(
    { id: orderId },
    { refetchInterval: 10_000 }
  );
  const { data: access } = trpc.access.capabilities.useQuery();

  const moveMutation = trpc.patio.move.useMutation({
    onSuccess: async () => {
      await utils.serviceOrders.workspace.invalidate({ id: orderId });
      toast.success("Etapa do pátio atualizada");
    },
    onError: error => toast.error(error.message),
  });

  const updateOsMutation = trpc.serviceOrders.update.useMutation({
    onSuccess: async (_result, variables) => {
      await utils.serviceOrders.workspace.invalidate({ id: orderId });
      toast.success(
        variables.status === "cancelled"
          ? "OS cancelada e passagem removida do pátio"
          : "Status da OS atualizado"
      );
    },
    onError: error => toast.error(error.message),
  });

  const budgetMutation = trpc.serviceOrders.updateBudgetItemStatus.useMutation({
    onSuccess: async () => {
      await utils.serviceOrders.workspace.invalidate({ id: orderId });
    },
    onError: error => toast.error(error.message),
  });

  const deliveryMutation = trpc.patio.confirmDelivery.useMutation({
    onSuccess: async () => {
      await utils.serviceOrders.workspace.invalidate({ id: orderId });
      toast.success("Entrega confirmada");
    },
    onError: error => toast.error(error.message),
  });

  const cancelPassageMutation = trpc.patio.cancel.useMutation({
    onSuccess: async () => {
      await utils.serviceOrders.workspace.invalidate({ id: orderId });
      toast.success("Orçamento não aprovado — passagem cancelada");
    },
    onError: error => toast.error(error.message),
  });

  const data = query.data;
  const stageActions = useMemo(
    () =>
      WORKSPACE_STAGE_ACTIONS.filter(action => {
        if ("cancelYard" in action && action.cancelYard) {
          const stage = data?.yardCurrentStage;
          if (!stage || !canRejectApprovalFromStage(stage)) return false;
          if (!access?.canOperatePatio) return false;
          return true;
        }
        if ("osStatus" in action && action.osStatus === "cancelled") {
          return Boolean(access?.canCancelServiceOrder);
        }
        return true;
      }),
    [
      access?.canCancelServiceOrder,
      access?.canOperatePatio,
      data?.yardCurrentStage,
    ]
  );
  const checklistDone = Object.values(checkedItems).filter(Boolean).length;

  const yardElapsed = useMemo(() => {
    if (!data) return "—";
    const start = data.yardStageEnteredAt ?? data.yardCreatedAt ?? data.createdAt;
    return formatDuration(Date.now() - start);
  }, [data]);

  const statusLabel = data
    ? getWorkspaceStatusLabel(data.status, data.yardCurrentStage)
    : "";

  const diagnosisText =
    data?.diagnosis?.trim() ||
    (data?.yardCurrentStage === "diagnostico"
      ? "Pendente diagnóstico inicial — VCDS conectado"
      : "Diagnóstico ainda não informado.");

  function handleStageAction(action: (typeof WORKSPACE_STAGE_ACTIONS)[number]) {
    if (!data) return;
    if ("deliverYard" in action && action.deliverYard) {
      deliveryMutation.mutate({
        id: data.vehicleId,
        expectedVersion: data.yardVersion,
      });
      return;
    }
    if ("cancelYard" in action && action.cancelYard) {
      if (
        !data.yardCurrentStage ||
        !canRejectApprovalFromStage(data.yardCurrentStage)
      ) {
        toast.error(
          "Não aprovado só é permitido nas etapas Orçamento ou Aguardando aprovação"
        );
        return;
      }
      cancelPassageMutation.mutate({
        id: data.vehicleId,
        expectedVersion: data.yardVersion,
      });
      if (
        "osStatus" in action &&
        action.osStatus === "cancelled" &&
        access?.canCancelServiceOrder
      ) {
        updateOsMutation.mutate({
          id: data.id,
          expectedVersion: data.version,
          status: action.osStatus,
        });
      }
      return;
    }
    if ("osStatus" in action && action.osStatus) {
      if (
        action.osStatus === "cancelled" &&
        !access?.canCancelServiceOrder
      ) {
        toast.error("Cancelamento de OS restrito ao perfil DEV");
        return;
      }
      updateOsMutation.mutate({
        id: data.id,
        expectedVersion: data.version,
        status: action.osStatus,
      });
      return;
    }
    if (data.yardCurrentStage === action.patioStage) return;
    moveMutation.mutate({
      id: data.vehicleId,
      toStage: action.patioStage,
      expectedVersion: data.yardVersion,
    });
  }

  if (query.isLoading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  if (query.isError || !data) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="OS não encontrada"
        description={query.error?.message ?? "Verifique o link e tente novamente."}
        action={
          <Button variant="outline" onClick={() => setLocation("/ordens-servico")}>
            Voltar para lista
          </Button>
        }
      />
    );
  }

  const tierBadge = data.isFirstVisit
    ? "Bronze"
    : data.campaignOrigin?.trim() || null;

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 gap-2 text-muted-foreground"
            onClick={() => setLocation("/ordens-servico")}
          >
            <ArrowLeft className="size-4" />
            Ordens de serviço
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl font-bold tracking-tight">
              {data.displayCode}
            </h1>
            <Badge className="border-amber-500/30 bg-amber-500/15 text-amber-200">
              {statusLabel}
            </Badge>
            {tierBadge ? (
              <Badge variant="outline" className="border-zinc-500/40 text-zinc-300">
                {tierBadge}
              </Badge>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">
            Entrada:{" "}
            {new Date(data.createdAt).toLocaleDateString("pt-BR")}
            <span className="mx-2 text-border">·</span>
            <span className="font-mono text-xs">{data.code}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <Link2 className="size-4" /> Link Cliente
          </Button>
          {data.customerPhone ? (
            <Button variant="outline" size="sm" asChild>
              <a
                href={`https://wa.me/55${data.customerPhone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle className="size-4" /> WhatsApp
              </a>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              <MessageCircle className="size-4" /> WhatsApp
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Tag className="size-4" /> Etiqueta
          </Button>
          <Button variant="outline" size="sm">
            <Pencil className="size-4" /> Editar
          </Button>
        </div>
      </div>

      <Card className="border-border/70 bg-card/60">
        <CardContent className="flex flex-wrap items-center gap-2 p-4">
          <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Mover para
          </span>
          {stageActions.map(action => (
            <Button
              key={action.label}
              size="sm"
              variant={
                !("osStatus" in action) &&
                data.yardCurrentStage === action.patioStage
                  ? "default"
                  : "outline"
              }
              disabled={moveMutation.isPending || updateOsMutation.isPending}
              onClick={() => handleStageAction(action)}
            >
              {action.label}
            </Button>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-5">
          <WorkspaceCard title="Veículo" icon={Car}>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
              <Field label="Placa" value={formatPlate(data.vehiclePlate)} mono />
              <Field label="Modelo" value={data.vehicleModel} />
              <Field label="Marca" value={data.vehicleMake || "—"} />
              <Field label="Ano" value={String(data.vehicleYear ?? "—")} />
              <Field
                label="KM"
                value={
                  data.mileage != null
                    ? new Intl.NumberFormat("pt-BR").format(data.mileage)
                    : "—"
                }
              />
              {data.vehicleColor ? (
                <Field label="Cor" value={data.vehicleColor} />
              ) : null}
            </dl>
          </WorkspaceCard>

          <WorkspaceCard title="Diagnóstico & Serviço" icon={Wrench}>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Motivo
                </p>
                <p className="mt-1 text-sm leading-relaxed">
                  {data.serviceDescription}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Tipo de Serviço
                </p>
                <p className="mt-1 text-sm">{data.serviceType || "—"}</p>
              </div>
              <div className="rounded-xl border border-sky-500/25 bg-sky-500/10 px-4 py-3 text-sm text-sky-100">
                {diagnosisText}
              </div>
            </div>
          </WorkspaceCard>

          <Collapsible open={checklistOpen} onOpenChange={setChecklistOpen}>
            <Card className="border-border/70 bg-card/80">
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="flex w-full items-center justify-between p-4 text-left"
                >
                  <span className="text-sm font-semibold">
                    Checklist de Entrada
                  </span>
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    {checklistDone}/{ENTRY_CHECKLIST_ITEMS.length}
                    <ChevronDown
                      className={cn(
                        "size-4 transition",
                        checklistOpen && "rotate-180"
                      )}
                    />
                  </span>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-2 border-t border-border/60 pt-0">
                  {ENTRY_CHECKLIST_ITEMS.map((item, index) => (
                    <label
                      key={item}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted/30"
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(checkedItems[index])}
                        onChange={event =>
                          setCheckedItems(prev => ({
                            ...prev,
                            [index]: event.target.checked,
                          }))
                        }
                        className="size-4 rounded border-border"
                      />
                      <span className="text-sm">{item}</span>
                    </label>
                  ))}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          <WorkspaceCard
            title="Itens do Orçamento"
            icon={Tag}
            action={
              <Badge variant="secondary">{data.budgetItems.length}</Badge>
            }
            footer={
              <Button variant="outline" size="sm" className="w-full">
                + Adicionar
              </Button>
            }
          >
            <div className="space-y-3">
              {data.budgetItems.map(item => {
                const margin = marginPercent(item.amountCents, item.costCents);
                return (
                  <div
                    key={item.id}
                    className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium leading-snug">
                          {item.description}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {item.priorityLabel ? (
                            <Badge variant="outline" className="text-[0.65rem]">
                              {item.priorityLabel}
                            </Badge>
                          ) : null}
                          <Badge variant="outline" className="text-[0.65rem]">
                            {BUDGET_ITEM_KIND_LABELS[item.kind] ?? item.kind}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[0.65rem]",
                              item.status === "pending" &&
                                "border-amber-500/30 text-amber-200",
                              item.status === "approved" &&
                                "border-emerald-500/30 text-emerald-200",
                              item.status === "rejected" &&
                                "border-red-500/30 text-red-200"
                            )}
                          >
                            {BUDGET_ITEM_STATUS_LABELS[item.status] ??
                              item.status}
                          </Badge>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Custo: {money(item.costCents)}
                          {margin ? ` · Margem: ${margin}%` : null}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-amber-200">
                          {money(item.amountCents)}
                        </p>
                        <div className="mt-2 flex gap-1">
                          <Button
                            size="icon"
                            variant="outline"
                            className="size-8 border-emerald-500/30 text-emerald-400"
                            disabled={budgetMutation.isPending}
                            onClick={() =>
                              budgetMutation.mutate({
                                id: item.id,
                                serviceOrderId: data.id,
                                status: "approved",
                              })
                            }
                          >
                            <Check className="size-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="size-8 border-red-500/30 text-red-400"
                            disabled={budgetMutation.isPending}
                            onClick={() =>
                              budgetMutation.mutate({
                                id: item.id,
                                serviceOrderId: data.id,
                                status: "rejected",
                              })
                            }
                          >
                            <X className="size-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="size-8"
                            disabled
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </WorkspaceCard>
        </div>

        <div className="space-y-5">
          <WorkspaceCard title="Cliente" icon={User}>
            <p className="font-semibold">{data.customerName}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {data.customerPhone || "—"}
            </p>
            {data.customerEmail ? (
              <p className="text-sm text-muted-foreground">{data.customerEmail}</p>
            ) : null}
            <Button variant="link" className="mt-2 h-auto p-0 text-primary">
              Ver perfil completo
            </Button>
          </WorkspaceCard>

          <WorkspaceCard title="Resumo Financeiro" icon={Tag}>
            <dl className="space-y-2 text-sm">
              <SummaryRow
                label="Total Orçado"
                value={money(data.budgetSummary.totalBudgeted)}
              />
              <SummaryRow
                label="Pendente"
                value={money(data.budgetSummary.pending)}
                tone="amber"
              />
              <SummaryRow
                label="Aprovado"
                value={money(data.budgetSummary.approved)}
                tone="green"
              />
              <SummaryRow
                label="Recusado"
                value={money(data.budgetSummary.rejected)}
                tone="red"
              />
              <div className="border-t border-border/60 pt-2">
                <SummaryRow
                  label="Total OS"
                  value={money(data.budgetSummary.totalOs)}
                  strong
                />
              </div>
            </dl>
          </WorkspaceCard>

          <WorkspaceCard title="Aberto por" icon={User}>
            <p className="font-semibold">
              {data.consultantName || data.createdByName || "Usuário do sistema"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Consultor responsável pela abertura da OS
            </p>
          </WorkspaceCard>

          <WorkspaceCard title="Mecânico Responsável" icon={Wrench}>
            <p className="font-semibold">{data.responsibleName || "A definir"}</p>
            {data.responsibleSpecialty ? (
              <p className="text-sm text-muted-foreground">
                Especialidade: {data.responsibleSpecialty}
              </p>
            ) : null}
            {data.responsiblePosition ? (
              <Badge className="mt-2 border-orange-500/30 bg-orange-500/10 text-orange-200">
                {POSITION_LABELS[
                  data.responsiblePosition as keyof typeof POSITION_LABELS
                ] ?? data.responsiblePosition}
              </Badge>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">
                Pode ser atribuído depois no pátio
              </p>
            )}
            {data.workshopResourceName ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Recurso: {data.workshopResourceName}
              </p>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">
                Recurso / elevador: a definir
              </p>
            )}
          </WorkspaceCard>

          <Card className="border-amber-500/30 bg-amber-500/[0.06] shadow-panel">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="grid size-10 place-items-center rounded-xl border border-amber-500/30 bg-amber-500/10">
                <Clock3 className="size-5 text-amber-300" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Tempo no Pátio
                </p>
                <p className="text-xl font-bold text-amber-200">{yardElapsed}</p>
              </div>
            </CardContent>
          </Card>

          <WorkspaceCard title="Ações Rápidas">
            <div className="space-y-2">
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={() => setLocation("/patio/kanban")}
              >
                <ExternalLink className="size-4" /> Ver no Pátio Kanban
              </Button>
              <Button variant="secondary" className="w-full justify-start" disabled>
                <User className="size-4" /> Perfil do Cliente
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={() => setLocation("/ordens-servico")}
              >
                <Printer className="size-4" /> Lista de OS
              </Button>
            </div>
          </WorkspaceCard>
        </div>
      </div>
    </div>
  );
}

function WorkspaceCard({
  title,
  icon: Icon,
  children,
  action,
  footer,
}: {
  title: string;
  icon?: typeof Car;
  children: ReactNode;
  action?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Card className="border-border/70 bg-card/80 shadow-panel">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          {Icon ? <Icon className="size-4 text-primary" /> : null}
          {title}
        </CardTitle>
        {action}
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
      {footer ? <div className="border-t border-border/60 p-4 pt-0">{footer}</div> : null}
    </Card>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-[0.65rem] font-semibold uppercase text-muted-foreground">
        {label}
      </dt>
      <dd className={cn("mt-0.5 font-medium", mono && "font-mono tracking-wider")}>
        {value}
      </dd>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  tone,
  strong,
}: {
  label: string;
  value: string;
  tone?: "amber" | "green" | "red";
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          strong && "text-base font-bold",
          tone === "amber" && "text-amber-300",
          tone === "green" && "text-emerald-300",
          tone === "red" && "text-red-300"
        )}
      >
        {value}
      </dd>
    </div>
  );
}

export function ServiceOrderWorkspaceRoute({
  params,
}: RouteComponentProps<{ id: string }>) {
  const orderId = Number(params.id);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="OS inválida"
        description="Informe um identificador válido na URL."
      />
    );
  }
  return <ServiceOrderWorkspacePage orderId={orderId} />;
}
