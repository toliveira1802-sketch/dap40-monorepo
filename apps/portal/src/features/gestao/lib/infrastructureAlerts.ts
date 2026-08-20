const DAY_MS = 24 * 60 * 60 * 1000;

export type InfrastructureAlertKind = "scanner_license" | "elevator_maintenance";
export type InfrastructureAlertSeverity = "overdue" | "critical" | "warning" | "ok";

export type InfrastructureDueRecord = {
  id: string;
  title: string;
  summary?: string | null;
  templateKey?: string | null;
  dueAt?: number | null;
  status: string;
};

export type InfrastructureAlert = {
  record: InfrastructureDueRecord;
  kind: InfrastructureAlertKind;
  severity: Exclude<InfrastructureAlertSeverity, "ok">;
  daysRemaining: number;
};

const activeStatuses = new Set(["planned", "open", "in_progress", "waiting"]);

export function getDaysRemaining(dueAt: number, now = Date.now()) {
  return Math.ceil((dueAt - now) / DAY_MS);
}

export function classifyInfrastructureDueDate(
  kind: InfrastructureAlertKind,
  dueAt: number,
  now = Date.now()
): InfrastructureAlertSeverity {
  const days = getDaysRemaining(dueAt, now);
  if (days < 0) return "overdue";
  if (kind === "scanner_license") {
    if (days <= 30) return "critical";
    if (days <= 60) return "warning";
    return "ok";
  }
  if (days <= 15) return "critical";
  if (days <= 30) return "warning";
  return "ok";
}

export function getInfrastructureAlertKind(
  record: InfrastructureDueRecord
): InfrastructureAlertKind | null {
  const searchable = `${record.title} ${record.summary ?? ""}`;
  if (
    record.templateKey === "scanner-license-acquisition" ||
    /licenÃ§a|scanner|odis|autel|vcds|bosch/i.test(searchable)
  ) {
    return "scanner_license";
  }
  if (
    record.templateKey === "elevator-preventive-maintenance" ||
    /elevador|manutenÃ§Ã£o do elevador|manutenÃ§Ã£o preventiva/i.test(searchable)
  ) {
    return "elevator_maintenance";
  }
  return null;
}

export function buildInfrastructureAlerts(
  records: InfrastructureDueRecord[],
  now = Date.now()
): InfrastructureAlert[] {
  const severityOrder: Record<InfrastructureAlert["severity"], number> = {
    overdue: 0,
    critical: 1,
    warning: 2,
  };

  return records
    .flatMap(record => {
      if (!activeStatuses.has(record.status) || !record.dueAt) return [];
      const kind = getInfrastructureAlertKind(record);
      if (!kind) return [];
      const severity = classifyInfrastructureDueDate(kind, record.dueAt, now);
      if (severity === "ok") return [];
      return [{ record, kind, severity, daysRemaining: getDaysRemaining(record.dueAt, now) }];
    })
    .sort((a, b) => {
      const severityDelta = severityOrder[a.severity] - severityOrder[b.severity];
      if (severityDelta !== 0) return severityDelta;
      return (a.record.dueAt ?? 0) - (b.record.dueAt ?? 0);
    });
}
