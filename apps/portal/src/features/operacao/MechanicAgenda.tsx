import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { PatioMapSectionNav } from "@/components/PatioMapSectionNav";
import { Badge } from "@/components/ui/badge";
import { formatMileage, formatPlate } from "@/lib/patio";
import type {
  AppointmentItem,
  CollaboratorItem,
  YardVehicleItem,
} from "@/lib/routerTypes";
import { trpc } from "@/lib/trpc";
import { APPOINTMENT_STATUS_META, PATIO_STAGE_META } from "@shared/patio";
import {
  CalendarClock,
  CarFront,
  Clock3,
  RefreshCw,
  UserRound,
  UsersRound,
  Wrench,
} from "lucide-react";

function todayRange() {
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setDate(to.getDate() + 1);
  return { from: from.getTime(), to: to.getTime() - 1 };
}

function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
}

export default function MechanicAgendaPage() {
  const range = todayRange();
  const appointmentsQuery = trpc.appointments.list.useQuery({
    from: range.from,
    to: range.to,
  });
  const collaboratorsQuery = trpc.collaborators.list.useQuery({
    includeInactive: false,
  });
  const vehiclesQuery = trpc.patio.list.useQuery(
    { status: "active" },
    { refetchInterval: 10_000 }
  );

  const appointments = appointmentsQuery.data ?? [];
  const collaborators = collaboratorsQuery.data ?? [];
  const vehicles = vehiclesQuery.data ?? [];
  const mechanics = collaborators.filter(item => item.position === "mechanic");
  const loading =
    appointmentsQuery.isLoading ||
    collaboratorsQuery.isLoading ||
    vehiclesQuery.isLoading;
  const failed =
    appointmentsQuery.isError ||
    collaboratorsQuery.isError ||
    vehiclesQuery.isError;

  const assignedAppointmentIds = new Set(
    mechanics.flatMap(mechanic =>
      appointments
        .filter(item => item.responsibleCollaboratorId === mechanic.id)
        .map(item => item.id)
    )
  );
  const unassignedAppointments = appointments.filter(
    item => !assignedAppointmentIds.has(item.id)
  );

  async function refresh() {
    await Promise.all([
      appointmentsQuery.refetch(),
      collaboratorsQuery.refetch(),
      vehiclesQuery.refetch(),
    ]);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Mapa do pátio"
        title="Agenda dos mecânicos"
        description="Visão diária da programação, veículos em execução e carga distribuída por mecânico."
        actions={
          <button
            type="button"
            onClick={() => void refresh()}
            className="flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <RefreshCw className="size-4" /> Atualizar
          </button>
        }
      />

      <PatioMapSectionNav />

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric
          label="Mecânicos ativos"
          value={mechanics.length}
          icon={UsersRound}
        />
        <Metric
          label="Agendamentos hoje"
          value={appointments.length}
          icon={CalendarClock}
        />
        <Metric
          label="Veículos em execução"
          value={vehicles.filter(item => item.currentStage === "execucao").length}
          icon={Wrench}
        />
      </div>

      {failed ? (
        <EmptyState
          icon={RefreshCw}
          title="Não foi possível carregar a agenda"
          description="Atualize a página para consultar novamente os dados operacionais."
        />
      ) : loading ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-72 animate-pulse rounded-2xl bg-card"
            />
          ))}
        </div>
      ) : mechanics.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title="Nenhum mecânico cadastrado"
          description="Cadastre profissionais com a função Mecânico para montar a agenda diária."
        />
      ) : (
        <>
          <div className="grid gap-4 xl:grid-cols-2">
            {mechanics.map(mechanic => (
              <MechanicSchedule
                key={mechanic.id}
                mechanic={mechanic}
                appointments={appointments.filter(
                  item => item.responsibleCollaboratorId === mechanic.id
                )}
                vehicles={vehicles.filter(
                  item => item.currentCollaboratorId === mechanic.id
                )}
              />
            ))}
          </div>

          {unassignedAppointments.length ? (
            <section className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.04] p-5">
              <div className="flex items-center gap-2">
                <UserRound className="size-4 text-amber-300" />
                <h2 className="font-semibold text-amber-200">
                  Aguardando definição de mecânico
                </h2>
                <Badge
                  variant="outline"
                  className="border-amber-500/25 text-amber-200"
                >
                  {unassignedAppointments.length}
                </Badge>
              </div>
              <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {unassignedAppointments.map(appointment => (
                  <AppointmentRow
                    key={appointment.id}
                    appointment={appointment}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}

function MechanicSchedule({
  mechanic,
  appointments,
  vehicles,
}: {
  mechanic: CollaboratorItem;
  appointments: AppointmentItem[];
  vehicles: YardVehicleItem[];
}) {
  const orderedAppointments = [...appointments].sort(
    (left, right) => left.scheduledAt - right.scheduledAt
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card/70 shadow-panel">
      <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
            <Wrench className="size-5" />
          </div>
          <div>
            <h2 className="font-semibold">{mechanic.name}</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {mechanic.specialty || "Mecânica geral"}
            </p>
          </div>
        </div>
        <Badge variant="outline">
          {orderedAppointments.length + vehicles.length} atividades
        </Badge>
      </header>

      <div className="grid gap-5 p-5 lg:grid-cols-2">
        <div>
          <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Horários de hoje
          </p>
          <div className="space-y-2">
            {orderedAppointments.length ? (
              orderedAppointments.map(appointment => (
                <AppointmentRow
                  key={appointment.id}
                  appointment={appointment}
                />
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-border p-4 text-xs text-muted-foreground">
                Nenhum horário atribuído.
              </p>
            )}
          </div>
        </div>

        <div>
          <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Veículos sob responsabilidade
          </p>
          <div className="space-y-2">
            {vehicles.length ? (
              vehicles.map(vehicle => (
                <div
                  key={vehicle.id}
                  className="rounded-xl border border-border bg-background/35 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-sm font-semibold">
                        {formatPlate(vehicle.plate)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {vehicle.model} · {formatMileage(vehicle.mileage)}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[0.6rem]">
                      {PATIO_STAGE_META[vehicle.currentStage].label}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-border p-4 text-xs text-muted-foreground">
                Nenhum veículo atribuído.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function AppointmentRow({ appointment }: { appointment: AppointmentItem }) {
  return (
    <div className="rounded-xl border border-border bg-background/35 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-2.5">
          <div className="flex h-8 shrink-0 items-center gap-1 rounded-lg bg-primary/10 px-2 font-mono text-xs font-semibold text-primary">
            <Clock3 className="size-3" />
            {formatTime(appointment.scheduledAt)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {appointment.customerName}
            </p>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {formatPlate(appointment.vehiclePlate)} ·{" "}
              {appointment.vehicleModel}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="shrink-0 text-[0.58rem]">
          {APPOINTMENT_STATUS_META[appointment.status].label}
        </Badge>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof CarFront;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card/70 p-4">
      <div className="grid size-10 place-items-center rounded-xl bg-primary/8 text-primary">
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-[0.62rem] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 font-display text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}
