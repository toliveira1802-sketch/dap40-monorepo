/** Base URL segment for GestÃ£o screens inside the DAP40 portal. */
export const GESTAO_BASE_PATH = "/gestao";

/** Build a GestÃ£o route path under the portal feature. */
export function gestaoPath(subpath = ""): string {
  if (!subpath || subpath === "/") return GESTAO_BASE_PATH;
  const normalized = subpath.startsWith("/") ? subpath : `/${subpath}`;
  return `${GESTAO_BASE_PATH}${normalized}`;
}

/** @deprecated Use gestaoPath â€” kept for in-feature imports during migration. */
export const MANAGEMENT_BASE_PATH = GESTAO_BASE_PATH;
/** @deprecated Use gestaoPath. */
export const managementPath = gestaoPath;

/** True when pathname is inside the GestÃ£o feature. */
export function isGestaoPath(pathname: string): boolean {
  return pathname === GESTAO_BASE_PATH || pathname.startsWith(`${GESTAO_BASE_PATH}/`);
}

/** @deprecated Use isGestaoPath. */
export const isManagementPath = isGestaoPath;

/** Strip the gestÃ£o base prefix, returning the in-feature subpath (e.g. `/visao-360`). */
export function gestaoSubpath(pathname: string): string {
  if (!isGestaoPath(pathname)) return pathname;
  const rest = pathname.slice(GESTAO_BASE_PATH.length);
  return rest || "/";
}

/** @deprecated Use gestaoSubpath. */
export const managementSubpath = gestaoSubpath;
