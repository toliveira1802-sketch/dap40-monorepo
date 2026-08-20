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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { formatMileage, formatPlate } from "@/lib/patio";
import type { ServiceOrderItem } from "@/lib/routerTypes";
import { trpc } from "@/lib/trpc";
import {
  SERVICE_ORDER_STATUSES,
  SERVICE_ORDER_STATUS_META,
  type ServiceOrderStatus,
} from "@shared/patio";
import {
  ArrowUpRight,
  ClipboardList,
  FilterX,
  Loader2,
  MessageSquareText,
  Plus,
  RefreshCw,
  Search,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const statusStyle: Record<ServiceOrderStatus, string> = {
  draft: "border-slate-400/25 bg-slate-400/10 text-slate-200",
  open: "border-sky-400/25 bg-sky-400/10 text-sky-200",
  in_progress: "border-primary/30 bg-primary/10 text-primary",
  waiting_parts: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  waiting_approval: "border-purple-400/30 bg-purple-400/10 text-purple-200",
  completed: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
  delivered: "border-teal-400/25 bg-teal-400/10 text-teal-200",
  cancelled: "border-zinc-400/20 bg-zinc-400/10 text-zinc-300",
};

function money(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

function toCents(value: string) {
  const amount = Number(value.replace(/[^\d,.-]/g, "").replace(",", "."));
  return Number.isFinite(amount) && amount >= 0 ? Math.round(amount * 100) : 0;
}

export default function ServiceOrdersPage() {
  const [location, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ServiceOrderStatus | "all">("all");

  useEffect(() => {
    const query = location.includes("?") ? location.split("?")[1] : "";
    const params = new URLSearchParams(query);
    if (params.get("novo") === "1") {
      setLocation("/ordens-servico/nova");
    }
  }, [location, setLocation]);

  const input = useMemo(
    () => ({
      search: search.trim() || undefined,
      status: status === "all" ? undefined : status,
    }),
    [search, status]
  );
  const query = trpc.serviceOrders.list.useQuery(input, {
    refetchInterval: 10_000,
    refetchIntervalInBackground: true,
  });
  const orders = query.data ?? [];
  const active = orders.filter(
    item => !["completed", "cancelled"].includes(item.status)
  );

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Execução e histórico"
        title="Ordens de serviço"
        description="Crie a OS vinculada ao veículo e preserve status, responsável, valores e todas as atualizações."
        actions={
          <Button onClick={() => setLocation("/ordens-servico/nova")}>
            <Plus className="size-4" /> Criar OS
          </Button>
        }
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="OS neste filtro" value={String(orders.length)} />
        <Metric label="Em aberto" value={String(active.length)} />
        <Metric
          label="Aguardando peças"
          value={String(
            orders.filter(item => item.status === "waiting_parts").length
          )}
        />
        <Metric
          label="Valor em aberto"
          value={money(
            active.reduce(
              (sum, item) =>
                sum + item.laborAmountCents + item.partsAmountCents,
              0
            )
          )}
        />
      </div>
      <div className="grid gap-3 rounded-2xl border border-border bg-card/70 p-3 shadow-panel md:grid-cols-[minmax(240px,1fr)_220px_44px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Buscar OS, placa, cliente ou serviço"
          />
        </div>
        <Select
          value={status}
          onValueChange={value =>
            setStatus(value as ServiceOrderStatus | "all")
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {SERVICE_ORDER_STATUSES.map(item => (
              <SelectItem key={item} value={item}>
                {SERVICE_ORDER_STATUS_META[item].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Limpar filtros"
          onClick={() => {
            setSearch("");
            setStatus("all");
          }}
        >
          <FilterX className="size-4" />
        </Button>
      </div>
      {query.isError ? (
        <EmptyState
          icon={ClipboardList}
          title="Falha ao carregar as ordens de serviço"
          description={query.error.message}
          action={
            <Button variant="outline" onClick={() => void query.refetch()}>
              <RefreshCw className="size-4" /> Tentar novamente
            </Button>
          }
        />
      ) : query.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-64 animate-pulse rounded-2xl bg-card" />
          ))}
        </div>
      ) : orders.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {orders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onOpen={() => setLocation(`/ordens-servico/${order.id}`)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ClipboardList}
          title="Nenhuma ordem de serviço neste filtro"
          description="Crie a primeira OS para iniciar o histórico do veículo."
          action={
            <Button onClick={() => setLocation("/ordens-servico/nova")}>
              <Plus className="size-4" /> Criar OS
            </Button>
          }
        />
      )}
    </div>
  );
}

function OrderCard({
  order,
  onOpen,
}: {
  order: ServiceOrderItem;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 text-left shadow-panel transition-all hover:-translate-y-0.5 hover:border-primary/35"
    >
      <div className="absolute inset-x-0 top-0 h-0.5 bg-primary" />
      <div className="flex items-start justify-between gap-3">
        <div className="grid size-10 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
          <ClipboardList className="size-5" />
        </div>
        <span className="font-mono text-[0.68rem] text-muted-foreground">
          {order.code}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant="outline" className={statusStyle[order.status]}>
          {SERVICE_ORDER_STATUS_META[order.status].label}
        </Badge>
        <Badge variant="outline">
          {money(order.laborAmountCents + order.partsAmountCents)}
        </Badge>
      </div>
      <h2 className="mt-4 line-clamp-2 font-display text-lg font-bold uppercase italic">
        {order.title}
      </h2>
      <p className="mt-2 line-clamp-2 text-sm leading-5 text-muted-foreground">
        {order.serviceDescription}
      </p>
      <div className="mt-4 rounded-xl border border-border/70 bg-background/45 px-3 py-2">
        <p className="font-mono text-xs font-semibold tracking-wider">
          {formatPlate(order.vehiclePlate)}
        </p>
        <p className="mt-0.5 truncate text-[0.68rem] text-muted-foreground">
          {order.customerName} · {order.vehicleModel} ·{" "}
          {formatMileage(order.mileage)}
        </p>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/70 pt-3 text-xs text-muted-foreground">
        <span className="flex min-w-0 items-center gap-2">
          <UserRound className="size-3.5" />
          <span className="truncate">
            {order.responsibleName || "Responsável a definir"}
          </span>
        </span>
        <span>{new Date(order.createdAt).toLocaleDateString("pt-BR")}</span>
      </div>
    </button>
  );
}

function OrderForm({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const utils = trpc.useUtils();
  const vehicles =
    trpc.patio.directory.useQuery({}, { enabled: open }).data ?? [];
  const collaborators =
    trpc.collaborators.list.useQuery(
      { includeInactive: false },
      { enabled: open }
    ).data ?? [];
  const [vehicleId, setVehicleId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [responsible, setResponsible] = useState("none");
  const [deadline, setDeadline] = useState("");
  const [labor, setLabor] = useState("");
  const [parts, setParts] = useState("");
  const create = trpc.serviceOrders.create.useMutation({
    onSuccess: async order => {
      await utils.serviceOrders.list.invalidate();
      toast.success(`${order?.code || "OS"} criada com histórico iniciado`);
      setVehicleId("");
      setTitle("");
      setDescription("");
      setDiagnosis("");
      setResponsible("none");
      setDeadline("");
      setLabor("");
      setParts("");
      onOpenChange(false);
    },
    onError: error => toast.error(error.message),
  });
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    create.mutate({
      vehicleId: Number(vehicleId),
      status: "open",
      title,
      serviceDescription: description,
      diagnosis: diagnosis.trim() || null,
      servicesPerformed: null,
      partsDescription: null,
      laborAmountCents: toCents(labor),
      partsAmountCents: toCents(parts),
      responsibleCollaboratorId:
        responsible === "none" ? null : Number(responsible),
      expectedCompletionAt: deadline ? new Date(deadline).getTime() : null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl uppercase italic">
            Criar ordem de serviço
          </DialogTitle>
          <DialogDescription>
            A OS recebe um número exclusivo e uma linha do tempo permanente.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-5">
          <Field label="Veículo *">
            <Select value={vehicleId} onValueChange={setVehicleId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o veículo" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map(vehicle => (
                  <SelectItem key={vehicle.id} value={String(vehicle.id)}>
                    {formatPlate(vehicle.plate)} · {vehicle.customerName} ·{" "}
                    {vehicle.model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          {!vehicles.length ? (
            <p className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-3 text-xs text-amber-100">
              Cadastre a entrada do veículo antes de criar a OS.
            </p>
          ) : null}
          <Field label="Título da OS *">
            <Input
              value={title}
              onChange={event => setTitle(event.target.value)}
              placeholder="Ex.: Revisão preventiva de 40.000 km"
              maxLength={180}
              required
            />
          </Field>
          <Field label="Serviço solicitado *">
            <Textarea
              value={description}
              onChange={event => setDescription(event.target.value)}
              className="min-h-28"
              maxLength={10_000}
              required
            />
          </Field>
          <Field label="Diagnóstico inicial">
            <Textarea
              value={diagnosis}
              onChange={event => setDiagnosis(event.target.value)}
              className="min-h-20"
              maxLength={10_000}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Responsável">
              <Select value={responsible} onValueChange={setResponsible}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">A definir</SelectItem>
                  {collaborators.map(item => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Previsão de conclusão">
              <Input
                type="datetime-local"
                value={deadline}
                onChange={event => setDeadline(event.target.value)}
              />
            </Field>
            <Field label="Mão de obra (R$)">
              <Input
                inputMode="decimal"
                value={labor}
                onChange={event => setLabor(event.target.value)}
                placeholder="0,00"
              />
            </Field>
            <Field label="Peças (R$)">
              <Input
                inputMode="decimal"
                value={parts}
                onChange={event => setParts(event.target.value)}
                placeholder="0,00"
              />
            </Field>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                create.isPending ||
                !vehicleId ||
                title.trim().length < 3 ||
                description.trim().length < 3
              }
            >
              {create.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ClipboardList className="size-4" />
              )}
              Criar OS
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function OrderDetail({
  id,
  open,
  onOpenChange,
}: {
  id: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const [comment, setComment] = useState("");
  const { data: access } = trpc.access.capabilities.useQuery(undefined, {
    enabled: open,
  });
  const query = trpc.serviceOrders.get.useQuery(
    { id: id ?? 0 },
    { enabled: open && Boolean(id), refetchInterval: 10_000 }
  );
  const collaborators =
    trpc.collaborators.list.useQuery(
      { includeInactive: false },
      { enabled: open }
    ).data ?? [];
  const refresh = () =>
    Promise.all([
      utils.serviceOrders.get.invalidate(),
      utils.serviceOrders.list.invalidate(),
    ]);
  const update = trpc.serviceOrders.update.useMutation({
    onSuccess: async () => {
      await refresh();
      toast.success("OS atualizada e registrada no histórico");
    },
    onError: error => toast.error(error.message),
  });
  const addComment = trpc.serviceOrders.addComment.useMutation({
    onSuccess: async () => {
      setComment("");
      await refresh();
      toast.success("Anotação adicionada ao histórico");
    },
    onError: error => toast.error(error.message),
  });
  const data = query.data;
  const patch = (values: {
    status?: ServiceOrderStatus;
    responsibleCollaboratorId?: number | null;
  }) => {
    if (data) {
      update.mutate({
        id: data.id,
        expectedVersion: data.version,
        ...values,
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto border-l-border bg-background p-0 sm:max-w-2xl">
        {!data ? (
          <div className="grid min-h-full place-items-center">
            <Spinner className="size-6 text-primary" />
          </div>
        ) : (
          <div>
            <div className="border-b border-border bg-[linear-gradient(145deg,rgba(209,10,17,0.11),rgba(15,15,15,0.96)_48%)] p-6 pt-10">
              <div className="mb-4 flex items-center justify-between">
                <ClipboardList className="size-6 text-primary" />
                <span className="font-mono text-xs text-muted-foreground">
                  {data.code}
                </span>
              </div>
              <SheetHeader className="text-left">
                <SheetTitle className="font-display text-2xl uppercase italic">
                  {data.title}
                </SheetTitle>
                <SheetDescription>
                  Criada em {new Date(data.createdAt).toLocaleString("pt-BR")}{" "}
                  por {data.createdByName || "equipe"}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4 flex gap-2">
                <Badge
                  variant="outline"
                  className={statusStyle[data.status]}
                >
                  {SERVICE_ORDER_STATUS_META[data.status].label}
                </Badge>
                <Badge variant="outline">
                  Total {money(data.totalAmountCents)}
                </Badge>
              </div>
            </div>
            <div className="space-y-6 p-6">
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  setLocation(`/veiculos?vehicle=${data.vehicleId}`);
                }}
                className="flex w-full items-center justify-between rounded-2xl border border-border bg-card p-4 text-left hover:border-primary/35"
              >
                <div>
                  <p className="font-mono text-sm font-semibold tracking-wider">
                    {formatPlate(data.vehiclePlate)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {data.customerName} · {data.vehicleModel} ·{" "}
                    {formatMileage(data.mileage)}
                  </p>
                </div>
                <ArrowUpRight className="size-4 text-primary" />
              </button>
              <div className="grid gap-3 sm:grid-cols-2">
                <Control label="Status">
                  <Select
                    value={data.status}
                    onValueChange={value =>
                      patch({ status: value as ServiceOrderStatus })
                    }
                    disabled={update.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_ORDER_STATUSES.filter(
                        item =>
                          item !== "cancelled" ||
                          access?.canCancelServiceOrder ||
                          data.status === "cancelled"
                      ).map(item => (
                        <SelectItem key={item} value={item}>
                          {SERVICE_ORDER_STATUS_META[item].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Control>
                <Control label="Responsável">
                  <Select
                    value={
                      data.responsibleCollaboratorId
                        ? String(data.responsibleCollaboratorId)
                        : "none"
                    }
                    onValueChange={value =>
                      patch({
                        responsibleCollaboratorId:
                          value === "none" ? null : Number(value),
                      })
                    }
                    disabled={update.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">A definir</SelectItem>
                      {collaborators.map(item => (
                        <SelectItem key={item.id} value={String(item.id)}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Control>
              </div>
              <TextBlock
                label="Serviço solicitado"
                text={data.serviceDescription || "Não especificado"}
              />
              <TextBlock
                label="Diagnóstico"
                text={data.diagnosis || "Diagnóstico ainda não informado."}
              />
              <div className="grid gap-3 sm:grid-cols-3">
                <Metric
                  label="Mão de obra"
                  value={money(data.laborAmountCents)}
                />
                <Metric label="Peças" value={money(data.partsAmountCents)} />
                <Metric
                  label="Previsão"
                  value={
                    data.expectedCompletionAt
                      ? new Date(
                          data.expectedCompletionAt
                        ).toLocaleDateString("pt-BR")
                      : "A definir"
                  }
                />
              </div>
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="mb-3 flex items-center gap-2">
                  <MessageSquareText className="size-4 text-primary" />
                  <p className="text-sm font-semibold">
                    Adicionar ao histórico
                  </p>
                </div>
                <Textarea
                  value={comment}
                  onChange={event => setComment(event.target.value)}
                  placeholder="Ex.: cliente aprovou o orçamento por telefone..."
                  className="min-h-24"
                />
                <div className="mt-3 flex justify-end">
                  <Button
                    size="sm"
                    disabled={
                      comment.trim().length < 1 || addComment.isPending
                    }
                    onClick={() =>
                      addComment.mutate({
                        serviceOrderId: data.id,
                        body: comment,
                      })
                    }
                  >
                    Registrar anotação
                  </Button>
                </div>
              </div>
              <div>
                <p className="mb-3 text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Histórico da OS
                </p>
                <div className="space-y-3">
                  {(data.updates || []).map(item => (
                    <div
                      key={item.id}
                      className="relative border-l border-border pl-4"
                    >
                      <span className="absolute -left-1 top-1.5 size-2 rounded-full bg-primary" />
                      <p className="text-sm leading-5">{item.text || (item as any).body}</p>
                      <p className="mt-1 text-[0.68rem] text-muted-foreground">
                        {item.authorName || "Sistema"} ·{" "}
                        {new Date(item.createdAt).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Control({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[0.62rem] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card/70 p-4">
      <p className="text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-display text-2xl font-bold tabular-nums">
        {value}
      </p>
    </div>
  );
}

function TextBlock({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="mb-2 text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="whitespace-pre-wrap text-sm leading-6 text-foreground/90">
        {text}
      </p>
    </div>
  );
}
