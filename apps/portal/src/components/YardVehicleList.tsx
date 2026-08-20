import React from "react";
import type { YardVehicleItem, CollaboratorItem } from "../lib/routerTypes";
import { PATIO_STAGE_META } from "../shared/patio";
import { formatPlate, formatMileage, getDeadlineState } from "../lib/patio";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ArrowRight, Eye, Clock, User } from "lucide-react";
import { cn } from "../lib/utils";

export interface YardVehicleListProps {
  vehicles: YardVehicleItem[];
  collaborators?: CollaboratorItem[];
  onOpenVehicle: (id: number | any) => void;
}

export function YardVehicleList({ vehicles, onOpenVehicle }: YardVehicleListProps) {
  return (
    <div className="rounded-xl border border-border/80 bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Veículo / Placa</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Etapa Atual</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Prazo de Entrega</TableHead>
            <TableHead>Valor Estimado</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                Nenhum veículo no pátio neste filtro.
              </TableCell>
            </TableRow>
          ) : (
            vehicles.map(vehicle => {
              const deadlineState = getDeadlineState(vehicle.estimatedDeliveryAt);
              const stageMeta = PATIO_STAGE_META[vehicle.currentStage];

              return (
                <TableRow key={vehicle.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onOpenVehicle(vehicle.id)}>
                  <TableCell>
                    <div className="font-mono text-sm font-bold tracking-wider text-foreground">
                      {formatPlate(vehicle.plate)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {vehicle.make ? `${vehicle.make} ` : ""}{vehicle.model} · {vehicle.year}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="text-sm font-medium text-foreground">{vehicle.customerName}</div>
                    <div className="text-xs text-muted-foreground">{vehicle.customerPhone || "—"}</div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className="border-primary/25 bg-primary/5 text-primary">
                      {stageMeta?.label || vehicle.currentStage}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs text-foreground">
                      <User className="size-3.5 text-muted-foreground" />
                      <span>{vehicle.assignedMechanicName || vehicle.collaboratorName || "Não atribuído"}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    {vehicle.estimatedDeliveryAt ? (
                      <div
                        className={cn(
                          "text-xs font-mono font-medium",
                          deadlineState === "overdue" && "text-rose-400 font-bold",
                          deadlineState === "dueSoon" && "text-amber-400 font-bold",
                          deadlineState === "onTrack" && "text-muted-foreground"
                        )}
                      >
                        {new Date(vehicle.estimatedDeliveryAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  <TableCell>
                    <span className="font-mono text-sm font-semibold text-foreground">
                      {vehicle.totalAmount
                        ? vehicle.totalAmount.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })
                        : "R$ 0,00"}
                    </span>
                  </TableCell>

                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); onOpenVehicle(vehicle.id); }}>
                      <Eye className="size-4" />
                      <span className="sr-only">Ver detalhes</span>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
