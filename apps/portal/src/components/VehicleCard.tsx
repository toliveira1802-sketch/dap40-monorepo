import React from "react";
import type { YardVehicleItem } from "../lib/routerTypes";
import { formatPlate, getDeadlineState } from "../lib/patio";
import { Badge } from "./ui/badge";
import { useDraggable } from "@dnd-kit/core";
import { Clock, User, AlertTriangle, Wrench, ShieldAlert } from "lucide-react";
import { cn } from "../lib/utils";

export interface VehicleCardProps {
  vehicle: YardVehicleItem;
  overlay?: boolean;
  onOpen?: () => void;
}

export function VehicleCard({ vehicle, overlay = false, onOpen }: VehicleCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: vehicle.id,
    disabled: overlay,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const deadlineState = getDeadlineState(vehicle.estimatedDeliveryAt);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={e => {
        if (!isDragging && onOpen) {
          onOpen();
        }
      }}
      className={cn(
        "group relative flex flex-col gap-2.5 rounded-xl border border-border/80 bg-card p-3.5 shadow-sm transition-all hover:border-primary/50 hover:shadow-md cursor-grab active:cursor-grabbing",
        isDragging && "opacity-40 scale-95 border-dashed border-primary",
        overlay && "shadow-2xl ring-2 ring-primary border-primary bg-card/95 backdrop-blur cursor-grabbing rotate-1 scale-105",
        deadlineState === "overdue" && "border-rose-500/40 bg-rose-950/5",
        deadlineState === "dueSoon" && "border-amber-500/40 bg-amber-950/5"
      )}
    >
      {/* Header: Plate & Priority */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="font-mono text-sm font-bold tracking-wider text-foreground">
            {formatPlate(vehicle.plate)}
          </span>
          <p className="mt-0.5 text-xs text-muted-foreground truncate max-w-[140px]">
            {vehicle.make ? `${vehicle.make} ` : ""}{vehicle.model}
          </p>
        </div>

        <div className="flex items-center gap-1">
          {vehicle.priority === "urgent" && (
            <Badge variant="destructive" className="px-1.5 py-0 text-[0.6rem] uppercase">
              Urgente
            </Badge>
          )}
          {vehicle.priority === "high" && (
            <Badge variant="outline" className="border-amber-500/40 text-amber-400 px-1.5 py-0 text-[0.6rem] uppercase">
              Alta
            </Badge>
          )}
          {vehicle.occurrencesCount && vehicle.occurrencesCount > 0 ? (
            <div className="flex size-5 items-center justify-center rounded-full bg-rose-500/20 text-rose-400 text-[0.65rem] font-bold">
              !
            </div>
          ) : null}
        </div>
      </div>

      {/* Customer & Mechanic */}
      <div className="flex flex-col gap-1 text-xs text-muted-foreground border-t border-border/50 pt-2">
        <div className="flex items-center gap-1.5 truncate">
          <User className="size-3 shrink-0 text-muted-foreground/70" />
          <span className="truncate">{vehicle.customerName}</span>
        </div>

        {vehicle.assignedMechanicName && (
          <div className="flex items-center gap-1.5 truncate text-foreground/80">
            <Wrench className="size-3 shrink-0 text-primary" />
            <span className="truncate">{vehicle.assignedMechanicName}</span>
          </div>
        )}
      </div>

      {/* Footer: Bay & Deadline */}
      <div className="flex items-center justify-between gap-1 pt-1 text-[0.68rem]">
        {vehicle.bayName ? (
          <span className="rounded bg-muted/80 px-1.5 py-0.5 font-medium text-foreground truncate max-w-[110px]">
            {vehicle.bayName}
          </span>
        ) : (
          <span className="text-muted-foreground italic">No pátio</span>
        )}

        {vehicle.estimatedDeliveryAt && (
          <span
            className={cn(
              "font-mono font-medium",
              deadlineState === "overdue" && "text-rose-400 font-bold",
              deadlineState === "dueSoon" && "text-amber-400 font-bold",
              deadlineState === "onTrack" && "text-muted-foreground"
            )}
          >
            {new Date(vehicle.estimatedDeliveryAt).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>
    </div>
  );
}
