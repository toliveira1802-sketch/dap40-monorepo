import type { YardVehicleItem } from "./routerTypes";
import type { WizardStep } from "../shared/serviceOrderWizard";

export function parseYardVehicleIdParam(searchString?: string): number | null {
  if (!searchString) return null;
  const params = new URLSearchParams(searchString);
  const val = params.get("yardVehicleId");
  return val ? parseInt(val, 10) : null;
}

export type PrefillResult =
  | { kind: "already_open"; orderId: number }
  | { kind: "inactive" }
  | {
      kind: "prefilled";
      client: { id: number; name: string; phone: string | null; email: string | null; documentHint: string | null };
      vehicle: {
        id?: number;
        registeredVehicleId?: number;
        plate: string;
        make: string;
        model: string;
        year: number;
        mileage: number;
        lastServiceMileage?: number | null;
        lastServiceAt?: number | null;
      };
      complaint?: string;
      step: WizardStep;
    };

export function prefillWizardFromYardVehicle(yardVehicle?: YardVehicleItem | null): PrefillResult {
  if (!yardVehicle) {
    return {
      kind: "prefilled",
      client: { id: 1, name: "", phone: null, email: null, documentHint: null },
      vehicle: { id: 1, registeredVehicleId: 1, plate: "", make: "", model: "", year: 2023, mileage: 0, lastServiceMileage: null, lastServiceAt: null },
      step: "cliente",
    };
  }

  if (yardVehicle.status === "delivered" || yardVehicle.status === "cancelled") {
    return { kind: "inactive" };
  }

  if (yardVehicle.serviceOrderId) {
    return { kind: "already_open", orderId: Number(yardVehicle.serviceOrderId) };
  }

  return {
    kind: "prefilled",
    step: "servico",
    client: {
      id: 1,
      name: yardVehicle.customerName,
      phone: yardVehicle.customerPhone || null,
      email: yardVehicle.customerEmail || null,
      documentHint: null,
    },
    vehicle: {
      id: yardVehicle.id,
      registeredVehicleId: yardVehicle.id,
      plate: yardVehicle.plate,
      make: yardVehicle.make || "",
      model: yardVehicle.model,
      year: yardVehicle.year || 2023,
      mileage: yardVehicle.mileage || 0,
      lastServiceMileage: null,
      lastServiceAt: null,
    },
    complaint: yardVehicle.notes || "",
  };
}
