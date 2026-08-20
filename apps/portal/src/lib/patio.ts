import type { CollaboratorPosition } from "../shared/patio";

export function formatPlate(plate?: string | null): string {
  if (!plate) return "—";
  const clean = plate.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (clean.length === 7) {
    return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  }
  return clean;
}

export function formatMileage(km?: number | string | null): string {
  if (km === undefined || km === null || km === "") return "— km";
  const num = typeof km === "number" ? km : parseInt(String(km), 10);
  if (isNaN(num)) return "— km";
  return `${num.toLocaleString("pt-BR")} km`;
}

export function formatDuration(msOrDuration?: number | string | Date | null): string {
  if (!msOrDuration) return "—";
  let ms: number;
  if (typeof msOrDuration === "number") {
    ms = msOrDuration;
  } else if (msOrDuration instanceof Date) {
    ms = Date.now() - msOrDuration.getTime();
  } else {
    ms = Date.now() - new Date(msOrDuration).getTime();
  }

  if (isNaN(ms) || ms < 0) return "—";

  const totalMinutes = Math.floor(ms / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}min`;
}

export function getDeadlineState(
  deliveryDate?: string | number | Date | null
): "onTrack" | "dueSoon" | "overdue" | "none" {
  if (!deliveryDate) return "none";
  const deadline = typeof deliveryDate === "number" ? deliveryDate : new Date(deliveryDate).getTime();
  const now = Date.now();
  const diffHours = (deadline - now) / (1000 * 60 * 60);

  if (diffHours < 0) return "overdue";
  if (diffHours <= 4) return "dueSoon";
  return "onTrack";
}

export const POSITION_LABELS: Record<CollaboratorPosition, string> = {
  consultor: "Consultor Técnico",
  tecnico: "Técnico Mecânico",
  mecanico_chefe: "Mecânico Chefe",
  eletricista: "Eletricista Automotivo",
  funileiro: "Funileiro",
  pintor: "Pintor Automotivo",
  qualidade: "Inspetor de Qualidade",
  lavador: "Estética & Lavador",
  mechanic: "Mecânico",
};

export const PRIORITY_LABELS = {
  low: "Baixa",
  normal: "Normal",
  high: "Alta",
  urgent: "Urgente",
} as const;
