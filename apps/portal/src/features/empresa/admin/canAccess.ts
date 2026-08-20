import type { AccessLevel, AccessSystem, UserRole } from "@dap40/types";

export type SessionSystems = Partial<Record<AccessSystem, AccessLevel>>;

/** Portal liberado se level ≠ none (MASTER = tudo). */
export function canAccessPortal(
  systems: SessionSystems | null | undefined,
  system: AccessSystem,
  role?: UserRole | null
): boolean {
  if (role === "MASTER") return true;
  const level = systems?.[system];
  return Boolean(level && level !== "none");
}

/**
 * Página liberada: portal com grant + page_id em access_page_grants.
 * MASTER = tudo (admin implícito, sem linhas).
 */
export function canAccessPage(opts: {
  role?: UserRole | null;
  systems?: SessionSystems | null;
  system: AccessSystem;
  pageId: string;
  grantedPageIds?: ReadonlySet<string> | readonly string[] | null;
}): boolean {
  if (opts.role === "MASTER") return true;
  if (!canAccessPortal(opts.systems, opts.system, opts.role)) return false;
  const set =
    opts.grantedPageIds instanceof Set
      ? opts.grantedPageIds
      : new Set(opts.grantedPageIds ?? []);
  return set.has(opts.pageId);
}
