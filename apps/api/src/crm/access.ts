import type { AccessLevel, AccessSystem, UserRole } from "@dap40/types";

const LEVEL_RANK: Record<AccessLevel, number> = {
  none: 0,
  read: 1,
  write: 2,
  admin: 3,
};

/**
 * Resolve effective CRM (or any system) level from role + grants.
 * MASTER / float Dev → admin. Otherwise grant wins; default none.
 *
 * TODO(casco): when accessGrantStore is wired in apps/api, prefer DB grants.
 */
export function getAccessLevel(
  role: UserRole | string,
  system: AccessSystem,
  grants?: Partial<Record<AccessSystem, AccessLevel>>
): AccessLevel {
  if (role === "MASTER") return "admin";
  // Legacy DEV from pmo-oficina-init access matrix
  if (role === "DEV") return "admin";
  const grant = grants?.[system];
  if (grant !== undefined) return grant;
  return "none";
}

export function canAccess(have: AccessLevel, needed: AccessLevel): boolean {
  return LEVEL_RANK[have] >= LEVEL_RANK[needed];
}

/** Home path helper kept for crm.access.test compatibility. */
export function resolveHomePath(role: UserRole | string): string {
  switch (role) {
    case "MASTER":
    case "DEV":
      return "/aios";
    case "ADMINISTRADOR":
      return "/hub";
    case "CONSULTOR":
      return "/hub";
    case "MECANICO":
      return "/mecanico";
    case "CLIENTE":
      return "/";
    default:
      return "/hub";
  }
}
