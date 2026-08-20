import type { AccessLevel, AccessSystem, UserRole } from "@dap40/types";

export type SessionSystems = Partial<Record<AccessSystem, AccessLevel>>;

/**
 * Portal de desenvolvimento (AIOS / Empresa).
 * Quem tem grant aqui flutua em todas as páginas do projeto — sem auth página a página.
 */
export const DEV_PORTAL_SYSTEM: AccessSystem = "PORTAL-EMPRESA";

/** MASTER ou grant em PORTAL-EMPRESA → acesso livre ao projeto. */
export function hasProjectFloatAccess(
  systems: SessionSystems | null | undefined,
  role?: UserRole | null
): boolean {
  if (role === "MASTER") return true;
  const level = systems?.[DEV_PORTAL_SYSTEM];
  return Boolean(level && level !== "none");
}

/** Portal liberado se level ≠ none (MASTER / float Dev = tudo). */
export function canAccessPortal(
  systems: SessionSystems | null | undefined,
  system: AccessSystem,
  role?: UserRole | null
): boolean {
  if (hasProjectFloatAccess(systems, role)) return true;
  const level = systems?.[system];
  return Boolean(level && level !== "none");
}

/**
 * Página liberada: portal com grant + page_id em access_page_grants.
 * MASTER / float Dev = tudo (sem checar page grant).
 */
export function canAccessPage(opts: {
  role?: UserRole | null;
  systems?: SessionSystems | null;
  system: AccessSystem;
  pageId: string;
  grantedPageIds?: ReadonlySet<string> | readonly string[] | null;
}): boolean {
  if (hasProjectFloatAccess(opts.systems, opts.role)) return true;
  if (!canAccessPortal(opts.systems, opts.system, opts.role)) return false;
  const set =
    opts.grantedPageIds instanceof Set
      ? opts.grantedPageIds
      : new Set(opts.grantedPageIds ?? []);
  return set.has(opts.pageId);
}
