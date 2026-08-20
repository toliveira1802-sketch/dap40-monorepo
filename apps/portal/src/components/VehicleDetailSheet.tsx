import React from "react";
import type { YardVehicleItem } from "../lib/routerTypes";
import { PATIO_STAGES, PATIO_STAGE_META, type PatioStage } from "../shared/patio";
import { formatPlate, formatMileage, getDeadlineState } from "../lib/patio";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "./ui/sheet";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { trpc } from "../lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { Car, User, Phone, Mail, Clock, Wrench, FileText, CheckCircle2, ArrowRight } from "lucide-react";

export interface VehicleDetailSheetProps {
  vehicle: YardVehicleItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VehicleDetailSheet({ vehicle, open, onOpenChange }: VehicleDetailSheetProps) {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const moveMutation = trpc.patio.move.useMutation({
    onSuccess: () => {
      toast.success("Etapa do veículo atualizada!");
      utils.patio.list.invalidate();
    },
  });

  const confirmDeliveryMutation = trpc.patio.confirmDelivery.useMutation({
    onSuccess: () => {
      toast.success("Entrega confirmada com sucesso!");
      utils.patio.list.invalidate();
      onOpenChange(false);
    },
  });

  if (!vehicle) return null;

  const stageMeta = PATIO_STAGE_META[vehicle.currentStage];
  const deadlineState = getDeadlineState(vehicle.estimatedDeliveryAt);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-5 overflow-y-auto w-full sm:max-w-lg">
        <SheetHeader>
          <div className="flex items-center justify-between gap-2">
            <Badge variant="outline" className="border-primary/30 text-primary uppercase text-xs">
              {stageMeta?.label || vehicle.currentStage}
            </Badge>
            <span className="font-mono text-sm font-bold text-foreground">
              {formatPlate(vehicle.plate)}
            </span>
          </div>
          <SheetTitle className="text-xl font-bold">
            {vehicle.make ? `${vehicle.make} ` : ""}{vehicle.model}
          </SheetTitle>
          <SheetDescription>
            Registrado no pátio em {new Date(vehicle.entryAt).toLocaleDateString("pt-BR")}
          </SheetDescription>
        </SheetHeader>

        {/* Action: Change Stage */}
        <div className="rounded-xl border border-border/80 bg-card/60 p-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
            Avançar / Alterar Etapa
          </label>
          <div className="flex items-center gap-2">
            <Select
              value={vehicle.currentStage}
              onValueChange={(val: PatioStage) => {
                moveMutation.mutate({ vehicleId: vehicle.id, toStage: val });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PATIO_STAGES.map(st => (
                  <SelectItem key={st} value={st}>
                    {PATIO_STAGE_META[st].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Customer Information */}
        <div className="space-y-3 rounded-xl border border-border/80 bg-card/60 p-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Dados do Cliente
          </h4>
          <div className="flex items-center gap-2 text-sm text-foreground">
            <User className="size-4 text-primary shrink-0" />
            <span className="font-medium">{vehicle.customerName}</span>
          </div>
          {vehicle.customerPhone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="size-4 shrink-0" />
              <span>{vehicle.customerPhone}</span>
            </div>
          )}
          {vehicle.customerEmail && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="size-4 shrink-0" />
              <span>{vehicle.customerEmail}</span>
            </div>
          )}
        </div>

        {/* Technical Data */}
        <div className="space-y-3 rounded-xl border border-border/80 bg-card/60 p-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Informações Técnicas
          </h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-muted-foreground">Ano / Modelo:</span>
              <p className="font-medium text-foreground">{vehicle.year || "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Quilometragem:</span>
              <p className="font-medium text-foreground">{formatMileage(vehicle.mileage)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Mecânico / Responsável:</span>
              <p className="font-medium text-foreground">{vehicle.assignedMechanicName || "Não atribuído"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Baía Atual:</span>
              <p className="font-medium text-foreground">{vehicle.bayName || "No pátio"}</p>
            </div>
          </div>
        </div>

        {/* Observations */}
        {vehicle.notes && (
          <div className="rounded-xl border border-border/80 bg-card/60 p-4 text-xs">
            <h4 className="font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Observações / Sintomas
            </h4>
            <p className="text-foreground/90 whitespace-pre-wrap">{vehicle.notes}</p>
          </div>
        )}

        {/* Actions Footer */}
        <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-border">
          {vehicle.serviceOrderId ? (
            <Button
              className="w-full justify-between"
              onClick={() => {
                onOpenChange(false);
                setLocation(`/ordens-servico/workspace/${vehicle.serviceOrderId}`);
              }}
            >
              <span>Abrir Workspace da OS</span>
              <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button
              className="w-full justify-between"
              onClick={() => {
                onOpenChange(false);
                setLocation(`/ordens-servico/nova?yardVehicleId=${vehicle.id}`);
              }}
            >
              <span>Criar Ordem de Serviço</span>
              <ArrowRight className="size-4" />
            </Button>
          )}

          {vehicle.currentStage === "pronto" && vehicle.status === "active" && (
            <Button
              variant="outline"
              className="w-full border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
              onClick={() => confirmDeliveryMutation.mutate({ vehicleId: vehicle.id })}
            >
              <CheckCircle2 className="size-4 mr-2" />
              Confirmar Entrega ao Cliente
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
