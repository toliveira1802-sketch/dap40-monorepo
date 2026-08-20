import type { AccessLevel, AccessSystem } from "@dap40/types";
import { ACCESS_SYSTEM_LABELS } from "@dap40/types";

/** Portais gerenciáveis nesta tela (cliente fora; AIOS = PORTAL-EMPRESA). */
export const MANAGED_SYSTEMS = [
  "ERP",
  "CRM",
  "PORTAL-GESTAO",
  "PORTAL-MECANICO",
  "PORTAL-EMPRESA",
] as const satisfies readonly AccessSystem[];

export type ManagedSystem = (typeof MANAGED_SYSTEMS)[number];

export const ACCESS_LEVELS: AccessLevel[] = ["none", "read", "write", "admin"];

export const ACCESS_LEVEL_LABELS: Record<AccessLevel, string> = {
  none: "Bloqueado",
  read: "Leitura",
  write: "Alterar",
  admin: "Admin",
};

export function systemLabel(system: AccessSystem): string {
  return ACCESS_SYSTEM_LABELS[system] ?? system;
}

export const PAGE_GESTAO_ACESSOS = "gestao.acessos";
export const SYSTEM_GESTAO: AccessSystem = "PORTAL-GESTAO";
