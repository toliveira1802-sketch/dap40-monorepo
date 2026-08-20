import type { OccurrenceType, OccurrenceSeverity, OccurrenceStatus } from "../shared/patio";
import { AlertCircle, Clock, FileQuestion, HelpCircle, RefreshCw, UserX } from "lucide-react";

export const OCCURRENCE_ICONS: Record<OccurrenceType, React.ElementType> = {
  part_delay: Clock,
  client_contact: UserX,
  technical_issue: AlertCircle,
  rework: RefreshCw,
  approval_pending: FileQuestion,
  other: HelpCircle,
};

export const OCCURRENCE_SEVERITY_STYLES: Record<OccurrenceSeverity, string> = {
  low: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  medium: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  high: "border-orange-500/30 bg-orange-500/10 text-orange-400",
  critical: "border-rose-500/30 bg-rose-500/10 text-rose-400 animate-pulse",
};

export const OCCURRENCE_STATUS_STYLES: Record<OccurrenceStatus, string> = {
  open: "border-rose-500/30 bg-rose-500/10 text-rose-400",
  in_progress: "border-sky-500/30 bg-sky-500/10 text-sky-400",
  resolved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  dismissed: "border-muted text-muted-foreground",
};

export function formatOccurrenceAge(createdAt: string | number | Date): string {
  const time = typeof createdAt === "number" ? createdAt : new Date(createdAt).getTime();
  const diffMs = Date.now() - time;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return "Há menos de 1h";
  if (diffHours < 24) return `Há ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `Há ${diffDays}d`;
}
