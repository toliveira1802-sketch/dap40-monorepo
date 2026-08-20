import type { YardVehicleItem } from "../lib/routerTypes";

export type WorkshopMapColumn = "left" | "top" | "center" | "right" | "bottom-left";

export interface WorkshopResourceRow {
  id: number;
  name: string;
  type: string;
  status: string;
  isServicePost: boolean;
  mapColumn: WorkshopMapColumn;
  mapOrder: number;
  currentYardVehicleId?: number | null;
  assignedCollaboratorId?: number | null;
  assignedCollaboratorName?: string | null;
  allocatedVehicle?: YardVehicleItem | null;
}

export interface WorkshopBay {
  id: string;
  code: string;
  name: string;
  type: "elevator" | "pit" | "bench" | "wash" | "alignment" | "parking";
  status: "available" | "occupied" | "maintenance";
  currentVehicleId?: number | string | null;
  allocatedVehicle?: YardVehicleItem | null;
  assignedMechanicId?: number | string | null;
  assignedMechanicName?: string | null;
}
