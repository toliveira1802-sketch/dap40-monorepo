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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import type { AppointmentItem } from "@/lib/routerTypes";
import { trpc } from "@/lib/trpc";
import {
  APPOINTMENT_ACTION_META,
  APPOINTMENT_STATUSES,
  APPOINTMENT_STATUS_META,
  type AppointmentAction,
  type AppointmentStatus,
} from "@shared/patio";
import {
  AlertTriangle,
  CalendarClock,
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  UserCheck,
  UserRound,
  UserX,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";

const statusClass: Record<AppointmentStatus, string> = {
  scheduled: "border-sky-500/25 bg-sky-500/5 text-sky-400",
  confirmed: "border-emerald-500/25 bg-emerald-500/5 text-emerald-400",
  checked_in: "border-amber-500/25 bg-amber-500/5 text-amber-400",
  completed: "border-violet-500/25 bg-violet-500/5 text-violet-400",
  cancelled: "border-border text-muted-foreground",
  no_show: "border-primary/25 bg-primary/5 text-primary",
};

function startOfCalendarGrid(month: Date) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  firstDay.setDate(firstDay.getDate() - firstDay.getDay());
  firstDay.setHours(0, 0, 0, 0);
  return firstDay;
}

function addCalendarDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function dateKey(timestamp: number | Date) {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function defaultScheduledAt() {
  const date = new Date(Date.now() + 60 * 60 * 1000);
  date.setMinutes(0, 0, 0);
  return date.getTime();
}

function toDateTimeLocal(timestamp: number) {
  const date = new Date(timestamp);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(timestamp - offset).toISOString().slice(0, 16);
}

function formatAppointmentDate(timestamp: number) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
}

function formatPlate(plate: string) {
  return plate.length === 7 ? `${plate.slice(0, 3)}-${plate.slice(3)}` : plate;
}

const emptyForm = () => ({
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  vehiclePlate: "",
  vehicleMake: "",
  vehicleModel: "",
  serviceRequested: "",
  scheduledAt: toDateTimeLocal(defaultScheduledAt()),
  estimatedDurationMinutes: "60",
  notes: "",
  responsibleCollaboratorId: "none",
});

export default function AppointmentsPage() {
  const [search, setSearch] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [status, setStatus] = useState<AppointmentStatus | "all">("all");
  const [responsible, setResponsible] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AppointmentItem | null>(null);
  const [rescheduling, setRescheduling] = useState<AppointmentItem | null>(
    null
  );
  const utils = trpc.useUtils();
  const actionMutation = trpc.appointments.action.useMutation();

  const range = useMemo(() => {
    const start = startOfCalendarGrid(calendarMonth);
    const end = addCalendarDays(start, 42);
    return { from: start.getTime(), to: end.getTime() - 1 };
  }, [calendarMonth]);

  const input = useMemo(
    () => ({
      search: search || undefined,
      status: status === "all" ? undefined : status,
      responsibleCollaboratorId:
        responsible === "all" ? undefined : Number(responsible),
      ...range,
    }),
    [range, responsible, search, status]
  );

  const {
    data: appointmentRecords = [],
    isLoading,
    isError,
    error,
    refetch,
  } = trpc.appointments.list.useQuery(input, { refetchInterval: 15_000 });
  const { data: collaborators = [] } = trpc.collaborators.list.useQuery({
    includeInactive: false,
  });

  const appointments = appointmentRecords;

  const scheduledCount = appointments.filter(item =>
    ["scheduled", "confirmed"].includes(item.status)
  ).length;
  const checkedInCount = appointments.filter(
    item => item.status === "checked_in"
  ).length;
  const monthLabel = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(calendarMonth);

  function changeMonth(offset: number) {
    setCalendarMonth(
      current => new Date(current.getFullYear(), current.getMonth() + offset, 1)
    );
  }

  function goToCurrentMonth() {
    const today = new Date();
    setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  }

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(appointment: AppointmentItem) {
    setEditing(appointment);
    setDialogOpen(true);
  }

  async function runAction(
    appointment: AppointmentItem,
    action: AppointmentAction,
    scheduledAt?: number
  ) {
    try {
      const result = await actionMutation.mutateAsync({
        id: appointment.id,
        expectedVersion: appointment.version,
        action,
        scheduledAt,
      });
      await utils.appointments.list.invalidate();
      toast.success(
        `${APPOINTMENT_ACTION_META[action].triggerLabel}. Gatilho #${result.triggerId} criado para o agente.`
      );
      setRescheduling(null);
    } catch (actionError) {
      toast.error(
        actionError instanceof Error
          ? actionError.message
          : "Não foi possível atualizar o agendamento"
      );
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Recepção e capacidade"
        title="Agendamentos"
        description="Organize chegadas, serviços previstos e responsáveis antes da entrada do veículo no pátio."
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> Novo agendamento
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric
          icon={CalendarDays}
          label="Na visão atual"
          value={appointments.length}
        />
        <Metric
          icon={CalendarCheck2}
          label="Aguardando chegada"
          value={scheduledCount}
        />
        <Metric
          icon={UserRound}
          label="Cliente chegou"
          value={checkedInCount}
        />
      </div>

      <div className="grid gap-3 rounded-2xl border border-border bg-card/75 p-4 shadow-panel lg:grid-cols-[minmax(240px,1.5fr)_auto_1fr_1fr]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Cliente, telefone, placa ou serviço"
          />
        </div>
        <div className="flex gap-1 rounded-xl border border-border bg-background/40 p-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => changeMonth(-1)}
            aria-label="Mês anterior"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={goToCurrentMonth}
            className="whitespace-nowrap"
          >
            Hoje
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => changeMonth(1)}
            aria-label="Próximo mês"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <Select
          value={status}
          onValueChange={value => setStatus(value as AppointmentStatus | "all")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {APPOINTMENT_STATUSES.map(item => (
              <SelectItem key={item} value={item}>
                {APPOINTMENT_STATUS_META[item].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={responsible} onValueChange={setResponsible}>
          <SelectTrigger>
            <SelectValue placeholder="Responsável" />
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
      </div>

      {!isError && !isLoading ? (
        <AppointmentCalendar
          appointments={appointments}
          month={calendarMonth}
          monthLabel={monthLabel}
          onOpenAppointment={openEdit}
          onCreate={openCreate}
        />
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-border bg-card/75 shadow-panel">
        {isError ? (
          <div className="p-5">
            <EmptyState
              icon={AlertTriangle}
              title="Falha ao carregar agendamentos"
              description={error.message}
              action={
                <Button variant="outline" onClick={() => void refetch()}>
                  <RefreshCw className="size-4" /> Tentar novamente
                </Button>
              }
            />
          </div>
        ) : isLoading ? (
          <div className="grid gap-3 p-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-16 animate-pulse rounded-xl bg-muted/60"
              />
            ))}
          </div>
        ) : appointments.length ? (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Data e hora</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Veículo</TableHead>
                    <TableHead>Serviço</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map(appointment => (
                    <TableRow
                      key={appointment.id}
                      className="cursor-pointer"
                      onClick={() => openEdit(appointment)}
                    >
                      <TableCell>
                        <div className="font-medium">
                          {formatAppointmentDate(appointment.scheduledAt)}
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock3 className="size-3" />
                          {appointment.estimatedDurationMinutes} min
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {appointment.customerName}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {appointment.customerPhone}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono font-semibold tracking-wider">
                          {formatPlate(appointment.vehiclePlate)}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {appointment.vehicleMake
                            ? `${appointment.vehicleMake} `
                            : ""}
                          {appointment.vehicleModel}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-64">
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {appointment.serviceRequested}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {appointment.responsibleName || "A definir"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={statusClass[appointment.status]}
                        >
                          {APPOINTMENT_STATUS_META[appointment.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell onClick={event => event.stopPropagation()}>
                        <AppointmentActions
                          appointment={appointment}
                          pending={actionMutation.isPending}
                          onAction={action =>
                            void runAction(appointment, action)
                          }
                          onReschedule={() => setRescheduling(appointment)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="grid gap-3 p-3 lg:hidden">
              {appointments.map(appointment => (
                <div
                  key={appointment.id}
                  onClick={() => openEdit(appointment)}
                  className="cursor-pointer rounded-xl border border-border bg-background/40 p-4 text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">
                        {formatAppointmentDate(appointment.scheduledAt)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {appointment.customerName} ·{" "}
                        {formatPlate(appointment.vehiclePlate)}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={statusClass[appointment.status]}
                    >
                      {APPOINTMENT_STATUS_META[appointment.status].label}
                    </Badge>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                    {appointment.serviceRequested}
                  </p>
                  <div
                    className="mt-4 border-t border-border pt-3"
                    onClick={event => event.stopPropagation()}
                  >
                    <AppointmentActions
                      appointment={appointment}
                      pending={actionMutation.isPending}
                      onAction={action =>
                        void runAction(appointment, action)
                      }
                      onReschedule={() => setRescheduling(appointment)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="p-5">
            <EmptyState
              icon={CalendarDays}
              title="Nenhum agendamento encontrado"
              description="Ajuste os filtros ou registre o próximo atendimento da oficina."
              action={
                <Button onClick={openCreate}>
                  <Plus className="size-4" /> Novo agendamento
                </Button>
              }
            />
          </div>
        )}
      </div>

      <AppointmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        appointment={editing}
        collaborators={collaborators}
      />
      <RescheduleDialog
        appointment={rescheduling}
        open={Boolean(rescheduling)}
        pending={actionMutation.isPending}
        onOpenChange={open => {
          if (!open) setRescheduling(null);
        }}
        onConfirm={(appointment, scheduledAt) =>
          void runAction(appointment, "reschedule", scheduledAt)
        }
      />
    </div>
  );
}

function AppointmentCalendar({
  appointments,
  month,
  monthLabel,
  onOpenAppointment,
  onCreate,
}: {
  appointments: AppointmentItem[];
  month: Date;
  monthLabel: string;
  onOpenAppointment: (appointment: AppointmentItem) => void;
  onCreate: () => void;
}) {
  const gridStart = startOfCalendarGrid(month);
  const days = Array.from({ length: 42 }, (_, index) =>
    addCalendarDays(gridStart, index)
  );
  const appointmentsByDay = new Map<string, AppointmentItem[]>();

  for (const appointment of appointments) {
    const key = dateKey(appointment.scheduledAt);
    const dayAppointments = appointmentsByDay.get(key) ?? [];
    dayAppointments.push(appointment);
    appointmentsByDay.set(key, dayAppointments);
  }

  Array.from(appointmentsByDay.values()).forEach(dayAppointments => {
    dayAppointments.sort((left, right) => left.scheduledAt - right.scheduledAt);
  });

  const todayKey = dateKey(new Date());

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card/75 shadow-panel">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Calendário da oficina
          </p>
          <h2 className="mt-1 text-lg font-semibold capitalize">{monthLabel}</h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="size-2 rounded-full bg-sky-400" />
          {appointments.length}{" "}
          {appointments.length === 1 ? "agendamento" : "agendamentos"}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[860px]">
          <div className="grid grid-cols-7 border-b border-border bg-background/35">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(day => (
              <div
                key={day}
                className="px-3 py-2 text-center text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {days.map(day => {
              const key = dateKey(day);
              const dayAppointments = appointmentsByDay.get(key) ?? [];
              const isCurrentMonth = day.getMonth() === month.getMonth();
              const isToday = key === todayKey;

              return (
                <div
                  key={key}
                  className={`min-h-32 border-b border-r border-border p-2 ${
                    isCurrentMonth ? "bg-card/35" : "bg-background/20"
                  }`}
                >
                  <div
                    className={`mb-2 grid size-7 place-items-center rounded-full text-xs font-semibold ${
                      isToday
                        ? "bg-primary text-primary-foreground"
                        : isCurrentMonth
                          ? "text-foreground"
                          : "text-muted-foreground/45"
                    }`}
                  >
                    {day.getDate()}
                  </div>

                  <div className="space-y-1.5">
                    {dayAppointments.slice(0, 3).map(appointment => (
                      <button
                        key={appointment.id}
                        type="button"
                        onClick={() => onOpenAppointment(appointment)}
                        className={`w-full rounded-lg border px-2 py-1.5 text-left transition hover:brightness-125 ${statusClass[appointment.status]}`}
                        title={`${appointment.customerName} · ${appointment.serviceRequested}`}
                      >
                        <span className="block text-[0.62rem] font-bold">
                          {new Intl.DateTimeFormat("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          }).format(appointment.scheduledAt)}
                        </span>
                        <span className="mt-0.5 block truncate text-[0.68rem] font-semibold">
                          {appointment.customerName}
                        </span>
                        <span className="block truncate font-mono text-[0.58rem] opacity-75">
                          {formatPlate(appointment.vehiclePlate)}
                        </span>
                      </button>
                    ))}
                    {dayAppointments.length > 3 ? (
                      <p className="px-1 text-[0.62rem] font-medium text-muted-foreground">
                        +{dayAppointments.length - 3} neste dia
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {appointments.length === 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-background/25 px-5 py-4">
          <p className="text-sm text-muted-foreground">
            Nenhum agendamento registrado neste calendário.
          </p>
          <Button size="sm" onClick={onCreate}>
            <Plus className="size-4" /> Novo agendamento
          </Button>
        </div>
      ) : null}
    </section>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card/75 p-4 shadow-panel">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <Icon className="size-4 text-primary" />
      </div>
      <p className="mt-3 font-display text-3xl font-bold">{value}</p>
    </div>
  );
}

function AppointmentActions({
  appointment,
  pending,
  onAction,
  onReschedule,
}: {
  appointment: AppointmentItem;
  pending: boolean;
  onAction: (action: Exclude<AppointmentAction, "reschedule">) => void;
  onReschedule: () => void;
}) {
  const canConfirm = appointment.status === "scheduled";
  const canCheckIn = ["scheduled", "confirmed"].includes(appointment.status);
  const canReschedule = !["completed", "cancelled"].includes(
    appointment.status
  );
  const canMarkNoShow = ["scheduled", "confirmed"].includes(
    appointment.status
  );

  if (!canConfirm && !canCheckIn && !canReschedule && !canMarkNoShow) {
    return (
      <span className="text-xs text-muted-foreground">Sem ações pendentes</span>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {canConfirm ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => onAction("confirm")}
          className="h-8 gap-1.5 px-2 text-xs"
        >
          <CheckCircle2 className="size-3.5" /> Confirmar
        </Button>
      ) : null}
      {canCheckIn ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => onAction("check_in")}
          className="h-8 gap-1.5 px-2 text-xs"
        >
          <UserCheck className="size-3.5" /> Chegou
        </Button>
      ) : null}
      {canReschedule ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={onReschedule}
          className="h-8 gap-1.5 px-2 text-xs"
        >
          <CalendarClock className="size-3.5" /> Remarcar
        </Button>
      ) : null}
      {canMarkNoShow ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={pending}
          onClick={() => onAction("no_show")}
          className="h-8 gap-1.5 px-2 text-xs text-primary hover:text-primary"
        >
          <UserX className="size-3.5" /> Não compareceu
        </Button>
      ) : null}
    </div>
  );
}

function RescheduleDialog({
  appointment,
  open,
  pending,
  onOpenChange,
  onConfirm,
}: {
  appointment: AppointmentItem | null;
  open: boolean;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (appointment: AppointmentItem, scheduledAt: number) => void;
}) {
  const [scheduledAt, setScheduledAt] = useState("");

  useEffect(() => {
    if (open && appointment) {
      setScheduledAt(toDateTimeLocal(appointment.scheduledAt));
    }
  }, [appointment, open]);

  function confirm() {
    if (!appointment) return;
    const timestamp = new Date(scheduledAt).getTime();
    if (!Number.isFinite(timestamp)) {
      toast.error("Informe uma nova data e hora válidas");
      return;
    }
    onConfirm(appointment, timestamp);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-popover sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-bold uppercase tracking-wide">
            Remarcar agendamento
          </DialogTitle>
          <DialogDescription>
            {appointment
              ? `${appointment.customerName} · ${formatPlate(appointment.vehiclePlate)}`
              : "Defina a nova data e hora."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label>Nova data e hora</Label>
          <Input
            type="datetime-local"
            value={scheduledAt}
            onChange={event => setScheduledAt(event.target.value)}
          />
          <p className="text-xs leading-5 text-muted-foreground">
            A alteração criará um gatilho de remarcação para o agente de
            agendamento.
          </p>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="button" disabled={pending} onClick={confirm}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            Confirmar remarcação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AppointmentDialog({
  open,
  onOpenChange,
  appointment,
  collaborators,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: AppointmentItem | null;
  collaborators: Array<{ id: number; name: string }>;
}) {
  const [form, setForm] = useState(emptyForm);
  const utils = trpc.useUtils();
  const createMutation = trpc.appointments.create.useMutation();
  const updateMutation = trpc.appointments.update.useMutation();
  const pending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (!open) return;
    setForm(
      appointment
        ? {
            customerName: appointment.customerName,
            customerPhone: appointment.customerPhone,
            customerEmail: appointment.customerEmail ?? "",
            vehiclePlate: appointment.vehiclePlate,
            vehicleMake: appointment.vehicleMake ?? "",
            vehicleModel: appointment.vehicleModel,
            serviceRequested: appointment.serviceRequested,
            scheduledAt: toDateTimeLocal(appointment.scheduledAt),
            estimatedDurationMinutes: String(
              appointment.estimatedDurationMinutes
            ),
            notes: appointment.notes ?? "",
            responsibleCollaboratorId:
              appointment.responsibleCollaboratorId === null
                ? "none"
                : String(appointment.responsibleCollaboratorId),
          }
        : emptyForm()
    );
  }, [appointment, open]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const scheduledAt = new Date(form.scheduledAt).getTime();
    if (!Number.isFinite(scheduledAt)) {
      toast.error("Informe uma data e hora válidas");
      return;
    }
    const data = {
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      customerEmail: form.customerEmail || null,
      vehiclePlate: form.vehiclePlate,
      vehicleMake: form.vehicleMake || null,
      vehicleModel: form.vehicleModel,
      serviceRequested: form.serviceRequested,
      scheduledAt,
      estimatedDurationMinutes: Number(form.estimatedDurationMinutes),
      notes: form.notes || null,
      responsibleCollaboratorId:
        form.responsibleCollaboratorId === "none"
          ? null
          : Number(form.responsibleCollaboratorId),
    };

    try {
      if (appointment) {
        await updateMutation.mutateAsync({
          id: appointment.id,
          expectedVersion: appointment.version,
          data,
        });
        toast.success("Agendamento atualizado");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("Agendamento criado");
      }
      await utils.appointments.list.invalidate();
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o agendamento"
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-border bg-popover sm:max-w-2xl">
        <form onSubmit={submit} className="space-y-5">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-bold uppercase tracking-wide">
              {appointment ? "Editar agendamento" : "Novo agendamento"}
            </DialogTitle>
            <DialogDescription>
              Registre o atendimento previsto antes da chegada ao pátio.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Data e hora">
              <Input
                type="datetime-local"
                value={form.scheduledAt}
                onChange={event =>
                  setForm(current => ({
                    ...current,
                    scheduledAt: event.target.value,
                  }))
                }
                disabled={Boolean(appointment)}
                required
              />
              {appointment ? (
                <p className="text-xs text-muted-foreground">
                  Use a ação Remarcar para alterar a data e gerar o gatilho do
                  agente.
                </p>
              ) : null}
            </Field>
            <Field label="Duração prevista">
              <Select
                value={form.estimatedDurationMinutes}
                onValueChange={value =>
                  setForm(current => ({
                    ...current,
                    estimatedDurationMinutes: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[30, 60, 90, 120, 180, 240, 480].map(minutes => (
                    <SelectItem key={minutes} value={String(minutes)}>
                      {minutes < 60
                        ? `${minutes} minutos`
                        : `${minutes / 60} hora${minutes > 60 ? "s" : ""}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Cliente">
              <Input
                value={form.customerName}
                onChange={event =>
                  setForm(current => ({
                    ...current,
                    customerName: event.target.value,
                  }))
                }
                required
              />
            </Field>
            <Field label="Telefone">
              <Input
                value={form.customerPhone}
                onChange={event =>
                  setForm(current => ({
                    ...current,
                    customerPhone: event.target.value,
                  }))
                }
                required
              />
            </Field>
            <Field label="E-mail">
              <Input
                type="email"
                value={form.customerEmail}
                onChange={event =>
                  setForm(current => ({
                    ...current,
                    customerEmail: event.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Placa">
              <Input
                value={form.vehiclePlate}
                onChange={event =>
                  setForm(current => ({
                    ...current,
                    vehiclePlate: event.target.value.toUpperCase(),
                  }))
                }
                maxLength={8}
                placeholder="ABC1D23"
                required
              />
            </Field>
            <Field label="Marca">
              <Input
                value={form.vehicleMake}
                onChange={event =>
                  setForm(current => ({
                    ...current,
                    vehicleMake: event.target.value,
                  }))
                }
                placeholder="Volkswagen"
              />
            </Field>
            <Field label="Modelo">
              <Input
                value={form.vehicleModel}
                onChange={event =>
                  setForm(current => ({
                    ...current,
                    vehicleModel: event.target.value,
                  }))
                }
                required
              />
            </Field>
            <div className="grid gap-2 sm:col-span-2">
              <Label>Serviço solicitado</Label>
              <Textarea
                value={form.serviceRequested}
                onChange={event =>
                  setForm(current => ({
                    ...current,
                    serviceRequested: event.target.value,
                  }))
                }
                rows={3}
                required
              />
            </div>
            <Field label="Responsável">
              <Select
                value={form.responsibleCollaboratorId}
                onValueChange={value =>
                  setForm(current => ({
                    ...current,
                    responsibleCollaboratorId: value,
                  }))
                }
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
            </Field>
            <div className="grid gap-2 sm:col-span-2">
              <Label>Observações</Label>
              <Textarea
                value={form.notes}
                onChange={event =>
                  setForm(current => ({
                    ...current,
                    notes: event.target.value,
                  }))
                }
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : null}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
