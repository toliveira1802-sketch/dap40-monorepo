import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildInfrastructureAlerts,
  type InfrastructureAlert,
  type InfrastructureDueRecord,
} from "@/features/gestao/lib/infrastructureAlerts";
import { AlertTriangle, CalendarClock, Check, ScanLine, Wrench } from "lucide-react";

const severityLabels: Record<InfrastructureAlert["severity"], string> = {
  overdue: "Vencido",
  critical: "CrÃ­tico",
  warning: "PrÃ³ximo",
};

function deadlineLabel(alert: InfrastructureAlert) {
  if (alert.daysRemaining < 0) return `${Math.abs(alert.daysRemaining)}d em atraso`;
  if (alert.daysRemaining === 0) return "Vence hoje";
  return `Vence em ${alert.daysRemaining}d`;
}

function AlertItem({
  alert,
  onComplete,
}: {
  alert: InfrastructureAlert;
  onComplete: (id: string) => void;
}) {
  const urgent = alert.severity === "overdue" || alert.severity === "critical";
  const Icon = alert.kind === "scanner_license" ? ScanLine : Wrench;
  return (
    <div
      className={`rounded-lg border p-3 ${
        urgent
          ? "border-primary/45 bg-primary/[0.07]"
          : "border-amber-500/35 bg-amber-500/[0.06]"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${urgent ? "border-primary/25 bg-primary/10 text-primary" : "border-amber-500/25 bg-amber-500/10 text-amber-500"}`}>
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={urgent ? "bg-primary/15 text-primary hover:bg-primary/15" : "bg-amber-500/15 text-amber-600 hover:bg-amber-500/15 dark:text-amber-300"}>
              {severityLabels[alert.severity]}
            </Badge>
            <span className="text-[10px] font-condensed uppercase tracking-wider text-muted-foreground">
              {alert.kind === "scanner_license" ? "LicenÃ§a" : "Elevador"}
            </span>
          </div>
          <p className="mt-2 font-condensed text-sm font-semibold text-foreground">{alert.record.title}</p>
          <p className={`mt-1 text-xs font-medium ${urgent ? "text-primary" : "text-amber-600 dark:text-amber-300"}`}>
            {deadlineLabel(alert)} Â· {new Date(alert.record.dueAt!).toLocaleDateString("pt-BR")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onComplete(alert.record.id)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background/40 text-muted-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={`Concluir ${alert.record.title}`}
        >
          <Check className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function AlertColumn({
  title,
  description,
  alerts,
  icon: Icon,
  emptyText,
  onRegister,
  registerLabel,
  onComplete,
}: {
  title: string;
  description: string;
  alerts: InfrastructureAlert[];
  icon: typeof ScanLine;
  emptyText: string;
  onRegister: () => void;
  registerLabel: string;
  onComplete: (id: string) => void;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/30 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/[0.06] text-primary">
            <Icon className="h-4 w-4" />
          </span>
          <div>
            <h3 className="font-condensed text-base font-bold text-foreground">{title}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <Badge variant="outline" className={alerts.length > 0 ? "border-primary/35 text-primary" : "border-border text-muted-foreground"}>
          {alerts.length}
        </Badge>
      </div>

      <div className="mt-4 space-y-2">
        {alerts.length > 0 ? (
          alerts.map(alert => <AlertItem key={alert.record.id} alert={alert} onComplete={onComplete} />)
        ) : (
          <div className="flex min-h-24 items-center justify-center rounded-lg border border-dashed border-border/70 px-4 text-center text-xs text-muted-foreground">
            {emptyText}
          </div>
        )}
      </div>

      <Button variant="outline" size="sm" className="mt-3 w-full gap-2" onClick={onRegister}>
        <CalendarClock className="h-4 w-4" />
        {registerLabel}
      </Button>
    </div>
  );
}

export function InfrastructureAlertsPanel({
  records,
  onRegister,
  onComplete,
}: {
  records: InfrastructureDueRecord[];
  onRegister: (templateKey: string) => void;
  onComplete: (id: string) => void;
}) {
  const alerts = buildInfrastructureAlerts(records);
  const licenses = alerts.filter(alert => alert.kind === "scanner_license");
  const elevators = alerts.filter(alert => alert.kind === "elevator_maintenance");
  const critical = alerts.filter(alert => alert.severity === "overdue" || alert.severity === "critical").length;
  const upcoming = alerts.filter(alert => alert.severity === "warning").length;

  return (
    <Card className={critical > 0 ? "border-primary/35 bg-primary/[0.025]" : "border-border/60 bg-card/80"}>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 font-condensed text-lg">
              <AlertTriangle className={critical > 0 ? "h-5 w-5 text-primary" : "h-5 w-5 text-muted-foreground"} />
              Alertas de Infraestrutura
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              LicenÃ§as em atÃ© 60 dias e manutenÃ§Ãµes de elevadores em atÃ© 30 dias.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className={critical > 0 ? "bg-primary/15 text-primary hover:bg-primary/15" : "bg-muted text-muted-foreground hover:bg-muted"}>
              {critical} crÃ­tico{critical === 1 ? "" : "s"}
            </Badge>
            <Badge variant="outline" className={upcoming > 0 ? "border-amber-500/35 text-amber-600 dark:text-amber-300" : "border-border text-muted-foreground"}>
              {upcoming} prÃ³ximo{upcoming === 1 ? "" : "s"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-2">
        <AlertColumn
          title="LicenÃ§as de scanners"
          description="Vencidas, crÃ­ticas atÃ© 30d e prÃ³ximas atÃ© 60d."
          alerts={licenses}
          icon={ScanLine}
          emptyText="Nenhuma licenÃ§a prÃ³xima do vencimento."
          registerLabel="Registrar licenÃ§a"
          onRegister={() => onRegister("scanner-license-acquisition")}
          onComplete={onComplete}
        />
        <AlertColumn
          title="ManutenÃ§Ã£o de elevadores"
          description="Vencidas, crÃ­ticas atÃ© 15d e prÃ³ximas atÃ© 30d."
          alerts={elevators}
          icon={Wrench}
          emptyText="Nenhuma manutenÃ§Ã£o prÃ³xima do vencimento."
          registerLabel="Agendar manutenÃ§Ã£o"
          onRegister={() => onRegister("elevator-preventive-maintenance")}
          onComplete={onComplete}
        />
      </CardContent>
    </Card>
  );
}
