import type { PatioStage, ServiceOrderStatus, AppointmentStatus, OccurrenceSeverity, OccurrenceStatus, OccurrenceType, CollaboratorPosition } from "../shared/patio";

export interface YardVehicleItem {
  id: number;
  plate: string;
  make: string;
  model: string;
  year?: number | null;
  color?: string | null;
  mileage?: number | null;
  currentStage: PatioStage;
  status: "active" | "delivered" | "cancelled";
  customerName: string;
  customerPhone?: string | null;
  customerEmail?: string | null;
  serviceOrderId?: number | null;
  assignedMechanicId?: number | null;
  assignedMechanicName?: string | null;
  collaboratorId?: number | null;
  collaboratorName?: string | null;
  currentCollaboratorId?: number | null;
  priority: "low" | "normal" | "high" | "urgent";
  entryAt: string | Date | number;
  stageEnteredAt?: string | Date | number | null;
  estimatedDeliveryAt?: string | Date | number | null;
  bayId?: string | null;
  bayName?: string | null;
  totalAmount?: number | null;
  notes?: string | null;
  missingOpenOs?: boolean;
  version?: number;
  occurrencesCount?: number;
}

export interface CollaboratorItem {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  position: CollaboratorPosition | "mechanic" | string;
  active: boolean;
  specialty?: string;
  specialties?: string[];
  maxSimultaneousVehicles?: number;
  currentWorkload?: number;
  completedStages?: number;
  vehiclesHandled?: number;
  createdAt?: string | Date | number;
}

export interface AppointmentItem {
  id: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  vehiclePlate: string;
  vehicleMake?: string | null;
  vehicleModel: string;
  vehicleYear?: number | null;
  status: AppointmentStatus;
  scheduledAt: number;
  estimatedDurationMinutes: number;
  serviceType: string;
  serviceRequested: string;
  notes?: string | null;
  assignedCollaboratorId?: number | null;
  assignedCollaboratorName?: string | null;
  responsibleName?: string | null;
  responsibleCollaboratorId?: number | null;
  yardVehicleId?: number | null;
  serviceOrderId?: number | null;
  version: number;
  createdAt?: string | Date | number;
}

export interface BudgetItem {
  id: string | number;
  kind: "service" | "part" | "fluid" | "external";
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: "pending" | "approved" | "rejected" | "in_progress" | "completed";
  assignedTo?: string | null;
}

export interface ServiceOrderItem {
  id: number;
  code: string;
  displayCode?: string;
  title?: string;
  status: ServiceOrderStatus;
  currentStage: PatioStage;
  yardVehicleId: number;
  vehicleId?: number | null;
  vehiclePlate: string;
  vehicleMake?: string | null;
  vehicleModel: string;
  vehicleYear?: number | null;
  vehicleColor?: string | null;
  mileage?: number | null;
  fuelLevel?: string | null;
  customerName: string;
  customerPhone?: string | null;
  customerEmail?: string | null;
  responsibleId?: number | null;
  responsibleName?: string | null;
  responsiblePosition?: string | null;
  responsibleCollaboratorId?: number | null;
  createdByName?: string;
  serviceType?: string | null;
  serviceDescription?: string | null;
  reportedDefects?: string | null;
  diagnosticNotes?: string | null;
  diagnosis?: string | null;
  items: BudgetItem[];
  totalServices: number;
  totalParts: number;
  totalAmount: number;
  laborAmountCents: number;
  partsAmountCents: number;
  totalAmountCents: number;
  entryAt: string | Date | number;
  estimatedDeliveryAt?: string | Date | number | null;
  expectedCompletionAt?: string | Date | number | null;
  completedAt?: string | Date | number | null;
  comments?: Array<{
    id: string;
    authorName: string;
    text: string;
    createdAt: string | Date | number;
  }>;
  updates?: Array<{
    id: string;
    authorName: string;
    text: string;
    createdAt: string | Date | number;
  }>;
  version?: number;
  createdAt: string | Date | number;
  updatedAt: string | Date | number;
}

export interface OccurrenceItem {
  id: number;
  title: string;
  description: string;
  type: OccurrenceType;
  severity: OccurrenceSeverity;
  status: OccurrenceStatus;
  yardVehicleId?: number | null;
  vehicleId?: number | null;
  vehiclePlate?: string | null;
  vehicleModel?: string | null;
  serviceOrderId?: number | null;
  responsibleId?: number | null;
  responsibleName?: string | null;
  createdAt: string | Date | number;
  resolvedAt?: string | Date | number | null;
}
