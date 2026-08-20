import type { PatioStage } from "./patio";

export type QueueUrgencyTone = "ok" | "warning" | "critical";

export function getQueueUrgency(vehicle: {
  currentStage?: PatioStage;
  stageEnteredAt?: string | number | Date | null;
  estimatedDeliveryAt?: string | number | Date | null;
}): QueueUrgencyTone {
  if (!vehicle.estimatedDeliveryAt) {
    return "ok";
  }
  const now = Date.now();
  const deliveryTime = typeof vehicle.estimatedDeliveryAt === "number" ? vehicle.estimatedDeliveryAt : new Date(vehicle.estimatedDeliveryAt).getTime();
  const diffHours = (deliveryTime - now) / (1000 * 60 * 60);

  if (diffHours < 0) return "critical";
  if (diffHours <= 4) return "critical";
  if (diffHours <= 24) return "warning";
  return "ok";
}

export function compareQueueUrgency(
  a: { currentStage?: PatioStage; stageEnteredAt?: any; estimatedDeliveryAt?: any },
  b: { currentStage?: PatioStage; stageEnteredAt?: any; estimatedDeliveryAt?: any }
): number {
  const urgencyWeight: Record<QueueUrgencyTone, number> = {
    critical: 3,
    warning: 2,
    ok: 1,
  };
  const toneA = getQueueUrgency(a);
  const toneB = getQueueUrgency(b);
  return urgencyWeight[toneB] - urgencyWeight[toneA];
}
