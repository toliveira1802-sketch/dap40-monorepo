import type { AccessSystem, UserRole } from "@dap40/types";
import { routes as authRoutes } from "../features/shared/auth/routes";
import { routes as operacaoRoutes } from "../features/operacao/routes";
import { routes as empresaAdminRoutes } from "../features/empresa/admin/routes";
import type { PortalRoute } from "./portalRoutes";
import { OFFICE_PORTALS, hasPortalAccess, type SessionSystems } from "./portals";

/** Features registradas no casco (prompts 1–3). */
export const featureRoutes: PortalRoute[] = [
  ...authRoutes,
  ...operacaoRoutes,
  ...empresaAdminRoutes,
];

export const publicFeatureRoutes = featureRoutes.filter(r => r.public);
export const protectedFeatureRoutes = featureRoutes.filter(r => !r.public);

export function routeMatchesPath(route: PortalRoute, location: string): boolean {
  if (location === route.path) return true;
  if (route.nav?.matchPrefix && location.startsWith(route.nav.matchPrefix)) return true;
  if (route.path.includes(":")) {
    const base = route.path.split("/:")[0];
    if (base && location.startsWith(`${base}/`)) return true;
  }
  return false;
}

/** Portal ativo pela URL (rotas registradas primeiro; depois path do portal). */
export function resolveActivePortal(
  location: string,
  systems: SessionSystems | null | undefined,
  role?: UserRole | null
): (typeof OFFICE_PORTALS)[number] | null {
  const hit = protectedFeatureRoutes.find(
    r => r.system && routeMatchesPath(r, location)
  );
  if (hit?.system && hasPortalAccess(systems, hit.system, role)) {
    return OFFICE_PORTALS.find(p => p.id === hit.system) ?? null;
  }

  const byPath = OFFICE_PORTALS.find(
    p => location === p.path || location.startsWith(`${p.path}/`)
  );
  if (byPath && hasPortalAccess(systems, byPath.id, role)) return byPath;
  return null;
}

/** Telas do portal ativo que têm item de menu e grant. */
export function listPortalNavItems(
  portalId: AccessSystem,
  systems: SessionSystems | null | undefined,
  role?: UserRole | null
) {
  if (!hasPortalAccess(systems, portalId, role)) return [];
  return protectedFeatureRoutes
    .filter(r => r.system === portalId && r.nav)
    .sort((a, b) => (a.nav?.order ?? 100) - (b.nav?.order ?? 100));
}
