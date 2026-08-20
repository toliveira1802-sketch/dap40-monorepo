import React from "react";
import { Badge } from "./ui/badge";
import { getDeadlineState } from "../lib/patio";
import { Clock } from "lucide-react";
import { cn } from "../lib/utils";

export interface DeadlineBadgeProps {
  estimatedDeliveryAt?: string | number | Date | null;
  className?: string;
}

export function DeadlineBadge({ estimatedDeliveryAt, className }: DeadlineBadgeProps) {
  const state = getDeadlineState(estimatedDeliveryAt);

  if (!estimatedDeliveryAt || state === "none") {
    return (
      <Badge variant="outline" className={cn("text-[0.65rem] text-muted-foreground", className)}>
        Sem prazo definido
      </Badge>
    );
  }

  const date = new Date(estimatedDeliveryAt);
  const formatted = date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const styles = {
    overdue: "border-rose-500/30 bg-rose-500/10 text-rose-400 font-semibold",
    dueSoon: "border-amber-500/30 bg-amber-500/10 text-amber-400 font-semibold",
    onTrack: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    none: "text-muted-foreground",
  }[state];

  const prefix = {
    overdue: "Atrasado",
    dueSoon: "Entrega Próxima",
    onTrack: "Prazo",
    none: "Prazo",
  }[state];

  return (
    <Badge variant="outline" className={cn("flex items-center gap-1 text-[0.68rem] tracking-wide font-mono", styles, className)}>
      <Clock className="size-3 shrink-0" />
      <span>
        {prefix}: {formatted}
      </span>
    </Badge>
  );
}
