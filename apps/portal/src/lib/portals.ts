import type { AccessLevel, AccessSystem, UserRole } from "@dap40/types";
import { ACCESS_SYSTEM_LABELS } from "@dap40/types";

/** Portais da oficina no casco (cliente fica em apps/client). */
export const OFFICE_PORTALS: Array<{
  id: AccessSystem;
  label: string;
  path: string;
  description: string;
}> = [
  {
    id: "ERP",
    label: ACCESS_SYSTEM_LABELS.ERP,
    path: "/dashboard",
    description: "Pátio, OS, agenda e equipe",
  },
  {
    id: "CRM",
    label: ACCESS_SYSTEM_LABELS.CRM,
    path: "/comercial",
    description: "Leads, pipeline e inbox",
  },
  {
    id: "PORTAL-GESTAO",
    label: ACCESS_SYSTEM_LABELS["PORTAL-GESTAO"],
    path: "/gestao",
    description: "Acessos, BI e áreas",
  },
  {
    id: "PORTAL-MECANICO",
    label: ACCESS_SYSTEM_LABELS["PORTAL-MECANICO"],
    path: "/mecanico",
    description: "PWA do mecânico",
  },
  {
    id: "PORTAL-EMPRESA",
    label: ACCESS_SYSTEM_LABELS["PORTAL-EMPRESA"],
    path: "/aios",
    description: "AIOS / agentes e features",
  },
];

export type SessionSystems = Partial<Record<AccessSystem, AccessLevel>>;

export function hasPortalAccess(
  systems: SessionSystems | null | undefined,
  portalId: AccessSystem,
  role?: UserRole | null
): boolean {
  if (role === "MASTER") return true;
  const level = systems?.[portalId];
  return Boolean(level && level !== "none");
}

export function listUnlockedPortals(
  systems: SessionSystems | null | undefined,
  role?: UserRole | null
) {
  return OFFICE_PORTALS.filter(p => hasPortalAccess(systems, p.id, role));
}
