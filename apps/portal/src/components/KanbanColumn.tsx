import React from "react";
import type { PatioStage } from "../shared/patio";
import { PATIO_STAGE_META } from "../shared/patio";
import type { YardVehicleItem } from "../lib/routerTypes";
import { VehicleCard } from "./VehicleCard";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "../lib/utils";

export interface KanbanColumnProps {
  stage: PatioStage;
  vehicles: YardVehicleItem[];
  onOpenVehicle: (id: number | any) => void;
}

export function KanbanColumn({ stage, vehicles, onOpenVehicle }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
  });

  const meta = PATIO_STAGE_META[stage];

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex h-full min-w-[260px] max-w-[300px] flex-1 flex-col rounded-2xl border border-border/70 bg-card/40 p-3 transition-colors",
        isOver && "border-primary bg-primary/5 ring-2 ring-primary/20"
      )}
    >
      {/* Column Header */}
      <div className="mb-3 flex items-center justify-between pb-2 border-b border-border/60">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-primary" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
            {meta?.label || stage}
          </h4>
        </div>
        <span className="flex size-5 items-center justify-center rounded-full bg-muted text-[0.7rem] font-bold text-foreground">
          {vehicles.length}
        </span>
      </div>

      {/* Cards List */}
      <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto pr-1">
        {vehicles.length === 0 ? (
          <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-border/40 text-center">
            <span className="text-xs text-muted-foreground/60 italic">Nenhum veículo</span>
          </div>
        ) : (
          vehicles.map(vehicle => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onOpen={() => onOpenVehicle(vehicle.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
