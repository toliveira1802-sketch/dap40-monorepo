import React from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "./ui/sheet";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { store } from "../lib/trpc";
import { OCCURRENCE_SEVERITY_STYLES, OCCURRENCE_STATUS_STYLES, OCCURRENCE_ICONS } from "../lib/occurrences";
import { OCCURRENCE_SEVERITY_META, OCCURRENCE_STATUS_META, OCCURRENCE_TYPE_META } from "../shared/patio";
import { formatPlate } from "../lib/patio";
import { toast } from "sonner";
import { CheckCircle2, User, Car } from "lucide-react";

export interface OccurrenceDetailSheetProps {
  occurrenceId: number | string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OccurrenceDetailSheet({ occurrenceId, open, onOpenChange }: OccurrenceDetailSheetProps) {
  if (!occurrenceId) return null;

  const occurrence = store.occurrences.find(o => String(o.id) === String(occurrenceId));
  if (!occurrence) return null;

  const Icon = OCCURRENCE_ICONS[occurrence.type];

  const handleResolve = () => {
    occurrence.status = "resolved";
    occurrence.resolvedAt = new Date();
    store.notify();
    toast.success("Ocorrência marcada como resolvida!");
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-5 overflow-y-auto w-full sm:max-w-lg">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={OCCURRENCE_SEVERITY_STYLES[occurrence.severity]}>
              {OCCURRENCE_SEVERITY_META[occurrence.severity].label}
            </Badge>
            <Badge variant="outline" className={OCCURRENCE_STATUS_STYLES[occurrence.status]}>
              {OCCURRENCE_STATUS_META[occurrence.status].label}
            </Badge>
          </div>
          <SheetTitle className="text-xl font-bold mt-2">{occurrence.title}</SheetTitle>
          <SheetDescription>
            Tipo: {OCCURRENCE_TYPE_META[occurrence.type].label} · Registrado em {new Date(occurrence.createdAt).toLocaleDateString("pt-BR")}
          </SheetDescription>
        </SheetHeader>

        <div className="rounded-xl border border-border/80 bg-card/60 p-4 text-sm">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Descrição do Problema / Alerta
          </h4>
          <p className="text-foreground whitespace-pre-wrap">{occurrence.description}</p>
        </div>

        {occurrence.vehiclePlate && (
          <div className="rounded-xl border border-border/80 bg-card/60 p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Veículo Vinculado
            </h4>
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Car className="size-5 text-primary" />
              </div>
              <div>
                <p className="font-mono text-sm font-bold text-foreground">
                  {formatPlate(occurrence.vehiclePlate)}
                </p>
                <p className="text-xs text-muted-foreground">{occurrence.vehicleModel || "Veículo"}</p>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-border/80 bg-card/60 p-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Responsável Atribuído
          </h4>
          <div className="flex items-center gap-2 text-sm text-foreground">
            <User className="size-4 text-muted-foreground" />
            <span>{occurrence.responsibleName || "Não atribuído"}</span>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-border">
          {occurrence.status !== "resolved" && (
            <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white" onClick={handleResolve}>
              <CheckCircle2 className="size-4 mr-2" />
              Marcar como Resolvida
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
